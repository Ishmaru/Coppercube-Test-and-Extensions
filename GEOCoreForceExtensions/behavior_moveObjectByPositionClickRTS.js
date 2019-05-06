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
	<behavior jsname="behavior_moveObjectByPositionClickRTS" description="RTS Movement Click">
		<property name="Controllable" type="bool" default="true" />
		<property name="Speed" type="float" default="0.04" />
		<property name="RotateSpeed" type="float" default="300" />		
		<property name="StandAnimation" type="string" default="stand" />
		<property name="WalkAnimation" type="string" default="walk" />
		<property name="AttackAnimation" type="string" default="shoot" />
		<property name="DieAnimation" type="string" default="die" />
		<property name="HealPerSecond" type="int" default="0" />
		<property name="EnemyFolder" type="scenenode"/>
		<property name="PositionVariation" type="float" default="40" />
		<property name="PositionMultiplier" type="float" default="4" />
		<property name="AttackWhileMoving" type="bool" default="false" />
		<property name="LookAtTarget" type="bool" default="true" />
		<property name="Health" type="int" default="50" />
		<property name="AttackStrength" type="int" default="10" />
		<property name="AttackRng" type="int" default="1" />
		<property name="AttackDelay" type="int" default="500" />
		<property name="AttackRange" type="int" default="100" />
		<property name="ArmorAName" type="string" default="INF" />
		<property name="ArmorBName" type="string" default="VEH" />
		<property name="ArmorCName" type="string" default="HEV" />
		<property name="ArmorAMultiplier" type="float" default="1" />
		<property name="ArmorBMultiplier" type="float" default="1" />
		<property name="ArmorCMultiplier" type="float" default="1" />
		<property name="OnDeath" type="action"/>
		<property name="OnSelect" type="action"/>
		<property name="OnAction" type="action"/>
		<property name="OnAttack" type="action"/>
		<property name="On100Percent" type="action"/>
		<property name="On80Percent" type="action"/>
		<property name="On60Percent" type="action"/>
		<property name="On40Percent" type="action"/>
		<property name="On20Percent" type="action"/>
	</behavior>
*/

