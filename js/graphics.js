// animation backend

var camera, scene, renderer;
var fov = 70;
var earthdir = new THREE.Vector3(0,0,0);

var bodies = [];
var projector = new THREE.Projector();

window.setInterval(function(){
	// switch Earth direction vector
	var x,y,z;
	x = Math.random()-0.5;
	y = Math.random()-0.5;
	z = Math.random()-0.5;
	
	earthdir = new THREE.Vector3(x,y,z);
	earthdir.normalize();
	earthdir.multiplyScalar(0.013);

}, 5000);

function stepPhysics(){
	if(toolActive){
		// project tool from screen to world
		
	    var vec = new THREE.Vector3(  ( toolX / window.innerWidth ) * 2 - 1, - ( toolY / window.innerHeight ) * 2 + 1, 0.5);
	    projector.unprojectVector( vec, camera );
	    vec.normalize();
	    vec.multiplyScalar(200);
	    
	    // attract/repel each body
	    for(var i=0; i<bodies.length; ++i){
	    	var dir = vec.clone();
	    	
	    	dir.sub(bodies[i].mesh.position);
			var len = dir.length();
	    	if(len > 200) continue;

	    	if(!black) dir.multiplyScalar(-1);

	    	dir.normalize();
	    	if(black) dir.multiplyScalar(2/(len+40));
	    	else dir.multiplyScalar(1/(len+40)); // repulsor twice as strong

	    	bodies[i].vel.add(bodies[i].vel, dir);
		}
	}

	var earthsafe = true;

	// collision detection
	for(var i=0; i<bodies.length; ++i){
		for(var j=0; j<i; ++j){
			var dir = bodies[i].mesh.position.clone();
			dir.sub(bodies[j].mesh.position);
			if(dir.length() < bodies[i].radius + bodies[j].radius){
				// collision!
				var acc = dir.clone();
				acc.normalize();
				acc.multiplyScalar(0.2);
				bodies[i].vel.add(acc);

				acc.multiplyScalar(-1);
				bodies[j].vel.add(acc);

				if (i==0 || j==0) earthsafe = false;
				else{
					// non-Earth collisions are good
					score += 10;
				}
			}
		}
	}

	// Earth moves randomly
	bodies[0].vel.add(bodies[0].vel, earthdir);

	if(earthsafe == true) score += 1;
	else score -= 50;

	for(var i=0; i<bodies.length; ++i){
		// increment velocity
		bodies[i].mesh.position.add(bodies[i].mesh.position, bodies[i].vel);

		// increment rotation
		bodies[i].mesh.rotation.x += bodies[i].rx;
		bodies[i].mesh.rotation.y += bodies[i].ry;
		bodies[i].mesh.rotation.z += bodies[i].rz;

		// normalize
		var len = Math.sqrt(bodies[i].mesh.position.x*bodies[i].mesh.position.x + bodies[i].mesh.position.y*bodies[i].mesh.position.y + bodies[i].mesh.position.z*bodies[i].mesh.position.z);
		bodies[i].mesh.position.normalize();
		bodies[i].mesh.position.multiplyScalar(200);

		// dampening
		bodies[i].vel.multiplyScalar(0.998);
	}
}

