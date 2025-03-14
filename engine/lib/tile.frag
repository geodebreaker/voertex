precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D uTexture;
uniform vec2 uScale;

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;
    uv *= uScale;
    gl_FragColor = texture2D(uTexture, uv);
}
