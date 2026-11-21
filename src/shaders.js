export const vertexShader = /* glsl */`
varying vec2 vUv;
varying vec3 vWorldPosition;
void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}`;
export const fragmentShader = /* glsl */`
uniform sampler2D uMap;
uniform vec3 uCameraPosition;
varying vec2 vUv;
varying vec3 vWorldPosition;
void main() {
  vec4 tex = texture2D(uMap, vUv);
  float edge = 1.0 - smoothstep(0.34, 0.86, length(vUv - 0.5));
  edge = mix(0.78, 1.0, edge);
  float dist = distance(vWorldPosition, uCameraPosition);
  float depth = 1.0 - smoothstep(8.0, 22.0, dist);
  depth = mix(0.5, 1.0, depth);
  float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
  vec3 base = mix(vec3(luma), tex.rgb, mix(0.6, 1.0, depth));
  gl_FragColor = vec4(base * edge * depth, tex.a);
}`;
