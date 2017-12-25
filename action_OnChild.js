// This is a scripted coppercube action.
// It does an action to the child at the index specified. Good for dynamically cloned nodes
//
/*
	<action jsname="action_OnChild" description="Action On a Child Element">
		<property name="TimeMs" type="int" default="500" />
		<property name="ActionToDo" type="action" />
		<property name="ChildIndex" type="int" default="0" />
	</action>
*/

action_OnChild = function()
{
};

// called when the action is executed 
action_OnChild.prototype.execute = function(currentNode)
{

	var child = ccbGetChildSceneNode(ccbGetCurrentNode(), ChildIndex);
	var cNode = ccbGetCurrentNode();
	// ccbSetSceneNodeProperty(child, "Visible", true);

	var me = this; 
	this.registeredFunction = function() { me.doLaterFunc(currentNode); }; 
	
	ccbRegisterOnFrameEvent(me.registeredFunction);	
	
	this.startTime = (new Date()).getTime();
	this.endTime = this.startTime + this.TimeMs;
	this.currentNode = currentNode;
}


action_OnChild.prototype.doLaterFunc = function(currentNode)
{
	var now = (new Date()).getTime();
	if (now > this.endTime)
	{
	var child = ccbGetChildSceneNode(ccbGetCurrentNode(), this.ChildIndex);
		ccbInvokeAction(this.ActionToDo, child);
		ccbUnregisterOnFrameEvent(this.registeredFunction);
	}
}
