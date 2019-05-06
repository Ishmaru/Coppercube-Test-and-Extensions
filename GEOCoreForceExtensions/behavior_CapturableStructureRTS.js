//RTS Code by Ishmaru

// This behavior mimics RTS Movement, Left Click to select unit/units, and Right click tells them where to go. 
// Left clicking while holding Shift alows you to select multiple units.
// Left clicking while holding Ctrl removes a unit from the selection.
// A Key Selects All units
// Space Un Selects all units
// Units are programed to position themselves randomly around the target point to prevent them from merging into one
// The amount of randomness and space between units acn be controled by the "PositionVariation" and "PositionMultiplier"
// This script assumes you have a hidden child node with the index of 0 (child directly below this node) that will be the selection indicator

//
// The following embedded xml is for the editor and describes how the behavior can be edited:
// Supported types are: int, float, string, bool, color, vect3d, scenenode, texture, action
/*
	<behavior jsname="behavior_CapturableStructureRTS" description="RTS Captureable Structure">
		<property name="Controllable" type="bool" default="true" />
		<property name="HealPerSecond" type="int" default="0" />
		<property name="FactionAFolder" type="scenenode"/>
		<property name="FactionBFolder" type="scenenode"/>
		<property name="Health" type="int" default="50" />
		<property name="StartNetural" type="bool" default="false" />
		<property name="OnCaptureA" type="action"/>
		<property name="OnCaptureB" type="action"/>
		<property name="OnSelect" type="action"/>
		<property name="OffSelect" type="action"/>
		<property name="TimedActionMS" type="int"/>
		<property name="TimedActionA" type="action"/>
		<property name="TimedActionB" type="action"/>
		<property name="AiAction" type="action"/>
		<property name="AiProductionMS" type="int"/>
	</behavior>
*/

