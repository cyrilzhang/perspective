// game flow control

var gamePlaying = false;
var black = true;

var score;
var time;
var beginTime, timespan, scorespan;
var toolActive = false;

var toolX, toolY;

// touch event bindings
$(function(){
	$("#interact").bind("touchstart", function(e){
		if(gamePlaying){
			toolActive = true;
			toolX = e.originalEvent.touches[0].pageX;
			toolY = e.originalEvent.touches[0].pageY;
			$("#tool").css("top", toolY-50).css("left", toolX-50).show();
			e.preventDefault(); return false;
		}
	});
	//$("#container").bind("gesturestart", f);
	$("#interact").bind("touchmove", function(e){
		if(gamePlaying){
			toolActive = true;
			toolX = e.originalEvent.touches[0].pageX;
			toolY = e.originalEvent.touches[0].pageY;
			$("#tool").css("top", toolY-50).css("left", toolX-50);
			e.preventDefault(); return false;
		}
	});
	$("#interact").bind("touchend", function(e){
		if(gamePlaying){
			toolActive = false;
			$("#tool").hide();
			e.preventDefault(); return false;
		}
	});$("#tool").hide();
});

function beginGame(){
	atTitle = false;
	toolActive = false;
	gamePlaying = true;
	$("#container").show();
	$("#intro").fadeOut({complete:function(){
		score = 0;
		time = 60.0;
		beginTime = (new Date()).getTime() + 65000;
		timespan = $("#timespan");
		scorespan = $("#scorespan");
		$("#interact").show();
		$("#controls").show();
		init();
		animate();

	}});

}

function timeUp(){
	gamePlaying = false;
	$("#tool").hide();
	$("#finalscore").html(score);
	$("#endgame").fadeIn();
	$("#interact").hide();
}

function endGame(){
	$("#container").hide();
	$("#endgame").fadeOut();
	$("#controls").fadeOut({complete:function(){
		$("#intro").fadeIn({complete:function(){atTitle = true;}});
	}});
}

function showInstructions(){
	$("#intro").fadeOut({complete:function(){$("#instructions").fadeIn();}});
}

function hideInstructions(){
	$("#instructions").fadeOut({complete:function(){$("#intro").fadeIn();}});
}

function selectBlack(){
	$("#black").addClass("selected");
	$("#white").removeClass("selected");
	$("#tool").removeClass("whitetool").addClass("blacktool");
	black = true;
}

function selectWhite(){
	$("#black").removeClass("selected");
	$("#white").addClass("selected");
	$("#tool").removeClass("blacktool").addClass("whitetool");
	black = false;
}
