import util from '../glUtil.js';

const VERTEX_SHADER = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main () {
        gl_Position = a_position;
        v_color = a_color;
    }
`;

const FRAG_SHADER = `
    precision mediump float;
    varying vec4 v_color;
    void main () {
        gl_FragColor = v_color;
    }
`;

let canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 360;
document.body.appendChild(canvas);
let gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
util.createProgramBySource(gl, VERTEX_SHADER, FRAG_SHADER);

let points = new Float32Array([
    0.0, 1.0, 1.0, 0.0, 0.0, 1.0,
    -1.0, 0.0, 0.0, 1.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 0.0, 1.0, 1.0
]);


let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

let a_position = gl.getAttribLocation(gl.program, 'a_position');
gl.enableVertexAttribArray(a_position);
let a_color = gl.getAttribLocation(gl.program, 'a_color');
gl.enableVertexAttribArray(a_color);

let FSIZE = points.BYTES_PER_ELEMENT;
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, FSIZE * 6, 0);
gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, FSIZE * 6, FSIZE * 2);

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 3);