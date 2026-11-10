#define APEX_DIAGNOSTIC_SCAN
uniform float uScanTime;
uniform float uScanProgress;
uniform float uScanIntensity;
uniform vec3 uScanColor;
varying vec3 vScanPosition;

vec3 apexDiagnosticScan() {
    if (uScanIntensity <= 0.0) return vec3(0.0);
    // Move beyond both ends of the measured shell bounds to enter/leave cleanly.
    float scanHeight = mix(0.25, 1.85, clamp(uScanProgress, 0.0, 1.0));
    float distanceToBand = abs(vScanPosition.y - scanHeight);
    float core = 1.0 - smoothstep(0.012, 0.045, distanceToBand);
    float shoulder = 1.0 - smoothstep(0.045, 0.16, distanceToBand);
    float graduations = mix(0.72, 1.0,
        step(0.84, fract((vScanPosition.x + vScanPosition.z) * 16.0 + uScanTime * 0.35)));
    return uScanColor * uScanIntensity * (core + shoulder * 0.12) * graduations;
}
