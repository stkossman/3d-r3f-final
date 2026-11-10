// All scan coordinates are in the normalized helmet space, before cinematic/physics poses.
#define APEX_DIAGNOSTIC_SCAN
uniform mat4 uScanToHelmet;
varying vec3 vScanPosition;

void apexScanVertex(vec3 localPosition) {
    vScanPosition = (uScanToHelmet * vec4(localPosition, 1.0)).xyz;
}
