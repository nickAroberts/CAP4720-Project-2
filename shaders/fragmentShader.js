precision mediump float;

uniform vec3 u_LightColor;
uniform vec3 u_LightPosition;
uniform vec3 u_lightAt;

uniform vec3 u_DiffReflectance;
uniform vec3 u_AmbiReflectance;
uniform vec3 u_SpecReflectance;

uniform float u_Shininess;
uniform float u_spotAngle;

//uniform vec3 u_Ambient;

varying vec3 v_Normal;
varying vec3 v_Position;

void main()
{
   //Normalize normal because it is interpolated and not 1.0
   vec3 normal = normalize(v_Normal);

   // Calculate the light direction and make it 1.0 in length
   // points from frag position to light position
   vec3 lightDirection = normalize(u_LightPosition - v_Position);

   // Calculate the spot-light direction
   vec3 spotLightDirection = vec3(0, 0, -1);

   // Calculate view direction vector, when cam is 0,0,0, in view space
   // points from frag position to camera
   vec3 viewDirection = normalize( - v_Position);

   // Calculate reflect direction, points from frag to reflect loc
   vec3 reflectDirection = reflect(-lightDirection, normal);

   // Calculate angle between spot-light look direction and from light to
   // frag direction
   float sDotF = dot(spotLightDirection, -viewDirection);

   // Difference between the spot light angle and sDotF
   float spotDiff = (sDotF < cos(radians(u_spotAngle))) ? 0.0:pow(sDotF, 50.0);

   // The dot product of the light direction and the normal
   float nDotL = max(dot(lightDirection, normal), 0.0);

   // Angle between view vector and reflection vector
   float vDotR = max(dot(viewDirection, reflectDirection), 0.0);

   // Calculate the final color from diffuse and ambient reflection
   vec3 diffuse = u_LightColor * u_DiffReflectance * nDotL * spotDiff;

   vec3 ambient = u_AmbiReflectance * spotDiff;

   vec3 specular = u_LightColor * u_SpecReflectance  * pow(vDotR, u_Shininess);

   //gl_FragColor = vec4(gl_FragCoord.z, gl_FragCoord.z,gl_FragCoord.z,1.0);
   gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
   //gl_FragColor = vec4(specular, 1.0);
   //gl_FragColor = vec4(1,0,1, 1.0);
}