behavior_CapturableStructureRTS = function()
{
	this.PressedJump = false;
	this.LastTime = null;
	
	this.loopJumpAnimation = false;
	this.TargetPosition = null;
	this.LastTime = null;
	this.nodeName;
	this.selected = false;
	this.healTime = false;
	this.onAnimateFunctDelay = Math.floor(Math.random()*20);
	this.dead = false;
	this.team = false;
	// this.team = "A";
	this.parent = false;
	this.actionTimer = false;
	this.throttle = 520;

	this.count = 0;
};
// this.maxHealth = this.Health;
// called every frame. 
//   'node' is the scene node where this behavior is attached to.
//   'timeMs' the current time in milliseconds of the scene.
// Returns 'true' if something changed, and 'false' if not.
behavior_CapturableStructureRTS.prototype.onAnimate = function(node, timeMs)
{
	if(!node){
		return false;
	}	
	// if((this.StartNetural && timeMs % 18 == 0) && !this.team){
	if((this.StartNetural && timeMs > this.throttle) && !this.team){
		var arr = ccbGetSceneNodeChildCount(this.FactionAFolder);
		var pos = ccbGetSceneNodeProperty(node, "Position");
		for (i = 0; i < arr; i++) {
			var unit = ccbGetChildSceneNode(this.FactionAFolder, i);
			var unitPos = ccbGetSceneNodeProperty(unit, "Position");
			if((unitPos.x > (pos.x - 30)) && (unitPos.x < (pos.x + 30))){
				if((unitPos.z > (pos.z - 30)) && (unitPos.z < (pos.z + 30))){
					this.team = "A";
					ccbSetSceneNodeParent(node, this.FactionAFolder);
					ccbInvokeAction(this.OnCaptureB, node);
					// this.count  = ccbGetCopperCubeVariable('FactionAGeo');
					// ccbSetCopperCubeVariable("FactionAGeo", this.count + 1);
					// print('hit')
				}
			}
		}
		arr = ccbGetSceneNodeChildCount(this.FactionBFolder);
		pos = ccbGetSceneNodeProperty(node, "Position");
		for (i = 0; i < arr; i++) {
			var unit = ccbGetChildSceneNode(this.FactionBFolder, i);
			var unitPos = ccbGetSceneNodeProperty(unit, "Position");
			if((unitPos.x > (pos.x - 40)) && (unitPos.x < (pos.x + 40))){
				if((unitPos.z > (pos.z - 40)) && (unitPos.z < (pos.z + 40))){
					this.team = "B";
					ccbSetSceneNodeParent(node, this.FactionBFolder);
					ccbInvokeAction(this.OnCaptureA, node);
					// this.count  = ccbGetCopperCubeVariable('FactionBGeo');
					// ccbSetCopperCubeVariable("FactionBGeo", this.count + 1);
					// print('hit')
				}
			}
		}
		this.throttle = timeMs + 350;
	}		


	// if(!this.StartNetural && timeMs < 3000){
	// 		this.team = "A";
	// }
	if(!this.StartNetural && !this.team){
			this.team = "A";
	}

	if(!this.nodeName)
	{
		this.nodeName = ccbGetSceneNodeProperty(node, "Name");
		this.LastTime = timeMs;
		this.animate = node;
		// var children = ccbGetSceneNodeChildCount(node);
		this.fxNode = ccbGetChildSceneNode(node, 1);
		// Set Coppercube Variables to have same name as unit node so we can calculate dammage later We will reference the coppercube variable for the health and this.Health for the Max health value (for healing)
		ccbSetCopperCubeVariable(this.nodeName + "Health", this.Health);
		ccbSetCopperCubeVariable(this.nodeName + "MaxHealth", this.Health);
		//Set Initial Team and Parent
		// this.parent = ccbGetSceneNodeFromName(this.FactionAFolder);
		// ccbSetSceneNodeParent(node, this.parent);
		// ccbInvokeAction(this.OnCapture, node);
	// } else if(this.nodeName.split('_').slice(-1)[0] != "1" && timeMs % 9 == 0){
	} else if(this.nodeName.split('_').slice(-1)[0] != "1" && timeMs > this.throttle){
		if(this.team){
			//if dead perform these actions
			if(ccbGetCopperCubeVariable(this.nodeName + "Health") <= 0){
				this.selected = false;
				this.Controllable = false;
				if(!this.dead){
					this.dead = true;
					if(this.team === "A"){
						this.team = "B";
						// this.parent = ccbGetSceneNodeFromName(this.FactionBFolder);
						ccbSetSceneNodeParent(node, this.FactionBFolder);
						ccbInvokeAction(this.OnCaptureA, node);
						// this.count  = ccbGetCopperCubeVariable('FactionBGeo');
						// ccbSetCopperCubeVariable("FactionBGeo", this.count + 1);
						// print("Switch Team B")

					}else{
						this.team = "A";
						// this.parent = ccbGetSceneNodeFromName(this.FactionAFolder);
						ccbSetSceneNodeParent(node, this.FactionAFolder);
						ccbInvokeAction(this.OnCaptureB, node);
						// this.count  = ccbGetCopperCubeVariable('FactionAGeo');
						// ccbSetCopperCubeVariable("FactionAGeo", this.count + 1);
						// print("Switch Team A")
					}
					// ccbInvokeAction(this.OnCapture, node);
					//Switch Controllable Mode
					if(this.Controllable == true){
						this.Controllable = false;
					}else{
						this.Controllable = true;
					}
					//Reset health to Max
					ccbSetCopperCubeVariable(this.nodeName + "Health", this.Health);
				}
				var selNode = ccbGetChildSceneNode(node, 0);
				ccbSetSceneNodeProperty(selNode, "Visible", false);
				
				// return false
			}else{
				this.dead = false;
				// If Healing > 0 heal per socond
				if(!this.healTime){
					this.healTime = timeMs;
					var maxHealth = ccbGetCopperCubeVariable(this.nodeName + "MaxHealth");
					var health = ccbGetCopperCubeVariable(this.nodeName + "Health");
					// print(this.nodeName + "Health:" + health);
					// if(health < (maxHealth - this.HealPerSecond)){
					if(health < (maxHealth - 1)){
						// health = health + this.HealPerSecond;
						health = health + 1;
					}else{
						health = maxHealth;
					}
						// health = health + this.HealPerSecond;
					ccbSetCopperCubeVariable(this.nodeName + "Health", health);
				}else{
					if(timeMs > (this.healTime + 1000)){
						this.healTime = false;
					}
				}
				// get the time since the last frame
				var selNode = ccbGetChildSceneNode(node, 0);
				if(selNode){
					if(this.selected){
						ccbSetSceneNodeProperty(selNode, "Visible", true);
					}else{
						ccbSetSceneNodeProperty(selNode, "Visible", false);
					}	
				}
				// if (this.LastTime == null)
				// {
				// 	this.LastTime = timeMs; // we were never called before, so store the time and cancel
				// 	return false;
				// }
				
				// this.LastNodeUsed = node;
				
				// var timeDiff = timeMs - this.LastTime;
				// this.LastTime = timeMs;
				// if (timeDiff > 200) timeDiff = 200;
				
				
			}
			//timed actions
			if(!this.actionTimer){
				this.actionTimer = this.TimedActionMS;
			}
			if(timeMs >= this.actionTimer){
				this.actionTimer = timeMs + this.TimedActionMS;
				// ccbInvokeAction(this.TimedAction, node);
				if(ccbGetCopperCubeVariable("Start") == 1){
					if(this.team == "A"){
						ccbInvokeAction(this.TimedActionA, node);
					}else if(this.team == "B"){
						ccbInvokeAction(this.TimedActionB, node);
						// var teamName = ccbGetSceneNodeProperty(this.FactionAFolder, "Name");
					}
				}
			}

			// Basic Ai Control
			if(timeMs % this.AiProductionMS < 100){
				if(!this.Controllable && ccbGetCopperCubeVariable(this.nodeName + "Health") > 0){
					ccbInvokeAction(this.OnSelect, this.animate);	
				}
			}
		}	
		this.throttle = timeMs + 720;
	}
	return true;
}

