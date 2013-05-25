// gyro data capture

var atTitle=true;
var yaw=0, pitch=0, roll=0;

window.ondeviceorientation = function(event) {
	yaw = THREE.Math.degToRad(event.alpha);
	pitch = THREE.Math.degToRad(event.beta);
	roll = THREE.Math.degToRad(event.gamma);
	if(atTitle){
		$("#intro-box").css("-webkit-transform", "skewx(" + 3*Math.sin(5*roll) + "deg) skewy(" + 3*Math.sin(5*pitch) + "deg)");
	}
}