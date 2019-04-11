import util from '../glUtil.js';

const VERTEX_SHADER = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    uniform vec2 u_resolution;
    uniform mat4 u_matrix;
    void main () {
        gl_Position = (u_matrix * a_position) / vec4(u_resolution, 1.0, 1.0) * 2.0 - 1.0) * vec4(1, -1, 1, 1);
        v_texCoord = a_texCoord;
    }
`;

const FRAG_SHADER = `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_texCoord;
    void main () {
        gl_FragColor = texture2D(u_texture, v_texCoord);
    }
`;




function main (VERTEX_SHADER, FRAG_SHADER) {
    let canvas = document.createElement('canvas');
    let gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
    util.createProgramBySource(gl, VERTEX_SHADER, FRAG_SHADER);


}



main(VERTEX_SHADER, FRAG_SHADER);