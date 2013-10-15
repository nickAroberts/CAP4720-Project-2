attribute vec3 a_position;
attribute vec3 a_normal;
            	  
uniform mat4 u_modelT;
uniform mat4 u_viewT;
uniform mat4 u_projT;
uniform mat4 u_NormalMatrix;
      
varying vec3 v_Normal;
varying vec3 v_Position;
      
      
void main()
{
   gl_Position =u_projT * u_viewT * u_modelT * vec4(a_position,1.0);
    
   v_Position = vec3( u_viewT * u_modelT * vec4(a_position,1.0));
      
   v_Normal = normalize(vec3(u_viewT*u_NormalMatrix * vec4(a_normal, 0.0)));
}