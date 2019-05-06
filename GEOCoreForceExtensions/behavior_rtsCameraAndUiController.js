// This is a coppercube behavior simple rts camera controller.
//
// The following embedded xml is for the editor and describes how the behavior can be edited:
// Supported types are: int, float, string, bool, color, vect3d, scenenode, texture, action
/*
	<behavior jsname="behavior_rtsCameraAndUiController" description="RTS camera controller with UI">
		<property name="Speed" type="float" default="0.3" />
		<property name="PanThickness" type="float" default="10.0" />
		<property name="Up" type="int" default="38" />
		<property name="Down" type="int" default="40" />
		<property name="Left" type="int" default="37" />
		<property name="Right" type="int" default="39" />
		<property name="MinZoom" type="float" default="20.0" />
		<property name="MaxZoom" type="float" default="100.0" />
		<property name="ZoomSpeed" type="float" default="1.6" />
		<property name="MaxListSize" type="int" default="10" />
		<property name="RemoveTime" type="int" default="6000" />
		<property name="MSGVariableName" type="string" default="message" />
		<property name="MSGCode1" type="string" default="Unit Ready." />
		<property name="MSGCode2" type="string" default="Unit Lost." />
		<property name="MSGCode3" type="string" default="Scare Credits." />
		<property name="MSGCode4" type="string" default="Core Obtained." />
		<property name="MSGCode5" type="string" default="Core Lost." />
		<property name="MSGCode6" type="string" default="Core Seized." />
		<property name="MSGCode7" type="string" default="Battle Initialize." />
		<property name="MSGCode8" type="string" default="Reinforcements." />
		<property name="MSGCode9" type="string" default="Enemy Reinforcements." />
		<property name="MSGCode10" type="string" default="Hotkey1 Set" />
		<property name="MSGCode11" type="string" default="Hotkey2 Set" />
		<property name="MSGCode12" type="string" default="Hotkey3 Set" />
		<property name="MSGCode13" type="string" default="Select All" />
		<property name="MSGCode14" type="string" default="Select Screen" />
	</behavior>
*/

behavior_rtsCameraAndUiController = function()
{
	this.LastTime = null;
	this.LastMsg = null;
	this.CurrentNode = null;
	
	this.Camera = null;
	this.CameraDelta = new vector3d(0,0,0);
	this.CamStartPosY = 0;
	
	this.MoveUp = false;
	this.MoveDown = false;
	this.MoveLeft = false;
	this.MoveRight = false;

	this.msgArr = [];
	this.trottle = 53;

	this.targetZoomValue = 90;
};


