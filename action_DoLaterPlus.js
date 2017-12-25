// This is a scripted coppercube action.
// It does an action somewhen later.
// Modified by Ishmaru
// Contains code to account for pausing (Set ccb variable "Paused" to 1)
// Also code to prevent and removes this event when scene changes (Increment ccb variable "currScene" by 1)
//
/*
	<action jsname="action_DoLater" description="Do something later">
		<property name="TimeMs" type="int" default="500" />
		<property name="ActionToDo" type="action" />
	</action>
*/
action_DoLater = function()
{
	this.currScene = ccbGetCopperCubeVariable("currScene");
	this.timer = ccbGetCopperCubeVariable("Timer");
};

// called when the action is executed 
action_DoLater.prototype.execute = function(currentNode)
{
	var me = this; 
	this.registeredFunction = function() { me.doLaterFunc(currentNode); }; 
	
	ccbRegisterOnFrameEvent(me.registeredFunction);	
	
	this.startTime = (new Date()).getTime();
	this.endTime = this.startTime + this.TimeMs;
	this.currentNode = currentNode;
}


action_DoLater.prototype.doLaterFunc = function(currentNode)
{
	var currScene = ccbGetCopperCubeVariable("currScene");
	var timer = ccbGetCopperCubeVariable("Timer");
	if(timer){
		var now = timer;
	}else{
		var now = (new Date()).getTime();
		if(currScene){
			var paused = ccbGetCopperCubeVariable("Paused");	
			//Check if game is paused if variable Paused = 1
			if(paused == 0){
				if (now > this.endTime){
					ccbInvokeAction(this.ActionToDo, currentNode);
					ccbUnregisterOnFrameEvent(this.registeredFunction);
				}
			}else{
			//Done if game is paused
			}
		} else {
			// print('not done' + currScene)
			ccbUnregisterOnFrameEvent(this.registeredFunction);
			return
		}	
	}
}


// action_DoLater = function()
// {

// 	// called when the action is executed 
// 	action_DoLater.prototype.execute = function(currentNode)
// 	{
// 				var root1 = ccbGetRootSceneNode();
// 		var name = ccbGetSceneNodeProperty(root1, 'BackgroundColor');
// 		print(name);
// 		var me = this; 
// 		this.registeredFunction = function() { me.doLaterFunc(currentNode); }; 
		
// 		ccbRegisterOnFrameEvent(me.registeredFunction);	
		
// 		this.startTime = (new Date()).getTime();
// 		this.endTime = this.startTime + this.TimeMs;
// 		this.currentNode = currentNode;
// 			// Check if active in same scene

// 	}


// 	action_DoLater.prototype.doLaterFunc = function(currentNode)
// 	{
// 		// Check if active in same scene		
// 		var root2 = ccbGetRootSceneNode();
// 		var name2 = ccbGetSceneNodeProperty(root2, 'BackgroundColor');
// 		var now = (new Date()).getTime();
		
// 		if(name == name2){
// 			if (now > this.endTime)
// 			{
// 				ccbInvokeAction(this.ActionToDo, currentNode);
// 				ccbUnregisterOnFrameEvent(this.registeredFunction);
// 			}
			
// 		}
// 	}
// };