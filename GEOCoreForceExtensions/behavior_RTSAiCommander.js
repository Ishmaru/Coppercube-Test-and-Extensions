/*
  <behavior jsname="behavior_RTSAiCommander" 
	description="RTS AI Commander">
    <property name="EveryTimeMS" type="int" default="20000" />
    <property name="ResourceA" type="string" default="Credits" />
    <property name="ResourceB" type="string" default="Population" />
    <property name="IfResource1A" type="int" default="10" />
    <property name="IfResource1B" type="int" default="0" />
    <property name="ActionSet1A" type="action"/>
    <property name="ActionSet1B" type="action"/>
    <property name="ActionSet1C" type="action"/>
    <property name="IfResource2A" type="int" default="20" />
    <property name="IfResource2B" type="int" default="0" />
    <property name="ActionSet2A" type="action"/>
    <property name="ActionSet2B" type="action"/>
    <property name="ActionSet2C" type="action"/>
    <property name="IfResource3A" type="int" default="30" />
    <property name="IfResource3B" type="int" default="0" />
    <property name="ActionSet3A" type="action"/>
    <property name="ActionSet3B" type="action"/>
    <property name="ActionSet3C" type="action"/>
    <property name="IfResource4A" type="int" default="40" />
    <property name="IfResource4B" type="int" default="0" />
    <property name="ActionSet4A" type="action"/>
    <property name="ActionSet4B" type="action"/>
    <property name="ActionSet4C" type="action"/>
    <property name="IfResource5A" type="int" default="50" />
    <property name="IfResource5B" type="int" default="0" />
    <property name="ActionSet5A" type="action"/>
    <property name="ActionSet5B" type="action"/>
    <property name="ActionSet5C" type="action"/>
  </behavior>
*/

behavior_RTSAiCommander = function()
{
  this.timer;
}

// called every frame. 
//   'node' is the scene node where this behavior is attached to.
//   'timeMs' the current time in milliseconds of the scene.
// Returns 'true' if something changed, and 'false' if not.
behavior_RTSAiCommander.prototype.onAnimate = function(node, timeMs)
{
  if(!this.timer){
    this.timer = this.EveryTimeMS;
  }
  if(timeMs > this.timer){
    var randomNum = Math.floor(Math.random() * 3);
    var resA = ccbGetCopperCubeVariable(this.ResourceA);
    var resB = ccbGetCopperCubeVariable(this.ResourceB);
    if(resA >= this.IfResource5A){
      if(randomNum == 2 && this.ActionSet5C){
        ccbInvokeAction(this.ActionSet5C);
      }else if (randomNum == 1 && this.ActionSet5B){
        ccbInvokeAction(this.ActionSet5B);
      }else if(this.ActionSet5A){
        ccbInvokeAction(this.ActionSet5A);
      }
    }else if(resA >= this.IfResource4){
      if(randomNum == 2 && this.ActionSet4C){
        ccbInvokeAction(this.ActionSet4C);
      }else if (randomNum == 1 && this.ActionSet4B){
        ccbInvokeAction(this.ActionSet4B);
      }else if(this.ActionSet4A){
        ccbInvokeAction(this.ActionSet4A);
      }
    }else if(resA >= this.IfResource3A){
      if(randomNum == 2 && this.ActionSet3C){
        ccbInvokeAction(this.ActionSet3C);
      }else if (randomNum == 1 && this.ActionSet3B){
        ccbInvokeAction(this.ActionSet3B);
      }else if(this.ActionSet3A){
        ccbInvokeAction(this.ActionSet3A);
      }
    }else if(resA >= this.IfResource2A){
      if(randomNum == 2 && this.ActionSet2C){
        ccbInvokeAction(this.ActionSet2C);
      }else if (randomNum == 1 && this.ActionSet2B){
        ccbInvokeAction(this.ActionSet2B);
      }else if(this.ActionSet2A){
        ccbInvokeAction(this.ActionSet2A);
      }
    }else if(resA >= this.IfResource1A){
      if(randomNum == 2 && this.ActionSet1C){
        ccbInvokeAction(this.ActionSet1C);
      }else if (randomNum == 1 && this.ActionSet1B){
        ccbInvokeAction(this.ActionSet1B);
      }else if(this.ActionSet1A){
        ccbInvokeAction(this.ActionSet1A);
      }
    }

    this.timer = timeMs + this.EveryTimeMS;
  }
  return true;
}