// called every frame. 
//   'node' is the scene node where this behavior is attached to.
//   'timeMs' the current time in milliseconds of the scene.
// returns 'true' if something changed, and 'false' if not.
behavior_rtsCameraAndUiController.prototype.onAnimate = function(node, timeMs)
{
	if(!this.platform){
		this.platform =  ccbGetPlatform();
	}
	// get the time since the last frame
	
	if (this.LastTime == null)
	{
		this.LastTime = timeMs; // we were never called before, so store the time and cancel
		this.lastMsg = timeMs;
		this.MessageNode = ccbGetSceneNodeFromName('Message Overlay');
		// set current node
		this.CurrentNode = node;
		
		// get the camera node 
		this.Camera = ccbGetActiveCamera();
		var camPos = ccbGetSceneNodeProperty(this.Camera, 'Position');
		var objPos = ccbGetSceneNodeProperty(node, 'Position');
		this.CameraDelta =  camPos.substract(objPos);
		this.CamStartPosY = camPos.y;
		
		return false;
	}
	//Get CopperCube Variables to communicate with swipe/gesture behavior  Only for Android
	// if(this.platform == "android"){
		var upKey = ccbGetCopperCubeVariable('UpKey');
		var downKey = ccbGetCopperCubeVariable('DownKey');
		var leftKey = ccbGetCopperCubeVariable('LeftKey');
		var rightKey = ccbGetCopperCubeVariable('RightKey');

		if(upKey == 1){
			this.timeUp = timeMs + 1000;
			ccbSetCopperCubeVariable('UpKey', 0);
		}
		if(downKey == 1){
			this.timeDown = timeMs + 1000;
			ccbSetCopperCubeVariable('DownKey', 0);
		}
		if(leftKey == 1){
			this.timeLeft = timeMs + 1000;
			ccbSetCopperCubeVariable('LeftKey', 0);
		}
		if(rightKey == 1){
			this.timeRight = timeMs + 1000;
			ccbSetCopperCubeVariable('RightKey', 0);
		}
		if(timeMs < this.timeUp){
			this.MoveUp = true;
		} else {
			this.MoveUp = false;
		}
		if(timeMs < this.timeDown){
			this.MoveDown = true;
		} else {
			this.MoveDown = false;
		}
		if(timeMs < this.timeLeft){
			this.MoveLeft = true;
		} else {
			this.MoveLeft = false;
		}
		if(timeMs < this.timeRight){
			this.MoveRight = true;
		} else {
			this.MoveRight = false;
		}
	// }

	
	var delta = timeMs - this.LastTime;
	this.LastTime = timeMs;
	if (delta > 200) delta = 200;
	
	// mouse movement
	var mouseX = ccbGetMousePosX();
	var mouseY = ccbGetMousePosY();
	var width = ccbGetScreenWidth();
	var height = ccbGetScreenHeight();
	
	// move camera with keys
	var position = ccbGetSceneNodeProperty(node, 'Position');
	if (this.clicked){
		if ((this.MoveUp == true) || (mouseY <= this.PanThickness))
			position.z += this.Speed * delta;
		if ((this.MoveDown == true) || (mouseY >= height - this.PanThickness))
			position.z -= this.Speed * delta;
		if ((this.MoveLeft == true) || (mouseX <= this.PanThickness))
			position.x -= this.Speed * delta;
		if ((this.MoveRight == true) || (mouseX >= width - this.PanThickness))
			position.x += this.Speed * delta;
	}
	
	ccbSetSceneNodeProperty(node, 'Position', position);
	
	// camera follow controller
	var objPos = ccbGetSceneNodeProperty(node, 'Position');
	var newPos = objPos.add(this.CameraDelta);
	newPos.y = newPos.y + this.CamStartPosY;
	
	ccbSetSceneNodeProperty(this.Camera, 'Position', newPos);
	ccbSetSceneNodeProperty(this.Camera, 'Target', objPos);
	




	// MESSAGE LOG CODE

	// check CCB Message Varaible Depending on which code add message to array
	var msg = ccbGetCopperCubeVariable(this.MSGVariableName);
	if(msg > 0){
		if(msg == 1){
			this.msgArr.push(this.MSGCode1);
		}else if(msg == 2){
			this.msgArr.push(this.MSGCode2);
		}else if(msg == 3){
			this.msgArr.push(this.MSGCode3);
		}else if(msg == 4){
			this.msgArr.push(this.MSGCode4);
		}else if(msg == 5){
			this.msgArr.push(this.MSGCode5);
		}else if(msg == 6){
			this.msgArr.push(this.MSGCode6);
		}else if(msg == 7){
			this.msgArr.push(this.MSGCode7);
		}else if(msg == 8){
			this.msgArr.push(this.MSGCode8);
		}else if(msg == 9){
			this.msgArr.push(this.MSGCode9);
		}else if(msg == 10){
			this.msgArr.push(this.MSGCode10);
		}else if(msg == 11){
			this.msgArr.push(this.MSGCode11);
		}else if(msg == 12){
			this.msgArr.push(this.MSGCode12);
		}else if(msg == 13){
			this.msgArr.push(this.MSGCode13);
		}else if(msg == 14){
			this.msgArr.push(this.MSGCode14);
		}

		//Check if array is to large and delete oldest message
		if(this.msgArr.length > 10){
			this.msgArr.shift();
		}

		// Render Text this assumes this script is on 2D Overlay
		// var renderText = this.msgArr.join('     ');
		// var renderText = this.msgArr.join('\r\n');
		ccbSetSceneNodeProperty(this.MessageNode, "Text", this.msgArr.join('     '));

		// Reset Message Variable
		msg = 0;
		ccbSetCopperCubeVariable(this.MSGVariableName, 0);
	}
		// print(timeMs +':'+(this.LastTime + this.RemoveTime))

	// Every RemoveTime delay, remove the oldest message
	if(this.msgArr.length > 0 && timeMs > this.LastMsg + this.RemoveTime){
		this.msgArr.shift();
		this.LastMsg = timeMs;
		// var renderText = this.msgArr.join('\r\n');
		ccbSetSceneNodeProperty(this.MessageNode, "Text", this.msgArr.join('     '));
	}









	//ZOOM CODE
  
	var cam = ccbGetActiveCamera();	
	var newFov = ccbGetSceneNodeProperty(cam, 'FieldOfView_Degrees');
				
	// if (this.targetZoomValue < this.MinZoom)
	// 	this.targetZoomValue = this.MinZoom;
	// if (this.targetZoomValue > this.MaxZoom)
	// 	this.targetZoomValue = this.MaxZoom;
			
	var localZoomSpeed = this.ZoomSpeed;				
	localZoomSpeed = Math.abs(this.targetZoomValue - newFov) / 8.0;
	if (localZoomSpeed  < this.ZoomSpeed)
		localZoomSpeed = this.ZoomSpeed;
									
	if (newFov < this.MaxZoom-localZoomSpeed && newFov < this.targetZoomValue)
	{
		newFov += localZoomSpeed;
		if (newFov > this.MaxZoom)
			newFov = this.MaxZoom;
	}
	
	if (newFov > this.MinZoom+localZoomSpeed && newFov > this.targetZoomValue)
	{
		newFov -= localZoomSpeed;
		if (newFov < this.MinZoom)
			newFov = this.MaxZoom;
	}	
// print(newFov)
	ccbSetSceneNodeProperty(cam, 'FieldOfView_Degrees', newFov);


	return true;
}

