/*  <action jsname="action_rTSBuildUnit" description="RTS Clone A Scene Node">
      <property name="SpawnPosition" type="vect3d" default="0.0, 0.0, 0.0" />
      <property name="SpawnVariation" type="float" default="100" />
      <property name="RallyPosition" type="vect3d" default="0.0, 0.0, 0.0" />
      <property name="ResourceNameA" type="string" default="Credits" />
      <property name="ResourceCostA" type="int" default="100" />
      <property name="ResourceNameB" type="string" default="PopulationCap" />
      <property name="ResourceCostB" type="int" default="1" />
      <property name="UnitToClone" type="scenenode" />
      <property name="AdditionalActions" type="action" />
    </action>
*/

action_rTSBuildUnit = function()
{
};

// called when the action is executed 
action_rTSBuildUnit.prototype.execute = function(currentNode)
{
	function getRandomValue(base, variation){
		return base - (Math.random() * variation) + (Math.random() * variation);
	}
	if(ccbGetCopperCubeVariable("Start") == 1){
		// var oldPos = ccbGetSceneNodeProperty(currentNode, "Position");	
		// var newPos = oldPos.add(this.MoveBy);	
		// ccbSetSceneNodeProperty(currentNode, "Position", newPos);
	  	var resourceA = ccbGetCopperCubeVariable(this.ResourceNameA);
	  	var resourceB = ccbGetCopperCubeVariable(this.ResourceNameB);
			// print(resourceA + ":" + this.ResourceCostA);
			// print(resourceB + ":" + this.ResourceCostB);
	  	if(resourceA >= this.ResourceCostA && resourceB >= this.ResourceCostB){
	  		//clone node
			var newscenenode = ccbCloneSceneNode(this.UnitToClone);
			// var newscenenode = ccbGetCurentNode();
			var name = ccbGetSceneNodeProperty(newscenenode, "Name");
			//Use Coppercube Variable "UnitId" to properly number Units;
			var unitId = ccbGetCopperCubeVariable("UnitId");
			//Replace "1" in the cloned unit;
			name = name.replace("1", unitId);
			ccbSetSceneNodeProperty(newscenenode, "Name", name);
			ccbSetCopperCubeVariable("UnitId", parseInt(unitId) +1);
			// print(name);
			//Place Clone Node
			var randomPos = {x:getRandomValue(this.SpawnPosition.x, this.SpawnVariation), y:this.SpawnPosition.y, z:getRandomValue(this.SpawnPosition.z, this.SpawnVariation)};
			// print(randomPos.x)
			this.randomPos = new vector3d(randomPos.x, randomPos.y, randomPos.z)
			ccbSetSceneNodeProperty(newscenenode, "Position", this.randomPos);
			// ccbSetSceneNodeProperty(newscenenode, "Position", this.SpawnPosition);
			//subtract Costs
			resourceA = resourceA - this.ResourceCostA;
			resourceB = resourceB - this.ResourceCostB;
			ccbSetCopperCubeVariable(this.ResourceNameA, resourceA);
			ccbSetCopperCubeVariable(this.ResourceNameB, resourceB);
			// ccbInvokeAction(this.AdditionalActions, currentNode);
			ccbInvokeAction(this.AdditionalActions, newscenenode);
			if(this.ResourceNameA == "Credits"){
				ccbSetCopperCubeVariable("Message", 1);	
			}
			// print(ccbGetCopperCubeVariable(this.ResourceNameA));
			// print(ccbGetCopperCubeVariable(this.ResourceNameB));
			//Update Overlay Text (Node name should be the same as the variable name)
			// var resA = ccbGetSceneNodeFromName(this.ResourceNameA);
			// ccbSetSceneNodeProperty(resA, "Text", this.ResourceNameA + ":" + resourceA);
			// var resB = ccbGetSceneNodeFromName(this.ResourceNameB);
			// ccbSetSceneNodeProperty(resB, "Text", this.ResourceNameB + ":" + resourceB);
	  	}
	}
}	