behavior_moveObjectByPositionClickRTS = function()
{
	this.PressedJump = false;
	this.LastTime = null;
	this.JumpForce = 0;
	this.JumpLengthMs = 1000;
	
	this.loopJumpAnimation = false;
	this.TargetPosition = null;
	this.LastTime = null;
	this.nodeName;
	this.selected = false;
	this.attackStart = false;
	this.enemyTarget = false;
	this.healTime = false;
	this.onAnimateFunctDelay = Math.floor(Math.random()*30);
	this.dead = false;
	this.trottle = 220;
	this.defend = false;

	this.hotkey1 = false;
	this.hotkey2 = false;
	this.hotkey3 = false;
};
// this.maxHealth = this.Health;
// called every frame. 
//   'node' is the scene node where this behavior is attached to.
//   'timeMs' the current time in milliseconds of the scene.
// Returns 'true' if something changed, and 'false' if not.
behavior_moveObjectByPositionClickRTS.prototype.onAnimate = function(node, timeMs)
{

	function getRandomValue(){
		var a = Math.floor(Math.random()*200) * 10;
		var b = Math.floor(Math.random()*200) * 10;
		return a - b;
	}

	if(!node){
		return false;
	}
	if(!this.nodeName)
	{
		this.nodeName = ccbGetSceneNodeProperty(node, "Name");
		this.LastTime = timeMs;
		var children = ccbGetSceneNodeChildCount(node);
		this.animate = node;
		var me = this;
		this.fxNode = ccbGetChildSceneNode(node, 1);
		// Set Coppercube Variables to have same name as unit node so we can calculate dammage later We will reference the coppercube variable for the health and this.Health for the Max health value (for healing)
		var upgrade = ccbGetCopperCubeVariable(this.nodeName.split('_')[1] + 'Upgrade');
		ccbSetCopperCubeVariable(this.nodeName + "Health", this.Health + (this.Health * (0.3 * upgrade)));
		ccbSetCopperCubeVariable(this.nodeName + "MaxHealth", this.Health + (this.Health * (0.3 * upgrade)));
		// print(Math.floor((2 * 2) + (2 * (0.3 * upgrade))))
		// print(this.nodeName +':'+ (this.Health + (this.Health * (0.3 * upgrade))))

		if(!ccbGetSceneNodeProperty(node, "Animation")){
			// print('second')
			this.animate = ccbGetChildSceneNode(node, children-1);
		}
		// this.healthUi = 
		// this.tex100 = ccbLoadTexture("convertedmodels/rtshealth100sm.png");
		// this.tex80 = ccbLoadTexture("convertedmodels/rtshealth80sm.png");
		// this.tex60 = ccbLoadTexture("convertedmodels/rtshealth60sm.png");
		// this.tex40 = ccbLoadTexture("convertedmodels/rtshealth40sm.png");
		// this.tex20 = ccbLoadTexture("convertedmodels/rtshealth20sm.png");
	} else if(this.nodeName.split('_').slice(-1)[0] != "1"){


		//Unit Upgrade Code
		var upgrade = ccbGetCopperCubeVariable(this.nodeName.split('_')[1] + 'Upgrade');
		ccbSetCopperCubeVariable(this.nodeName + "MaxHealth", this.Health + (this.Health * (0.3 * upgrade)))
		//if dead perform these actions

		if(ccbGetCopperCubeVariable(this.nodeName + "Health") <= 0){
			this.selected = false;
			this.Speed = 0;
			this.Controllable = false;
			this.selected = false;
			this.hotkey1 = false;
			this.hotkey2 = false;
			this.hotkey3 = false;
			if(!this.dead){
				ccbInvokeAction(this.OnDeath, node);
				this.dead = true;
			}
			var selNode = ccbGetChildSceneNode(node, 0);
			ccbSetSceneNodeProperty(selNode, "Visible", false);
			
			// return false
		}else{
			// If Healing > 0 heal per socond
			if(!this.healTime){
				this.healTime = timeMs;
				var maxHealth = ccbGetCopperCubeVariable(this.nodeName + "MaxHealth");
				var health = ccbGetCopperCubeVariable(this.nodeName + "Health");

				// //Health Bar Update
				// if(health / maxHealth > 0) {
				// 	if(health / maxHealth > 0.80){
				// 		ccbSetSceneNodeMaterialProperty(node, 0, "Texture1", this.tex100);
				// 		// ccbInvokeAction(this.On100Percent);
				// 	}else if(health / maxHealth > 0.60){
				// 		ccbSetSceneNodeMaterialProperty(node, 0, "Texture1", this.tex80);
				// 		// ccbInvokeAction(this.On80Percent);
				// 	}else if(health / maxHealth > 0.40){
				// 		ccbSetSceneNodeMaterialProperty(node, 0, "Texture1", this.tex60);
				// 		// ccbInvokeAction(this.On60Percent);
				// 	}else if(health / maxHealth > 0.20){
				// 		ccbSetSceneNodeMaterialProperty(node, 0, "Texture1", this.tex40);
				// 		// ccbInvokeAction(this.On40Percent);
				// 	}else if(health / maxHealth > 0) {
				// 		ccbSetSceneNodeMaterialProperty(node, 0, "Texture1", this.tex20);
				// 		// ccbInvokeAction(this.On20Percent);
				// 	}
				// }
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
				if(timeMs > (this.healTime + 2000)){
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
			if (this.LastTime == null)
			{
				this.LastTime = timeMs; // we were never called before, so store the time and cancel
				return false;
			}
			
			this.LastNodeUsed = node;
			
			var timeDiff = timeMs - this.LastTime;
			this.LastTime = timeMs;
			if (timeDiff > 200) timeDiff = 200;
			
			var currentRot = ccbGetSceneNodeProperty(node, 'Rotation');	
			var pos = ccbGetSceneNodeProperty(node, 'Position');
			var directionForward = new vector3d(0.0,0.0,0.0);
			var lengthToGo = 0.0;
			this.bMovingForward = false;
				
			// get wanted rotation

			if (this.TargetPosition != null)
			{
				directionForward = this.TargetPosition.substract(pos);
				directionForward.Y = 0.0;
				lengthToGo = directionForward.getLength();
				this.bMovingForward = lengthToGo > (this.Speed * 200);
								
				if (this.bMovingForward)
				{
					var angley = Math.atan2(directionForward.x, directionForward.z) * (180.0 / 3.14159265358);

					if (angley < 0.0) angley += 360.0;
					if (angley >= 360.0) angley -= 360.0;
						
					ccbSetSceneNodeProperty(node, 'Rotation', 0.0, angley, 0.0);
				}
			}
			
			if (this.bMovingForward && !this.attackStart)
			{
				// move forward/backward
				this.attackStart = false;
				var speed = this.Speed * timeDiff;
				
				directionForward.normalize();
				pos.x += directionForward.x * speed;
				// pos.y += directionForward.y * speed;
				pos.z += directionForward.z * speed;
			}

			// set position
			
			ccbSetSceneNodeProperty(node, 'Position', pos); 
			

			// var enemy = ccbGetSceneNodeFromName()
			// if(timeMs > this.onAnimateFunctDelay && timeMs % 9 < 2){
			if(timeMs > this.onAnimateFunctDelay && timeMs > this.trottle){
				if(!this.bMovingForward || this.AttackWhileMoving){
					var count = ccbGetSceneNodeChildCount(this.EnemyFolder);
					if(count > 0){
						for(var i=0; i<count; ++i)
						{
							var child = ccbGetChildSceneNode(this.EnemyFolder, i);
							var enemyPos = ccbGetSceneNodeProperty(child, "Position");
							if(((pos.x > (enemyPos.x - this.AttackRange)) && (pos.x < (enemyPos.x + this.AttackRange))) && !this.enemyTarget){
								if((pos.z > (enemyPos.z - this.AttackRange)) && (pos.z < (enemyPos.z + this.AttackRange))){
									var enemyName = ccbGetSceneNodeProperty(child, "Name");
									var enemyHealth = ccbGetCopperCubeVariable(enemyName + "Health");
									if(enemyHealth > 0  && !this.enemyTarget){
										if(!this.enemyTarget){
											this.enemyTarget = child;	
										}
										this.TargetPosition = null;
										this.bMovingForward = null;

									}else{
										if(this.AttackWhileMoving){
											if(!this.TargetPosition && !this.enemyTarget){
												this.TargetPosition = ccbGetSceneNodeProperty(child, "Position");
												this.TargetPosition.x = this.TargetPosition.x + (Math.floor(Math.random() * this.PositionVariation)) - (Math.floor(Math.random() * this.PositionVariation));
												this.TargetPosition.z = this.TargetPosition.z + (Math.floor(Math.random() * this.PositionVariation)) - (Math.floor(Math.random() * this.PositionVariation));
											}
										}
										this.enemyTarget = false;
										// this.attackStart = false;
									}
									// Dammage Calculation
									// Gets Prefix value of the name to compare to this.Armor(A,B, or C)Name and Multiplies dammage based on result
									if(!this.attackStart && this.enemyTarget){
										this.attackStart = timeMs;

										//Rotation Code
										if(this.LookAtTarget){							
											directionForward = enemyPos.substract(pos);
											directionForward.Y = 0.0;
											lengthToGo = directionForward.getLength();
											this.bMovingForward = lengthToGo > (this.Speed * 200);
															
											if (this.bMovingForward)
											{
												var angley = Math.atan2(directionForward.x, directionForward.z) * (180.0 / 3.14159265358);

												if (angley < 0.0) angley += 360.0;
												if (angley >= 360.0) angley -= 360.0;
													
												ccbSetSceneNodeProperty(node, 'Rotation', 0.0, angley, 0.0);
												this.bMovingForward = false;
											}
										}
										//Attack FX
										ccbSetSceneNodeProperty(this.fxNode, "Visible", true);
										ccbInvokeAction(this.OnAttack, node);
										// Dammage Calculation
										var targetName = ccbGetSceneNodeProperty(this.enemyTarget, "Name");
										var targetHealth = ccbGetCopperCubeVariable(targetName + "Health");
										var baseDammage =  Math.ceil(Math.random()*this.AttackRng)*this.AttackStrength;
										//(base dammage + multiplier) + upgrade bonus
										if(targetName.split("_")[0] == this.ArmorAName){
											baseDammage = Math.floor((baseDammage * this.ArmorAMultiplier) + (this.ArmorAMultiplier * (0.3 * upgrade)));
										}else if(targetName.split("_")[0] == this.ArmorBName){
											baseDammage = Math.floor((baseDammage * this.ArmorBMultiplier) + (this.ArmorBMultiplier * (0.3 * upgrade)));
										}else if(targetName.split("_")[0] == this.ArmorCName){
											baseDammage = Math.floor((baseDammage * this.ArmorCMultiplier) + (this.ArmorCMultiplier * (0.3 * upgrade)));
										}
										ccbSetCopperCubeVariable(targetName + "Health", targetHealth - baseDammage);
										// print('attacking ' + targetName + ":" + (targetHealth - baseDammage));
									}
									// if(timeMs > (this.attackStart + this.AttackDelay)){
									// 	this.attackStart = false;
									// }
								}else{
									this.enemyTarget = false;
								}
							}else{
								this.enemyTarget = false;
							}					
						}
					}				

				}
				this.onAnimateFunctDelay = this.onAnimateFunctDelay + 200;
			}
			if(timeMs > (this.attackStart + this.AttackDelay)){
				this.attackStart = false;
			}
		}
		if(timeMs > (this.attackStart + 150))
		{
			ccbSetSceneNodeProperty(this.fxNode, "Visible", false);
		}
		// if(timeMs % 9 < 1){
		if(timeMs > this.trottle){
			if(ccbGetCopperCubeVariable(this.nodeName + "Health") <= 0){
				ccbSetSceneNodeProperty(this.animate, 'Animation', this.DieAnimation);
				ccbSetSceneNodeProperty(this.animate, 'Looping', false);
			}
			else if (this.bMovingForward && ccbGetCopperCubeVariable(this.nodeName + "Health") > 0)
			{
				ccbSetSceneNodeProperty(this.animate, 'Animation', this.WalkAnimation);
				ccbSetSceneNodeProperty(this.animate, 'Looping', true);
			}
			else if((this.enemyTarget || this.attackStart) && ccbGetCopperCubeVariable(this.nodeName + "Health") > 0)
			{
				ccbSetSceneNodeProperty(this.animate, 'Animation', this.AttackAnimation);
				ccbSetSceneNodeProperty(this.animate, 'Looping', true);
			}
			else
			{
				ccbSetSceneNodeProperty(this.animate, 'Animation', this.StandAnimation);
				ccbSetSceneNodeProperty(this.animate, 'Looping', true);
			}
			this.trottle = timeMs + 420;
		}



		//Basic Ai Control
		if(ccbGetCopperCubeVariable("Start") == 1){
			if(this.nodeName.split('_').slice(-1)[0] != "1"){
				if(!this.Controllable && ccbGetCopperCubeVariable(this.nodeName + "Health") > 0){
					if((timeMs % 10000 < 100 && !this.bMovingForward) && !this.enemyTarget){
						if(this.AttackWhileMoving){
							var neturalFolder = ccbGetSceneNodeFromName("Netural");
							var neturalList = ccbGetSceneNodeChildCount(neturalFolder);
							if(Math.floor(Math.random() * 5) > 1 && neturalList > 0){
								var neturalIndex = Math.floor(Math.random() * neturalList);
								var NUChild = ccbGetChildSceneNode(neturalFolder, neturalIndex);
								var NUChildPos = ccbGetSceneNodeProperty(NUChild, "Position");
								NUChildPos.x = NUChildPos.x + Math.floor(Math.random() * (this.PositionVariation / 2));
								NUChildPos.z = NUChildPos.z + Math.floor(Math.random() * (this.PositionVariation / 2));
								this.TargetPosition = NUChildPos;
							}else{
								//Minus the off stage prototypes
								var enemyList = (ccbGetSceneNodeChildCount(this.EnemyFolder) - 6);
								if(enemyList > 1){
									//Add off stage prototypes to prevent them from being selected
									var enemyIndex = (Math.floor(Math.random() * enemyList) + 6);
									var TPChild = ccbGetChildSceneNode(this.EnemyFolder, enemyIndex);
									var TPChildPos = ccbGetSceneNodeProperty(TPChild, "Position");
									TPChildPos.x = TPChildPos.x + (Math.floor(Math.random() * this.PositionVariation) * this.PositionMultiplier);
									TPChildPos.z = TPChildPos.z + (Math.floor(Math.random() * this.PositionVariation) * this.PositionMultiplier);
									this.TargetPosition = TPChildPos;
								}
							}
						}else{
							// If no AttackWhileMoving enabled, assume unit is defensive unit check if it is currentlty defending. 
							if(!this.defend){
								//If not, find a owned geonode
								var currFaction = ccbGetSceneNodeFromName("Enemy");
								var currFactionList = ccbGetSceneNodeChildCount(currFaction);
								var geoNode = [];
								for (var i=0; i<currFactionList; ++i) {
									var currFactionChild = ccbGetChildSceneNode(currFaction, i)
									if(ccbGetSceneNodeProperty(currFactionChild, "Name").split("_")[1] == "PowerNode"){
										geoNode.push(currFactionChild);	
									}
								}
								//Move to that location
								if(geoNode.length > 0){
									var defend = Math.floor(Math.random() * geoNode.length);
									var currFactionChildPOS = ccbGetSceneNodeProperty(geoNode[defend], "Position");
									currFactionChildPOS.x = currFactionChildPOS.x + (Math.floor(Math.random() * this.PositionVariation));
									currFactionChildPOS.z = currFactionChildPOS.z + (Math.floor(Math.random() * this.PositionVariation));
									this.TargetPosition = currFactionChildPOS;
									this.defend = true;
								}
							}
						}
					}
				}
			}
		}
	}
	return true;
}

// parameters: key: key id pressed or left up.  pressed: true if the key was pressed down, false if left up
behavior_moveObjectByPositionClickRTS.prototype.onKeyEvent = function(code, down)
{

	if(ccbGetCopperCubeVariable("Start") == 1){
		var grabAction = ccbGetCopperCubeVariable("Action");
		if(this.nodeName.split('_').slice(-1)[0] != "1"){
			// store which key is down
			// key codes are this: left=37, up=38, right=39, down=40
			//A key Selects All units
			if(code == 65 && down){
				if(this.AttackWhileMoving){
					if(grabAction == 0){
						//Code To select all in screen
						var camera = ccbGetSceneNodeFromName('CameraControl');
						var cameraPos = ccbGetSceneNodeProperty(camera, "Position");
						var node = ccbGetSceneNodeFromName(this.nodeName);
						var nodePos = ccbGetSceneNodeProperty(node, "Position");
						if(nodePos.x < cameraPos.x + 200 && nodePos.x > cameraPos.x - 200){
							if(nodePos.z < cameraPos.z + 200 && nodePos.z > cameraPos.z - 200){
								if(this.Controllable == true){
									this.selected = true;
									ccbSetCopperCubeVariable("Message", 14);
									ccbInvokeAction(this.OnSelect, node);
								}
							}
						}else{
							// Enable to deselect units not in screen
							// this.selected = false;
						}
					}else{
						//Code to select all on stage
						if(this.Controllable == true){
							this.selected = true;
							ccbSetCopperCubeVariable("Message", 13);
							ccbInvokeAction(this.OnSelect, node);

						}
					}
				}else{
					this.selected = false;
				}
			}
			// Shift Key allows for multiple selections
			if(code == 160 && down){
				this.shiftSelect = true;
			}else{
				this.shiftSelect = false;
			}
			// Control Key allows for subtracting selections
			if(code == 162 && down){
				this.ctrlSelect = true;
			}else{
				this.ctrlSelect = false;
			}
			// Clear Selection with Spacebar
			if (code == 32 && down)
				// this.PressedJump = true;
				this.selected = false;
			if (code == 83 && down){
				// this.PressedJump = true;
				this.attackStart = false;
				this.enemyTarget = false;
				this.bMovingForward = false;
				this.TargetPosition = null;
			}
		}
		// Set Selection Hotkey
		if(code == 49 && down){
				print(grabAction)
			if(grabAction == 0){
				if(this.selected == true){
					this.hotkey1 = true;
					ccbSetCopperCubeVariable("Message", 10);
				}else{
					this.hotkey1 = false;
				}
			}else{
				if(this.hotkey1 == true){
					this.selected = true;
				}else{
					this.selected = false;
				}
			}
		}
		if(code == 50 && down){
			if(grabAction == 0){
				if(this.selected == true){
					this.hotkey2 = true;
					ccbSetCopperCubeVariable("Message", 11);
				}else{
					this.hotkey2 = false;
				}
			}else{
				if(this.hotkey2 == true){
					this.selected = true;
				}else{
					this.selected = false;
				}
			}
		}
		if(code == 51 && down){
			if(grabAction == 0){
				if(this.selected == true){
					this.hotkey3 = true;
					ccbSetCopperCubeVariable("Message", 12);
				}else{
					this.hotkey3 = false;
				}
			}else{
				if(this.hotkey3 == true){
					this.selected = true;
				}else{
					this.selected = false;
				}
			}
		}
	}
}

// mouseEvent: 0=move moved, 1=mouse clicked, 2=left mouse up,  3=left mouse down, 4=right mouse up, 5=right mouse up
behavior_moveObjectByPositionClickRTS.prototype.onMouseEvent = function(mouseEvent, mouseWheelDelta)
{

	if(ccbGetCopperCubeVariable("Start") == 1){
		// Calculate regions where you cannot click move (EG Screen Boundaries)
		var mouseXbase = ccbGetMousePosX();
		var mouseYbase = ccbGetMousePosY();
		var width = ccbGetScreenWidth();
		var height = ccbGetScreenHeight();

		if(mouseEvent == 2){
			if (mouseYbase <= 70 || mouseYbase >= height - 85 || mouseXbase <= 70 || mouseXbase >= width - 70){
				this.noActionZone = true;
			} else {
				this.noActionZone = false;
			}
		}

		//Prevents you from selecting the first entity - Keeps one copy for cloning
		if(this.nodeName.split('_').slice(-1)[0] != "1"){
		    var me = this;
			function randomize(baseValue){
				baseValue = baseValue + (Math.floor(Math.random() * me.PositionVariation ) * me.PositionMultiplier);
				baseValue = baseValue - (Math.floor(Math.random() * me.PositionVariation ) * me.PositionMultiplier);
				return baseValue;
			}
			//Move if selected
			var grabAction = ccbGetCopperCubeVariable("Action");
				if (mouseEvent == 5 || (mouseEvent == 2 && grabAction == 1)){	
					if(me.selected && !this.noActionZone){
						ccbInvokeAction(this.OnAction);
						// var mouseX = randomize(ccbGetMousePosX());
						// var mouseY = randomize(ccbGetMousePosY());
						var mouseX = randomize(mouseXbase);
						var mouseY = randomize(mouseYbase);
						
						var startPos3d = ccbGetSceneNodeProperty(ccbGetActiveCamera(), "Position");
						var endPos3d = ccbGet3DPosFrom2DPos(mouseX, mouseY);
						
						if (endPos3d != null)
						{
							endPos3d = new vector3d(endPos3d.x, endPos3d.y, endPos3d.z);  // bugfix for a bug in android and flash implementation of version 4.5 for returning 3d vectors
							var dir = endPos3d.substract(startPos3d);
							dir.normalize();
							dir.x *= 1000;
							dir.y *= 1000;
							dir.z *= 1000;
							endPos3d = startPos3d.add(dir); 
									
							var colPos = ccbGetCollisionPointOfWorldWithLine(startPos3d.x, startPos3d.y, startPos3d.z, endPos3d.x, endPos3d.y, endPos3d.z);
									
							if (colPos != null)
								this.TargetPosition = new vector3d(colPos.x, colPos.y, colPos.z); // bugfix for a bug in android and flash implementation of version 4.5 for returning 3d vectors
						}
						
					}
				}
			else if(mouseEvent == 2){
				var mouseX = ccbGetMousePosX();
				var mouseY = ccbGetMousePosY();
				var cube = ccbGetSceneNodeFromName(me.nodeName);  
				var endPoint3d = ccbGet3DPosFrom2DPos(mouseX, mouseY);
				var startPos3D = ccbGetSceneNodeProperty(ccbGetActiveCamera(), "Position");
				if (ccbDoesLineCollideWithBoundingBoxOfSceneNode(cube, startPos3D.x, startPos3D.y,startPos3D.z, endPoint3d.x, endPoint3d.y, endPoint3d.z))
				{
					if(me.Controllable){
						if(me.ctrlSelect){
							me.selected = false;
						} else {
							me.selected = true;
							ccbInvokeAction(this.OnSelect);
						}	
					}
				}
				else
				{
					var deviceTarget = ccbGetPlatform();
					// print(deviceTarget);
					if(deviceTarget != "android"){
						// Tab out this code for android
						if(!me.shiftSelect && !me.ctrlSelect){
							me.selected = false;
						}
					}
				}
			}
		}
	}
}

