// This is a coppercube behavior which lets an object behave as in a third person shooter mode:
// Rotates the character to where the mouse is, moves with cursor keys. Camera follows automatically if set.
// Attach this behavior to a character and set the camera in the behavior for it to work.
//
// The following embedded xml is for the editor and describes how the behavior can be edited:
// Supported types are: int, float, string, bool, color, vect3d, scenenode, texture, action
/*
	<behavior jsname="behavior_animationHelperHackSlash" description="Animation Helper 3dPerson">		
		<property name="StandAnimation" type="string" default="stand" />
		<property name="WalkAnimation" type="string" default="walk" />
		<property name="JumpAnimation" type="string" default="jump" />
		<property name="DeathAnimation" type="string" default="die" />
		<property name="Attack1Animation" type="string" default="attack1" />
		<property name="Attack2Animation" type="string" default="attack2" />	
		<property name="WalkAction" type="action"/>
		<property name="StandAction" type="action"/>
		<property name="JumpAction" type="action"/>
		<property name="AttackAction" type="action"/>
		<property name="ActionOnDeath" type="action"/>

	</behavior>
*/

// set these globaly
var health = 100
var name = "player"

checkInput = function(){
	if(this.StopOnAction == false)
		return false
	else
	if(this.StopOnAction == true && (this.LeftMouse == true || (this.RightMouse == true && this.MouseJump == false)))
		return true
	else
		return false
}


behavior_animationHelperHackSlash = function()
{
	this.ForwardKeyDown = false;
	this.BackKeyDown = false;
	this.PressedJump = false;
	
	this.leftKeyDown = false;
	this.rightKeyDown = false;
	this.jumpKeyDown = false;
	this.downKeyDown = false;
	this.upKeyDown = false;
	
	this.loopJumpAnimation = false;
	
	this.CameraDelta = new vector3d(0,0,0);
	this.CamStartPosY = 0;

	this.LeftMouse = false;
	this.RightMouse = false;
};

// called every frame. 
//   'node' is the scene node where this behavior is attached to.
//   'timeMs' the current time in milliseconds of the scene.
// Returns 'true' if something changed, and 'false' if not.
behavior_animationHelperHackSlash.prototype.onAnimate = function(currentnode, timeMs)
{
	var swing = ccbGetCopperCubeVariable('Swing');	
	var jump = ccbGetCopperCubeVariable('Jump');	
	var cutscene = ccbGetCopperCubeVariable('Cutscene');		
	var node = currentnode;
	var bForward = this.upKeyDown || this.downKeyDown || this.rightKeyDown || this.leftKeyDown;

	name = ccbGetSceneNodeProperty(currentnode, 'Name');
	// health = ccbGetCopperCubeVariable("#" + name + ".health");
	health = ccbGetCopperCubeVariable("#Colider2.health");
	if (swing == 1 && health > 0 && jump == 0){
		// var swd;
		var swd = Math.round(Math.random()*1);
		// print('swning' + swd)
		if(swd == 0){
			ccbSetSceneNodeProperty(node, 'Animation', this.Attack2Animation);
			ccbSetSceneNodeProperty(node, 'Looping', false);
			// swd = 1;
		}
		else
		{
			ccbSetSceneNodeProperty(node, 'Animation', this.Attack1Animation);
			ccbSetSceneNodeProperty(node, 'Looping', false);
			// swd = 0;
		}
		ccbInvokeAction(this.AttackAction);
		ccbSetCopperCubeVariable('Swing', 2);
	}
	if (this.PressedJump && health > 0 && swing == 0 && jump == 0)
	{
		ccbInvokeAction(this.JumpAction);
		ccbSetSceneNodeProperty(node, 'Animation', this.JumpAnimation);		
		if (!this.loopJumpAnimation)
			ccbSetSceneNodeProperty(node, 'Looping', false);
	}
	else
	if ((bForward) && health > 0 && swing == 0 && jump == 0)
	{
		ccbInvokeAction(this.WalkAction);
		ccbSetSceneNodeProperty(node, 'Animation', this.WalkAnimation);
		ccbSetSceneNodeProperty(node, 'Looping', true);
	}
	else
	if (health <= 0)
	{
		ccbInvokeAction(this.ActionOnDeath);
		ccbSetSceneNodeProperty(node, 'Animation', this.DeathAnimation);
		ccbSetSceneNodeProperty(node, 'Looping', false);
	}
	else if(swing == 0 && jump == 0)
	{
		ccbInvokeAction(this.StandAction);
		ccbSetSceneNodeProperty(node, 'Animation', this.StandAnimation);
		ccbSetSceneNodeProperty(node, 'Looping', true);
	}
	
	
	// jump if jump was pressed
	
	if (this.PressedJump  && health > 0)
	{
				this.PressedJump = false;
	}
	
	return true;
}

// parameters: key: key id pressed or left up.  pressed: true if the key was pressed down, false if left up
behavior_animationHelperHackSlash.prototype.onKeyEvent = function(code, down)
{
	// store which key is down
	// key codes are this: left=37, up=38, right=39, down=40

	if (code == 37 || code == 65 )
	{
		this.leftKeyDown = down;
		// fix chrome key down problem (key down sometimes doesn't arrive)
		if (down) this.rightKeyDown = false;
		return true;
	}
		
	if (code == 39 || code == 68 )
	{
		this.rightKeyDown = down;
		
		// fix chrome key down problem (key down sometimes doesn't arrive)
		if (down) this.leftKeyDown = false;
		return true;
	}
		
	if (code == 38 || code == 87 )
	{
		this.upKeyDown = down;			
		
		// fix chrome key down problem (key down sometimes doesn't arrive)
		if (down) this.downKeyDown = false;
		return true;
	}
		
	if (code == 40 || code == 83 )
	{
		this.downKeyDown = down;
		
		// fix chrome key down problem (key down sometimes doesn't arrive)
		if (down) this.upKeyDown = false;
		return true;
	}

	// jump when space pressed
	if (code == 32 && down)
		this.PressedJump = true;
}


// mouseEvent: 0=move moved, 1=mouse clicked, 2=left mouse up,  3=left mouse down, 4=right mouse up, 5=right mouse down
behavior_animationHelperHackSlash.prototype.onMouseEvent = function(mouseEvent, mouseWheelDelta)
{

// Perform Animation + Action on Left Click
	if(mouseEvent == 3 && health > 0){
		this.LeftMouse = true;
		ccbInvokeAction(this.LeftMouseAction);
	} else {
		this.LeftMouse = false;
	}

// If Right Mouse Perform Action or Jump (Depending on MouseJump Variable)
	if(mouseEvent == 5 && health > 0){
		this.RightMouse = true;
		ccbInvokeAction(this.RightMouseAction);
	} else {
		this.RightMouse = false;
	}

	// we currently don't support move event. But for later use maybe.
}