// parameters: key: key id pressed or left up.  pressed: true if the key was pressed down, false if left up
behavior_rtsCameraAndUiController.prototype.onKeyEvent = function(key, pressed)
{
	// store which key is down but only for non Mobile devices
		// camera up movement
		// if (key == this.Up)
		// {
		// 	if (pressed)
		// 		this.MoveUp = true;
		// 	else
		// 		this.MoveUp = false;
		// }
		// // camera down movement
		// if (key == this.Down)
		// {
		// 	if (pressed)
		// 		this.MoveDown = true;
		// 	else
		// 		this.MoveDown = false;
		// }
		// // camera left movement
		// if (key == this.Left)
		// {
		// 	if (pressed)
		// 		this.MoveLeft = true;
		// 	else
		// 		this.MoveLeft = false;
		// }
		// // camera right movement
		// if (key == this.Right)
		// {
		// 	if (pressed)
		// 		this.MoveRight = true;
		// 	else
		// 		this.MoveRight = false;
		// }
}

		

// mouseEvent: 0=move moved, 1=mouse clicked, 2=left mouse up,  3=left mouse down, 4=right mouse down, 5=right mouse up
behavior_rtsCameraAndUiController.prototype.onMouseEvent = function(mouseEvent, mouseWheelDelta)
{
	// SCROLL CODE
	if (mouseEvent == 3) {
		this.clicked = true;
	}

	if (mouseEvent == 2) {
		this.clicked = false;
	}



	// ZOOM CODE
	if (mouseEvent == 1){
		// mouse wheel
		this.targetZoomValue += mouseWheelDelta * this.ZoomSpeed;
			print(this.targetZoomValue);	 
		 if (this.targetZoomValue < this.MinZoom)
			this.targetZoomValue = this.MinZoom;
			
		 if (this.targetZoomValue > this.MaxZoom)
			this.targetZoomValue = this.MaxZoom;
	}
}
