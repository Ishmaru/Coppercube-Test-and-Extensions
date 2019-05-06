/*  <action jsname="action_rTSUpgrade" description="RTS Purchase Upgrade">
      <property name="CurrentLevelVar" type="string" default="Upgrade" />
      <property name="ResourceNameA" type="string" default="Credits" />
      <property name="ResourceCostA" type="int" default="100" />
      <property name="ResourceIncrementA" type="int" default="0" />
      <property name="ResourceNameB" type="string" default="PopulationCap" />
      <property name="ResourceCostB" type="int" default="1" />
      <property name="ResourceIncrementB" type="int" default="0" />
      <property name="UpgradeActions" type="action" />
    </action>
*/

action_rTSUpgrade = function()
{
};

// called when the action is executed 
action_rTSUpgrade.prototype.execute = function(currentNode)
{
	if(ccbGetCopperCubeVariable("Start") == 1){
	  	var resourceA = ccbGetCopperCubeVariable(this.ResourceNameA);
	  	var resourceB = ccbGetCopperCubeVariable(this.ResourceNameB);
	  	var currentLevel = ccbGetCopperCubeVariable(this.CurrentLevelVar);
	  	if(this.ResourceCostA > 0 && this.ResourceIncrementA > 0){
		  	this.ResourceCostA = this.ResourceCostA + (this.ResourceIncrementA * currentLevel);
	  	}
	  // 	if(this.ResourceCostA > 0 && this.ResourceIncrementA > 0){
			// this.ResourceCostB = this.ResourceCostB + (this.ResourceIncrementA * currentLevel);
	  // 	}
		print(this.ResourceCostA +':'+ resourceA)
	  	if(resourceA >= this.ResourceCostA && resourceB >= this.ResourceCostB){
			//subtract Costs
			resourceA = resourceA - this.ResourceCostA;
			resourceB = resourceB - this.ResourceCostB;
			// print(this.ResourceCostA)
			ccbSetCopperCubeVariable(this.ResourceNameA, resourceA);
			ccbSetCopperCubeVariable(this.ResourceNameB, resourceB);
			ccbInvokeAction(this.UpgradeActions);
			if(this.ResourceNameA == "Credits"){
				ccbSetCopperCubeVariable("Message", 3);	
			}
			// print(this.ResourceCostA);
			ccbSetCopperCubeVariable(this.CurrentLevelVar + "Cost", this.ResourceCostA + (this.ResourceIncrementA * 2));
			// var s = ccbGetSceneNodeFromName("ScoutCost");
			// var b = ccbGetCopperCubeVariable("ScoutUpgrade");
			// ccbSetSceneNodeProperty(s, "Text", (25 + (5 * b)) + "c");
			// this.ResourceCostA = this.ResourceCostA + this.ResourceIncrementA;
			// this.ResourceCostB = this.ResourceCostB + this.ResourceIncrementB;
			// this.ResourceCostA = this.ResourceCostA + (this.ResourceIncrementA * currentLevel);
			// this.ResourceCostB = this.ResourceCostB + (this.ResourceIncrementA * currentLevel);

			//UpdateCost Ind
	  	}
	}
}	