// parameters: key: key id pressed or left up.  pressed: true if the key was pressed down, false if left up
behavior_CapturableStructureRTS.prototype.onKeyEvent = function(code, down)
{
	// 	if(this.nodeName.split('_').slice(-1)[0] != "1"){
	// 	// store which key is down
	// 	// key codes are this: left=37, up=38, right=39, down=40
	// 	//A key Selects All units
	// 	if(code == 65 && down){
	// 		if(this.Controllable == true){
	// 			this.selected = true;
	// 		}
	// 	}
	// 	// Shift Key allows for multiple selections
	// 	if(code == 160 && down){
	// 		this.shiftSelect = true;
	// 	}else{
	// 		this.shiftSelect = false;
	// 	}
	// 	// Control Key allows for subtracting selections
	// 	if(code == 162 && down){
	// 		this.ctrlSelect = true;
	// 	}else{
	// 		this.ctrlSelect = false;
	// 	}
	// 	// Clear Selection with Spacebar
	// 	if (code == 32 && down)
	// 		// this.PressedJump = true;
	// 		this.selected = false;
	// 	if (code == 83 && down){
	// 		// this.PressedJump = true;
	// 		this.attackStart = false;
	// 		this.enemyTarget = false;
	// 		this.bMovingForward = false;
	// 		this.TargetPosition = null;
	// 	}
	// }
}

// mouseEvent: 0=move moved, 1=mouse clicked, 2=left mouse up,  3=left mouse down, 4=right mouse up, 5=right mouse up
behavior_CapturableStructureRTS.prototype.onMouseEvent = function(mouseEvent, mouseWheelDelta)
{
	//Prevents you from selecting the first entity - Keeps one copy for cloning
	if(this.nodeName.split('_').slice(-1)[0] != "1"){
		// we currently don't support move event. But for later use maybe.
		//DISPLAY OPTIONS
		var grabAction = ccbGetCopperCubeVariable("Action");
		if (mouseEvent == 5 || (mouseEvent == 2 && grabAction == 1))
		{	
			if(this.selected){
	
			}
		}
		else if(mouseEvent == 2){
			var mouseX = ccbGetMousePosX();
			var mouseY = ccbGetMousePosY();
			var cube = ccbGetSceneNodeFromName(this.nodeName);  
			var endPoint3d = ccbGet3DPosFrom2DPos(mouseX, mouseY);
			var startPos3D = ccbGetSceneNodeProperty(ccbGetActiveCamera(), "Position");
			if (ccbDoesLineCollideWithBoundingBoxOfSceneNode(cube, startPos3D.x, startPos3D.y,startPos3D.z, endPoint3d.x, endPoint3d.y, endPoint3d.z))
			{
				if(this.Controllable){
					this.selected = true;
					ccbInvokeAction(this.OnSelect, this.animate);	
				}
			}
			else
			{
				this.selected = false;
				ccbInvokeAction(this.OffSelect, this.animate);	
			}
		}
	}
}

