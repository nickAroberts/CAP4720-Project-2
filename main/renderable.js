"use strict";
function RenderableModel(gl,model,attribNamesInModel,attribNamesInShader){
	var i=0;
	if (!attribNamesInModel){
		attribNamesInModel = ['vertexPositions','vertexNormals'];
		attribNamesInShader = ['a_position','a_normal'];
		if (!model.meshes[0].vertexNormals){
			for (var i=0;i<model.meshes.length;i++)
				model.meshes[i].vertexNormals = model.meshes[i].vertexColors.slice(0);//map(Math.abs);
		}
	}
	function Drawable(attribLocations, vArrays, nVertices, indexArray, drawMode, diffuseReflectance, ambientReflectance, specularReflectance, shininess ){
	  // Create a buffer object
	  var vertexBuffers=[];
	  var nElements=[];
	  var nAttributes = attribLocations.length;

	  for (var i=0; i<nAttributes; i++){
		  if (vArrays[i]){
			  vertexBuffers[i] = gl.createBuffer();
			  if (!vertexBuffers[i]) {
				console.log('Failed to create the buffer object');
				return null;
			  }
			  // Bind the buffer object to an ARRAY_BUFFER target
			  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
			  // Write date into the buffer object
			  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vArrays[i]), gl.STATIC_DRAW);
			  nElements[i] = vArrays[i].length/nVertices;
		  }
		  else{
			  vertexBuffers[i]=null;
		  }
	  }

	  var indexBuffer=null;
	  if (indexArray){
		indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);
	  }
	  this.delete = function(){
		if (indexBuffer) gl.deleteBuffer(indexBuffer);
		for (var i=0; i<nAttributes; i++)
		  if (vertexBuffers[i])gl.deleteBuffer(vertexBuffers[i]);
	  }
      
      //drawable draw
	  this.draw = function (){
        gl.uniform3f(diffReflectLoc, diffuseReflectance[0],diffuseReflectance[1],diffuseReflectance[2]);
        gl.uniform3f(ambiReflectLoc, ambientReflectance[0],ambientReflectance[1],ambientReflectance[2]);
        gl.uniform3f(specReflectLoc, specularReflectance[0],specularReflectance[1],specularReflectance[2]);
        
        gl.uniform1f(shininessLoc, shininess);
        
 		for (var i=0; i<nAttributes; i++){
		  if (vertexBuffers[i]){
			  gl.enableVertexAttribArray(attribLocations[i]);
			  // Bind the buffer object to target
			  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
			  // Assign the buffer object to a_Position variable
			  gl.vertexAttribPointer(attribLocations[i], nElements[i], gl.FLOAT, false, 0, 0);
		  }
		  else{
			  gl.disableVertexAttribArray(attribLocations[i]); 
			  gl.vertexAttrib3f(attribLocations[i],1,1,1);
		  }
		}
		if (indexBuffer){
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
			gl.drawElements(drawMode, indexArray.length, gl.UNSIGNED_SHORT, 0);
		}
		else{
			gl.drawArrays(drawMode, 0, nVertices);
		}
	  }
	}

    
    
    
	var VSHADER_SOURCE =
	  'attribute vec3 a_position;\n' +
	  'attribute vec3 a_normal;\n' +
            	  
	  'uniform mat4 u_modelT;'+
	  'uniform mat4 u_viewT;'+
	  'uniform mat4 u_projT;'+
	  'uniform mat4 u_NormalMatrix;'+
      
	  'varying vec3 v_Normal;'+
	  'varying vec3 v_Position;'+
      
      
	  'void main() {\n' +
      
	  'gl_Position =u_projT * u_viewT * u_modelT * vec4(a_position,1.0);\n' +
    
      'v_Position = vec3( u_viewT * u_modelT * vec4(a_position,1.0));\n' +
      
      'v_Normal = normalize(vec3(u_viewT*u_NormalMatrix * vec4(a_normal, 0.0)));\n' +
	  '}\n';

	// Fragment shader program
	var FSHADER_SOURCE = 
      'precision mediump float;\n'+
	  
      'uniform vec3 u_LightColor;\n' +
      'uniform vec3 u_LightPosition;\n' +
      
	  'uniform vec3 u_DiffReflectance;\n' +
	  'uniform vec3 u_AmbiReflectance;\n' +
	  'uniform vec3 u_SpecReflectance;\n' +
      
	  'uniform float u_Shininess;\n' +
      
	  //'uniform vec3 u_Ambient;\n' +
      
      'varying vec3 v_Normal;\n' +
      'varying vec3 v_Position;\n' +
            
	  'void main() {\n' +

      //normalize normal because it is interpolated and not 1.0
      'vec3 normal = normalize(v_Normal);\n' +
      
      //calculate the light direction and make it 1.0 in length
      //points from frag position to light position
      'vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
      
      //calculate view direction vector, when cam is 0,0,0, in view space
      //points from frag position to camera
      'vec3 viewDirection = normalize( - v_Position);\n' +
      
      //calculate reflect direction, points from frag to reflect loc
      'vec3 reflectDirection = reflect(-lightDirection, normal);\n' +
      
      //the dot product of the light direction and the normal
      'float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
      
      //angle between view vector and reflection vector
      'float vDotR = max(dot(viewDirection, reflectDirection), 0.0);\n' +
      
      //calculate the final color from diffuse and ambient reflection 
      'vec3 diffuse = u_LightColor * u_DiffReflectance * nDotL;\n' +

      'vec3 ambient = u_AmbiReflectance;\n' +
           
      'vec3 specular = u_LightColor * u_SpecReflectance  * pow(vDotR, u_Shininess);\n' +
      
	  //'gl_FragColor = vec4(gl_FragCoord.z, gl_FragCoord.z,gl_FragCoord.z,1.0);\n' +
	  'gl_FragColor = vec4(specular + diffuse + ambient, 1.0);\n' +
	  //'gl_FragColor = vec4(specular, 1.0);\n' +
	  //'gl_FragColor = vec4(1,0,1, 1.0);\n' +
	  '}\n';
   
	var program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	if (!program) {
		console.log('Failed to create program');
		return false;
	}
	//else console.log('Shader Program was successfully created.');
	var a_Locations=[];
	for (i=0; i<attribNamesInShader.length;i++){
		a_Locations[i]=gl.getAttribLocation(program, attribNamesInShader[i]);
	}

	// Get the location/address of the uniform variable inside the shader program.
	var mmLoc = gl.getUniformLocation(program,"u_modelT");
	var vmLoc = gl.getUniformLocation(program,"u_viewT");
	var pmLoc = gl.getUniformLocation(program,"u_projT");
	var nmLoc = gl.getUniformLocation(program,"u_NormalMatrix");
	//console.log([mmLoc,vmLoc,pmLoc,nmLoc]);

    var u_LightColor  = gl.getUniformLocation(program, 'u_LightColor');
    //console.log(u_LightColor);
    var u_LightPosition = gl.getUniformLocation(program, 'u_LightPosition');
    //console.log(u_LightPosition);
    
	var ambiReflectLoc = gl.getUniformLocation(program,"u_AmbiReflectance");
	var diffReflectLoc = gl.getUniformLocation(program,"u_DiffReflectance");
	var specReflectLoc = gl.getUniformLocation(program,"u_SpecReflectance");
	var shininessLoc   = gl.getUniformLocation(program,"u_Shininess");
    
    //var ambientLocation = gl.getUniformLocation(program,"u_Ambient");
	
	var drawMode=(model.drawMode)?gl[model.drawMode]:gl.TRIANGLES;
	var drawables=[];
	var nMeshes = model.meshes.length;
	var attribData = [];
    
    //contruct a drawable for each mesh
	for (var index=0; index<nMeshes;index++){
		var mesh = model.meshes[index];
        
		var diffReflectance = model.materials[mesh.materialIndex].diffuseReflectance;
		var ambiReflectance = model.materials[mesh.materialIndex].ambientReflectance;
		var specReflectance = model.materials[mesh.materialIndex].specularReflectance;
		var shine = model.materials[mesh.materialIndex].shininess;
        
        
		for (i=0; i<attribNamesInModel.length;i++)
			attribData[i]=mesh[attribNamesInModel[i]];
		drawables[index] = new Drawable(
			a_Locations,attribData,
			mesh.vertexPositions.length/3,
			mesh.indices, drawMode, 
            diffReflectance, ambiReflectance, specReflectance, shine
		);
	}

	var modelTransformations=[], normalTransformations=[];
	var nNodes;
	if (model.nodes){
		nNodes = model.nodes.length;
		for (var i= 0; i<nNodes; i++){
			var m = new Matrix4();
			m.elements=new Float32Array(model.nodes[i].modelMatrix);
			modelTransformations[i] = m;
			// Compute normal transformation matrix
			m = new Matrix4();
			m.elements=new Float32Array(model.nodes[i].modelMatrix);
			m.elements[12]=0;m.elements[13]=0;m.elements[14]=0;
			normalTransformations[i]=m.invert().transpose();
		}
	}
	else{
		nNodes=1;
		modelTransformations[0] = new Matrix4();
		normalTransformations[0] = new Matrix4();
	}
    
	this.delete = function()
	{
		for (var i= 0; i<nMeshes; i++) drawables[i].delete();
	}
    
    //renderable . draw
	this.draw = function (pMatrix,vMatrix,mMatrix)
	{
		gl.useProgram(program);
		gl.uniformMatrix4fv(pmLoc, false, pMatrix.elements);
		gl.uniformMatrix4fv(vmLoc, false, vMatrix.elements);
        
        //set light color to white
        gl.uniform3f(u_LightColor, myIntensity*myR, myIntensity*myG, myIntensity*myB);
        
        //set light position to eye point (0 in cam space)
        gl.uniform3f(u_LightPosition, 0.0, 0.0, 0.0);
        
        //gl.uniform3f(ambientLocation, myIntensity*ambientReflectance[0], myIntensity*myAmbient, myIntensity*myAmbient);
        
        
		//var vpMatrix = new Matrix4(pMatrix).multiply(vMatrix); // Right multiply
		var mM,nM;
		var i,j,nMeshes,node;
		for (var i= 0; i<nNodes; i++){
			mM = (mMatrix)?(new Matrix4(mMatrix).multiply(modelTransformations[i])):modelTransformations[i];
			if (mMatrix){
				nM = new Matrix4(mMatrix).multiply(normalTransformations[i]);               
				nM.elements[12]=0;nM.elements[13]=0;nM.elements[14]=0;
			}
			else nM = normalTransformations[i];
			gl.uniformMatrix4fv(mmLoc, false,mM.elements);
			gl.uniformMatrix4fv(nmLoc, false,nM.elements);
			node = model.nodes[i];
			nMeshes = node.meshIndices.length;
			for (var j=0; j<nMeshes;j++){
				drawables[node.meshIndices[j]].draw();
			}
		}
		gl.useProgram(null);
	}
	this.getBounds=function() // Computes Model bounding box
	{		
		var xmin, xmax, ymin, ymax, zmin, zmax;
		var firstvertex = true;
		var nNodes = (model.nodes)?model.nodes.length:1;
		for (var k=0; k<nNodes; k++){
			var m = new Matrix4();
			if (model.nodes)m.elements=new Float32Array(model.nodes[k].modelMatrix);
			//console.log(model.nodes[k].modelMatrix);
			var nMeshes = (model.nodes)?model.nodes[k].meshIndices.length:model.meshes.length;
			for (var n = 0; n < nMeshes; n++){
				var index = (model.nodes)?model.nodes[k].meshIndices[n]:n;
				var mesh = model.meshes[index];
				for(var i=0;i<mesh.vertexPositions.length; i+=3){
					var vertex = m.multiplyVector4(new Vector4([mesh.vertexPositions[i],mesh.vertexPositions[i+1],mesh.vertexPositions[i+2],1])).elements;
					//if (i==0){
					//	console.log([mesh.vertexPositions[i],mesh.vertexPositions[i+1],mesh.vertexPositions[i+2]]);
					//	console.log([vertex[0], vertex[1], vertex[2]]);
					//}
					if (firstvertex){
						xmin = xmax = vertex[0];
						ymin = ymax = vertex[1];
						zmin = zmax = vertex[2];
						firstvertex = false;
					}
					else{
						if (vertex[0] < xmin) xmin = vertex[0];
						else if (vertex[0] > xmax) xmax = vertex[0];
						if (vertex[1] < ymin) ymin = vertex[1];
						else if (vertex[1] > ymax) ymax = vertex[1];
						if (vertex[2] < zmin) zmin = vertex[2];
						else if (vertex[2] > zmax) zmax = vertex[2];
					}
				}
			}
		}
		var dim= {};
		dim.min = [xmin,ymin,zmin];
		dim.max = [xmax,ymax,zmax];
		//console.log(dim);
		return dim;
	}
}
function RenderableWireBoxModel(gl,d){
	var wireModel = new RenderableModel(gl,cubeLineObject);
	var factor = [(d.max[0]-d.min[0])/2,(d.max[1]-d.min[1])/2,(d.max[2]-d.min[2])/2];
	var center = [(d.min[0]+d.max[0])/2,(d.min[1]+d.max[1])/2,(d.min[2]+d.max[2])/2];
	var transformation = new Matrix4().
		translate(center[0], center[1],center[2]).
		scale(factor[0],factor[1],factor[2]);
	this.draw = function(mP,mV,mM){
		wireModel.draw(mP,mV,new Matrix4(mM).multiply(transformation));
	}
}