// Basic Coppercube Behavior
// Add elastic move and fake gravity to one object, Added ability to turn off player Input via setting ccb variable "Start" to 0, 
// and removed instant reverse acceleration 

// Modified by Ishmaru, Created By : Jaime A. Zegpi B.
/*
	<behavior jsname="behavior_MoveElasticPlus" description="Move Elastic Plus - Arrow Keys">
		<property name="Speed" type="float" default="1" />
		<property name="MaxSpeed" type="float" default="3" />
		<property name="MinSpeed" type="float" default="-3" />
		<property name="Velocity" type="float" default="0" />
		<property name="Deceleration" type="float" default="0.01" />
		<property name="RotationSpeed" type="float" default="1.5" />
		<property name="RotationDeceleration" type="float" default="0.5" />
		<property name="Gravity" type="float" default="-0.09" />
		<property name="Object_Height" type="float" default="4" />
		<property name="Object_Long" type="float" default="4" />

	</behavior>
*/

behavior_MoveElasticPlus = function()
{
/*
	this.Speed 				= 1;
	this.MaxSpeed 			= 3;
	this.MinSpeed 			= -3;
	this.Velocity 			= 0;

	this.Deceleration 		= 0.01;

	this.RotationSpeed		= 1.5;

	this.RotationDeceleration = 0.5;
	this.Gravity 			= -0.09;
*/
	this.v_rotation 		= 0;
	this.vertical_velocity 	= 0;
	this.key 				= 0;
	this.key_value 			= false;
	this.key_left_value 	= false;
	this.key_right_value 	= false;
	this.key_up_value 		= false;
	this.key_down_value 	= false;
	this.fall_speed 		= 0;
	this.old_y				= 0;
	

};


