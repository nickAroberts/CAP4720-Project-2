// ... global variables ...


var messageField = null;
// WebGL context
var gl= null;

var fallSpeed = 0.01;
var spinRate = .35;
var spinRateScalar = 1;
var fallSpeedScalar = 1;
var spawnDelayScalar = 1;
var myNear = .9;
var myFar = 3;
var myFOV = 32;
var mySpotAngle = 15;
var useSpot = 1;
var tiltAngle = 0;
var panAngle = 0;
var dollyDisplacement = 0;
var pedDisplacement = 0;
var truckDisplacement = 0;

var model, camera, projMatrix;
var myIntensity = 1;
var myR = 1;
var myG = 1;
var myB = 1;

var myAmbient = .2;

// move rate constant *placeholder, may not be used* --Sammy
var moveRate = 4;

// Arrow keys constants for movement (numbers could be changed to WASD) --Sammy
var keys = { 	
	/*up*/38:0,
	/*down*/40:0,
	/*left*/37:0,
	/*right*/39:0
};

//This function gets called when reading a JSON file. It stores the current xml information.
function parseJSON(jsonFile)
{
	var	xhttp = new XMLHttpRequest();
	xhttp.open("GET", jsonFile, false);
	xhttp.overrideMimeType("application/json");
	xhttp.send(null);	
	var Doc = xhttp.responseText;
	return JSON.parse(Doc);
}

function loadModel(modelfilename)
{
//console.log(modelfilename);
	model = new RenderableModel(gl,parseJSON(modelfilename));
	camera = new Camera(gl,model.getBounds(),[0,1,0],myNear,myFar,myFOV);
	projMatrix = camera.getProjMatrix(myNear,myFar,myFOV);
}

function setSpotAngle(newValue)
{
    if (useSpot)
    {
        mySpotAngle = newValue;
        addMessage("spot angle: " + mySpotAngle);
    }
    else
    {
        mySpotAngle = 180;
        addMessage("spot angle: " + mySpotAngle);
    }
}

function setSpinValue(newValue)
{
    spinRateScalar = newValue;
}

function setFallValue(newValue)
{
    fallSpeedScalar = newValue;
}

function setSpawnValue(newValue)
{
    spawnDelayScalar = newValue*1;
}

function setMyNear(newValue)
{
    myNear = newValue;
    addMessage("near: " + myNear);

}

function setMyFar(newValue)
{
    myFar = newValue;
    addMessage("far: " + myFar);
}

function setMyFOV(newValue)
{
    myFOV = newValue;
    addMessage("FOV: " + myFOV);
}

function setMyTilt(newValue)
{
	tiltAngle = newValue;
	addMessage("TILT:" + tiltAngle);
}

function setMyIntensity(newValue)
{
    myIntensity = newValue;
    addMessage("myIntensity: " + myIntensity);
}

function setMyR(newValue)
{
    myR = newValue;
    addMessage("myR: " + myR);
}

function setMyG(newValue)
{
    myG = newValue;
    addMessage("myG: " + myG);
}

function setMyB(newValue)
{
    myB = newValue;
    addMessage("myB: " + myB);
}

// Placeholder for function to move camera, displays messages for now --Sammy
function moveCamera(deltaX, deltaY) {
	if(deltaX) {
		if(deltaX < 0){
			addMessage('Left was pressed');
		}
		else{
			addMessage('Right was pressed');
		}
	}
	if (deltaY) {
		if(deltaY < 0){
			addMessage('Up was pressed');
		}
		else{
			addMessage('Down was pressed');
		}
	}
}  


function addMessage(message)
{
   var st = "-"+message + "\n";
   messageField.value += st;
}

// Change selected item from dropdown menu
function menuHandler()
{
	isChanged = true;
	m = document.getElementById("menu");
	var id = m.selectedIndex;
	type = m.options[id].text
	addMessage("Selected "+type);
}

function toggleLightingFlag(obj)
{
   addMessage(obj.value+" Flag Toggled");
   if (obj == "Spot")
   {
        useSpot = 1;
   }
   else
   {
        useSpot = 0;
   }
   
   setSpotAngle(mySpotAngle);
}

function setRenderMode(obj)
{
   addMessage("setRenderMode entered with value: "+obj.value);
}

