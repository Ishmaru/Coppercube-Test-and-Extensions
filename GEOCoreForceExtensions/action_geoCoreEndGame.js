/*  <action jsname="action_geoCoreEndGame" description="GEOCoreForce Endgame">
    </action>
*/

action_geoCoreEndGame = function()
{
};

// called when the action is executed 
action_geoCoreEndGame.prototype.execute = function(currentNode)
{
	var teamAFolder = ccbGetSceneNodeFromName('Player');

	var number = 0;
	for (i = 0; i < ccbGetSceneNodeChildCount(teamAFolder); i++) {
		var a = ccbGetSceneNodeProperty(ccbGetChildSceneNode(teamAFolder, i), 'Name');
		if(a.split('_')[0] === 'GEO'){
			number = number + 1;
		}
	}
	print('cores:' + ccbGetCopperCubeVariable('MaxCores') + ' owned:' + number)
	// Coppercube Variable "Victor" 1 = player wins, 2 = enemy wins, 0 or null means no victor
	if (number == 0){
		// If player has no cores
		ccbSetCopperCubeVariable('Victor', 2);
		ccbSetCopperCubeVariable('Start', 0);
		ccbSwitchToScene('EndResults');
	}else if(number == ccbGetCopperCubeVariable('MaxCores')){
		//If player have the max number of cores
		ccbSetCopperCubeVariable('Victor', 1);
		ccbSetCopperCubeVariable('Start', 0);
		ccbSwitchToScene('EndResults');
	}
}	