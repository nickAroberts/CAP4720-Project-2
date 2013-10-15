var center;

function Camera(gl,d,modelUp,myNear,myFar,myFOV) // Compute a camera from model's bounding box dimensions
{
	center = [(d.min[0]+d.max[0])/2,(d.min[1]+d.max[1])/2,(d.min[2]+d.max[2])/2];
	var diagonal = Math.sqrt(Math.pow((d.max[0]-d.min[0]),2)+Math.pow((d.max[1]-d.min[1]),2)+Math.pow((d.max[2]-d.min[2]),2));
	//console.log(center+" "+diagonal);
	
	var name = "auto";
	var at = center;
	var eye = [center[0], center[1]+diagonal*0.5, center[2]+diagonal*1.5];
	var up = [modelUp[0],modelUp[1],modelUp[2]];
	var near = diagonal*myNear;
	var far = diagonal*myNear;
	var FOV = myFOV;
    //var near = diagonal*0.1;
	//var far = diagonal*3;
	//var FOV = 32;

	this.getRotatedCameraPosition= function(angle){
		var m = new Matrix4().setTranslate(at[0],at[1],at[2]).rotate(angle,up[0],up[1],up[2]).translate(-at[0],-at[1],-at[2]);
		var e = m.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;
		return [e[0],e[1],e[2]];
	};
	this.getViewMatrix=function(e){
		if (e==undefined) e = eye;
		return new Matrix4().setLookAt(e[0],e[1],e[2],at[0],at[1],at[2],up[0],up[1],up[2]);
	}
	this.getRotatedViewMatrix=function(angle){
		return this.getViewMatrix(this.getRotatedCameraPosition(angle));
	}
	this.getProjMatrix=function(){
		return new Matrix4().setPerspective(myFOV, gl.canvas.width / gl.canvas.height, myNear*diagonal , myFar*diagonal);
	};
	
	// (Nick) Tilt/Pitch: Rotates camera lens up and down
	this.tilt=function(angle){
		
		if(angle >= 90)
			angle = 89;
		
		else if(angle <= -90)
			angle = -89;
	
		// Calculate the camera's at-eye vector and its magnitude
		var atEye = [eye[0]-at[0], eye[1]-at[1], eye[2]-at[2]];
		var atEyeMag = Math.sqrt(atEye[0]*atEye[0] + atEye[1]*atEye[1] + atEye[2]*atEye[2]);
			
		// Calculate the camera's W vector and its magnitude
		var W = [-atEye[0]/atEyeMag, -atEye[1]/atEyeMag, -atEye[2]/atEyeMag];
		var WMag = Math.sqrt(W[0]*W[0] + W[1]*W[1] + W[2]*W[2]);
		
		// Calculate up vector magnitude
		var upMag = Math.sqrt(up[0]*up[0] + up[1]*up[1] + W[2]*W[2]);
		
		// Calculate the camera's U vector
		var upxW = [up[1]*W[2]-W[1]*up[2], up[2]*W[0]-W[2]*up[0], up[0]*W[1]-W[0]*up[1]]
		var upxWMag = Math.sqrt(upxW[0]*upxW[0] + upxW[1]*upxW[1] + upxW[2]*upxW[2]);
		
		var U = [upxW[0]/upxWMag, upxW[1]/upxWMag, upxW[2]/upxWMag];
	
		var m = new Matrix4().setTranslate(eye[0],eye[1],eye[2]).rotate(angle,U[0],U[1],U[2]).translate(-eye[0],-eye[1],-eye[2]);
		var a = m.multiplyVector4(new Vector4([at[0],at[1],at[2],1])).elements;
		at = [a[0],a[1],a[2]];
	}
	
	// (Nick) Pan/Yaw: Rotates camera lens
	this.pan=function(angle){
	
	}
	
	// (Nick) Zoom: Changes the field of view
	this.zoom=function(angle){
		/* (Nick)
			Technically, this is already implemented within PracticeAssignment5.js
			in the setMyFOV function, but I figured I'd put this here in case we
			wanted to move it to the same place as the other functions.
		*/
	}
	
	// (Nick) Dolly: Moves camera toward and away from subject
	this.dolly=function(displacement){
	
	}
	
	// (Nick) Pedestal: Moves camera up and down
	this.pedestal=function(displacement){
	
	}
	
	// (Nick) Truck: Moves camera left and right
	this.truck=function(displacement){
	
	}
	
}
