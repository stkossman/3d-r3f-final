uniform sampler2D uRearShellMap;
uniform vec3 uRearShellColor;
uniform float uRearShellEnabled;

// Uses the component base-map UV space. RGB is linearized by the sRGB texture;
// alpha masks only the rear painted surface, leaving source opacity untouched.
vec3 apexRearShellColor(vec3 sourceColor, vec2 uv) {
  vec4 tone = texture2D(uRearShellMap, uv);
  return mix(sourceColor, tone.rgb * uRearShellColor, tone.a * uRearShellEnabled);
}