function initBodies(){
	bodies = [];

	bodies.push({
		radius: 30,
		mesh: new THREE.Mesh( new THREE.SphereGeometry( 30, 30, 20 ),
		new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/earth.jpg' ) } ))
	},
	{
		radius: 30,
		mesh: new THREE.Mesh( new THREE.SphereGeometry( 30, 30, 20 ),
		new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/mars.jpg' ) } ))
	},
	{
		radius: 40,
		mesh: new THREE.Mesh( new THREE.SphereGeometry( 40, 30, 20 ),
		new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/jup.jpg' ) } ))
	},
	{
		radius: 30,
		mesh: new THREE.Mesh( new THREE.SphereGeometry( 30, 30, 20 ),
		new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/nep.jpg' ) } ))
	},
	{
		radius: 20,
		mesh: new THREE.Mesh( new THREE.SphereGeometry( 20, 30, 20 ),
		new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/moon.jpg' ) } ))
	}
	);

	for(var i=0; i<30; ++i){
		// procedural asteroid generation
		var asteroidGeom = new THREE.SphereGeometry( 15, 30, 20 );

		for(var j=0; j<asteroidGeom.vertices.length; ++j){
			asteroidGeom.vertices[j].multiplyScalar(0.9 + 0.2*Math.random());
		}
		asteroidGeom.verticesNeedUpdate = true;
		var asteroidMesh = new THREE.Mesh( asteroidGeom,
			new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/ast.jpg' ) } ));
		asteroidMesh.scale.x = 0.8;
		asteroidMesh.scale.y = 0.8;
		bodies.push({
			radius: 15,
			mesh: asteroidMesh
		});
	}

	var x, y, z;

	// init motion parameters
	for(var i=0; i<bodies.length; ++i){
		// random position
		if(i==0){
			// Earth starts below you
			x = 0; y = 0; z = -1;
		}
		else{
			x = Math.random()-0.5;
			y = Math.random()-0.5;
			z = Math.random()-0.5;
		}
		var len = Math.sqrt(x*x + y*y + z*z);
		x /= len; y /= len; z /= len;
		x *= 200; y *= 200; z *= 200;
		bodies[i].mesh.position.x = x;
		bodies[i].mesh.position.y = y;
		bodies[i].mesh.position.z = z;

		// random drift
		x = Math.random()-0.5;
		y = Math.random()-0.5;
		z = Math.random()-0.5;
		var len = Math.sqrt(x*x + y*y + z*z);
		x /= len; y /= len; z /= len;
		x *= 0.2; y *= 0.2; z *= 0.2;
		bodies[i]["vel"] = new THREE.Vector3(x,y,z);

		// random orientation
		x = Math.random()-0.5;
		y = Math.random()-0.5;
		z = Math.random()-0.5;
		var len = Math.sqrt(x*x + y*y + z*z);
		x *= 3.14*len; y *= 3.14*len; z *= 3.14*len;
		bodies[i].mesh.rotation.x = x;
		bodies[i].mesh.rotation.y = y;
		bodies[i].mesh.rotation.z = z;

		// random rotation
		x = Math.random()-0.5;
		y = Math.random()-0.5;
		z = Math.random()-0.5;
		var len = Math.sqrt(x*x + y*y + z*z);
		x /= len; y /= len; z /= len;
		x *= 0.01; y *= 0.01; z *= 0.01;
		bodies[i]["rx"] = x;
		bodies[i]["ry"] = y;
		bodies[i]["rz"] = z;
	}
}

function init() {
	$("#container").html("");
	var container, mesh;

	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 1100 );
	camera.target = new THREE.Vector3( 1, 0, 0 );
	camera.eulerOrder = 'ZXY';
	
	scene = new THREE.Scene();

	initBodies();

	bg = new THREE.Mesh( new THREE.SphereGeometry( 1000, 60, 40 ),
		new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'pan.jpg' ) } ));
	bg.scale.x = -1;
	scene.add( bg );

	for(var i=0; i<bodies.length; ++i){
		scene.add( bodies[i].mesh );
	}

    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    var ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );

	container.appendChild( renderer.domElement );
}

function animate() {
	var timeLeft = beginTime - (new Date()).getTime();
	if(timeLeft < 0) timeLeft = 0;
	else if(timeLeft > 60000) timeLeft = 60000;
	var timeStr = (timeLeft/1000).toFixed(2);
	timespan.html(timeStr);
	scorespan.html(score);

	if(timeLeft == 0){
		timeUp();
	}

	stepPhysics();

	if(!gamePlaying){
		return;
	}
	requestAnimationFrame( animate );
	render();
}

function render() {
	camera.rotation.z = yaw;
	camera.rotation.x = pitch;
	camera.rotation.y = roll;

	renderer.render( scene, camera );

}