function loadFile(files)
{
   addMessage("File name: "+files[0].name);
}

function init()
{
   function setupMessageArea() 
   {
      messageField = document.getElementById("messageArea");
      document.getElementById("messageClear").setAttribute("onclick","messageField.value='';");
   }
 
	// Below are two listeners for keydown and keyup, creating a mask that accounts for change in
	// up/down and left/right at same time
  	document.addEventListener('keydown', function(e) {
		if(e.keyCode in keys) {
			keys[e.keyCode] = moveRate;
			moveCamera(keys[39] - keys[37], keys[40] - keys[38])
		}
	}, false);
	document.addEventListener('keyup', function(e) {
		if(e.keyCode in keys) {
			keys[e.keyCode] = 0;
			moveCamera(keys[39] - keys[37], keys[40] - keys[38])
		}
	}, false); 
 
 
   setupMessageArea();
   //setupMenu();

   
    function canvasMouseHandler(ev)
    {
      var b = ev.target.getBoundingClientRect();
      addMessage("button: "+ev.button+" event type: "+ev.type+" "+"("+ev.clientX+","+ev.clientY+")"+" of bounding box "+
         "[("+b.top+","+b.left+")"+"("+b.bottom+","+b.right+")]");
      if (ev.ctrlKey)addMessage("CTRL key was down");
      if (ev.shiftKey)addMessage("SHIFT key was down");
      if (ev.altKey)addMessage("ALT key was down");
   }
   var c = document.getElementById('myCanvas');
   addMessage(((c)?"Canvas acquired":"Error: Can not acquire canvas"));
   c.onmousedown=canvasMouseHandler;
   //c.onmouseup=canvasMouseHandler;
   //c.onclick=canvasMouseHandler;
   
   return c;
}

function setupWebGL(canvas) 
{ 
   gl = canvas.getContext("webgl")
      ||canvas.getContext("experimental-webgl"); 
   addMessage("GL Context acquired");
}     

function initViewport(canvas) 
{
   gl.viewport(0, 0, canvas.width, canvas.height);
   addMessage("Viewport initialized");
}  
   
function setupWhatToDraw(obj)
{
    addMessage("Setting up what to draw: " + obj.value);
    // Set the model object based on the string given.
    if (obj.value == "cube")
    {
        addMessage("makin it cube");
        modelObject = cubeObject;
        currScaleFactor = cubeScaleFactor;
    }
    else if (obj.value == "skull")
    {
        addMessage("makin it skull");
        modelObject = skullObject;
        currScaleFactor = skullScaleFactor;
    }
    else
    { 
        addMessage("makin it teapot");
        modelObject = teapotObject;
        currScaleFactor = teapotScaleFactor;
    }
    
    addMessage("currScaleFactor set as: " + currScaleFactor);

}




 
function main()
{
    var modelArray;
    var canvas = init();
    setupWebGL(canvas);
    initViewport(canvas);
    var angle=0;
	
    var modelList = document.getElementById("modelList")
	console.log(modelList.options[modelList.selectedIndex].value);
	loadModel(modelList.options[modelList.selectedIndex].value);

    
    function drawScene()
    {
        //gl.clearColor(myAmbient*myIntensity, myAmbient*myIntensity, myAmbient*myIntensity, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        
        camera = new Camera(gl,model.getBounds(),[0,1,0],myNear,myFar,myFOV);
		camera.tilt(tiltAngle);
		camera.pan(panAngle);
		camera.dolly(dollyDisplacement);
		camera.pedestal(pedDisplacement);
		camera.truck(truckDisplacement);
		
		var viewMatrix = camera.getViewMatrix(undefined);
		
        projMatrix = camera.getProjMatrix(myNear,myFar,myFOV);

               
        model.draw(projMatrix, viewMatrix);
        
        angle += (spinRate*spinRateScalar); 
        if (angle > 360) angle -= 360;
        window.requestAnimationFrame(drawScene);
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //gl.clearColor(myAmbient*myIntensity, myAmbient*myIntensity, myAmbient*myIntensity, 1.0);
    gl.enable(gl.DEPTH_TEST);           
    
    
    addMessage("Drawing scene");
    drawScene();
}