// called every frame. 
//   'node' is the scene node where this behavior is attached to.
//   'timeMs' the current time in milliseconds of the scene.
// Returns 'true' if something changed, and 'false' if not.
behavior_MoveElasticPlus.prototype.onAnimate = function(currentNode, timeMs)
{

	//Start only when "Start" variable is 1
	var startrace = ccbGetCopperCubeVariable('Start');
	if(startrace == 1){
		var maxBoostSpeed = this.MaxSpeed * 1.5;
		var isBoost = ccbGetCopperCubeVariable('Boost') || 0;

		var cursor = ccbGetSceneNodeFromName("cursor");
		var position 	= ccbGetSceneNodeProperty(currentNode, "Position");
		var rotation 	= ccbGetSceneNodeProperty(currentNode, "Rotation");
		var len 		= this.Velocity;
		var pi 			= Math.PI;
		var angle 		= rotation.y-180;

		var theta 		= angle * pi / 180;
		var dz  		= (len * Math.cos(theta));
		var dx  		= (len * Math.sin(theta));
		var px 			= position.x+dx;
		var pz 			= position.z+dz;
		var py 			= ( position.y+( len * ( Math.sin( (rotation.x*-1) *Math.PI/180 ) ) ) );
		var ground_coll	= ccbGetCollisionPointOfWorldWithLine(position.x, position.y, position.z, position.x, position.y-100, position.z);

		// front point calculation
		// Calculate Front Angle----------- INI
		getHorizontalAngle = function(vx, vy, vz)
		{
			var angle = new vector3d(0,0,0);
			angle.y = Math.atan2(vx, vz) * 180.0 / 3.14159265359;
			if (angle.y < 0.0)
				angle.y += 360.0;
			if (angle.y >= 360.0)
				angle.y -= 360.0;
			var z1 = Math.sqrt(vx*vx + vz*vz);
			angle.x = ((Math.atan2(z1, vy)) - 90.0) * 180.0 / 3.14159265359;
			if (angle.x < 0.0)
				angle.x += 360.0;
			if (angle.x >= 360.0)
				angle.x -= 360.0;
			return angle;
		}
		var angle 		= rotation.y;
		var distance_to_front = this.Object_Long;
		var ctheta 		= angle * pi / 180;
		var cdz  		= (distance_to_front * Math.cos(ctheta));
		var cdx  		= (distance_to_front * Math.sin(ctheta));
		var cpx 		= position.x+cdx;
		var cpz 		= position.z+cdz;
		var cpy 		= ( position.y+( distance_to_front * ( Math.sin( (rotation.x*-1) *Math.PI/180 ) ) ) );
		var front_ground_coll	= ccbGetCollisionPointOfWorldWithLine(cpx, 100, cpz, cpx, cpy-100, cpz);	

		var point_front_position = 0;
		if (front_ground_coll)
		{
			// ccbSetSceneNodeProperty(cursor,"Position",front_ground_coll.x,front_ground_coll.y+this.Object_Height,front_ground_coll.z);
			gatfx=front_ground_coll.x-position.x;
			gatfy=front_ground_coll.y-position.y;
			gatfz=front_ground_coll.z-position.z;
			point_front_position = getHorizontalAngle(gatfx,gatfy,gatfz);
		}
		// Calculate Front Angle----------- END




		if ( !this.key_up_value )
		{
			if ( this.Velocity > 0 ){ this.Velocity = this.Velocity-this.Deceleration; }
			if ( this.Velocity < 0 ){ this.Velocity = this.Velocity+this.Deceleration; }
		}

		//print (ground_coll);
		if (!ground_coll)
		{
			this.fall_speed=this.fall_speed+this.Gravity
			if (this.fall_speed>2){this.fall_speed=2;}
			if (this.old_y>py)
			{}
			py		= py - this.fall_speed;

		}else{
			fall_speed = 0;
			var gd_x = (position.x-ground_coll.x)*(position.x-ground_coll.x);
			var gd_y = (position.y-ground_coll.y)*(position.y-ground_coll.y);
			var gd_z = (position.z-ground_coll.z)*(position.z-ground_coll.z);
			var ground_distance = ( Math.sqrt(gd_x+gd_y+gd_z) );
			//py		= ground_coll.y+1;
			if (ground_distance>4.1)
			{
				this.fall_speed=this.fall_speed+this.Gravity
				if (this.fall_speed>2){this.fall_speed=2;}
				py		= py - this.fall_speed;
			}if(ground_distance<=4){
					this.fall_speed=(this.fall_speed*-1)/1.8;
				py		= py - this.fall_speed;
			}
			//print (ground_distance+"::"+this.fall_speed);
			
			
			//py		= py + this.fall_speed;
		}
		
		

		ccbSetSceneNodeProperty(currentNode,"Position",px,py,pz);
		var yrotation = rotation.y+this.v_rotation;
		if (yrotation>360){yrotation=0;}
		if (yrotation<0){yrotation=360;}
		//print (yrotation);

		if (point_front_position)
		{
			//ccbSetSceneNodeProperty(currentNode,"Rotation",point_front_position.x,yrotation,rotation.z);
			calc_div= ( point_front_position.x - ( Math.floor(point_front_position.x/360)*360 ) );
			if (calc_div<0){
				calc_div=calc_div*-1;
			}else{
				calc_div=360-calc_div;
			}
			// print (calc_div+":"+rotation.x);
			if (calc_div>0 && calc_div<50)
			{
				ccbSetSceneNodeProperty(currentNode,"Rotation",point_front_position.x,yrotation,point_front_position.z);
			}else{
				ccbSetSceneNodeProperty(currentNode,"Rotation",rotation.x,yrotation,rotation.z);	
			}
		}else{
			ccbSetSceneNodeProperty(currentNode,"Rotation",rotation.x,yrotation,rotation.z);
		}
		

		if ( this.v_rotation > 0 ){ this.v_rotation = this.v_rotation-this.RotationDeceleration; }
		if ( this.v_rotation < 0 ){ this.v_rotation = this.v_rotation+this.RotationDeceleration; }

		if ( this.key_left_value )
		{
			this.v_rotation = this.v_rotation-this.RotationSpeed;
			if ( this.v_rotation < this.RotationSpeed*-1 ){ this.v_rotation = this.RotationSpeed*-1; }
		}

		if ( this.key_right_value )
		{
			this.v_rotation = this.v_rotation+this.RotationSpeed;
			if ( this.v_rotation > this.RotationSpeed ){ this.v_rotation = this.RotationSpeed; }
		}

		if ( this.key_up_value )
		{
			this.Velocity = this.Velocity-this.Speed;
			//If variable Boost == 1 then allow for boost speed
			if(isBoost == 1){
				if ( this.Velocity*-1 > maxBoostSpeed ){ this.Velocity = maxBoostSpeed*-1; }
			}else{
				if ( this.Velocity*-1 > this.MaxSpeed ){ this.Velocity = this.MaxSpeed*-1; }
			}
			//--------------
		
		}

		if ( this.key_down_value )	
		{
			// this.Velocity = this.Velocity+this.Speed;
			// if ( this.Velocity*-1 < this.MinSpeed ){ this.Velocity = this.MinSpeed*-1; }
			this.Deceleration = this.Deceleration
			
		}

		this.old_y = py;
	}
}

// parameters: key: key id pressed or left up.  pressed: true if the key was pressed down, false if left up
behavior_MoveElasticPlus.prototype.onKeyEvent = function(key, pressed)
{
	this.key 		= key;
	this.key_value 	= pressed;
	// store which key is down
	// key codes are this: left=37, up=38, right=39, down=40

	if (key == 40 || key == 83)
	{
		this.key_down_value = pressed;
	}
		
	if (key == 38 || key == 87)
	{
		this.key_up_value = pressed;
	}
	
	if (key == 37 || key == 65)
	{
		this.key_left_value = pressed;
	}

	if (key == 39 || key == 68)
	{
		this.key_right_value = pressed;
	}
}

