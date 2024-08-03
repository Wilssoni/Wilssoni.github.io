precision mediump float;

uniform float u_time;

attribute vec2 a_position;
attribute vec2 a_texcoord;
varying vec2 v_texcoord;

void main() {
    //vec2 modified = vec2(a_position.x * sin(u_time), a_position.y * sin(u_time));
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texcoord = a_texcoord;
}
