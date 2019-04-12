import util from '../glUtil.js';

const VERTEX_SHADER = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    uniform vec2 u_resolution;
    void main () {
        gl_Position = (a_position / vec4(u_resolution, 1.0, 1.0) * 2.0 - 1.0) * vec4(1, -1, 1, 1);
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




function getWebGLContext (canvas, VERTEX_SHADER, FRAG_SHADER) {
    let gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
    util.createProgramBySource(gl, VERTEX_SHADER, FRAG_SHADER);
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let a_position = gl.getAttribLocation(gl.program, 'a_position');
    gl.enableVertexAttribArray(a_position);

    let a_texCoord = gl.getAttribLocation(gl.program, 'a_texCoord');
    gl.enableVertexAttribArray(a_texCoord);

    let u_resolution = gl.getUniformLocation(gl.program, 'u_resolution');
    gl.uniform2f(u_resolution, canvas.width, canvas.height);

    gl.drawImage1 = function (image, dx, dy, dWidth, dHeight) {
        let position;
        if (dWidth && dHeight) {
            position = new Float32Array([
                dx, dy + dHeight, 0.0, 0.0, 0.0, dHeight / canvas.height,
                dx + dWidth, dy + dHeight, 0.0, 0.0, dWidth / canvas.width, dHeight / canvas.height,
                dx, dy, 0.0, 0.0, 0.0, 0.0,
                dx + dWidth, dy, 0.0, 0.0, dWidth / canvas.width, 0.0,
            ]);
        } else if (!dWidth && !dHeight) {
            position = new Float32Array([
                dx, dy + canvas.height, 0.0, 0.0, 0.0, 1.0,
                dx + canvas.width, dy + canvas.height, 0.0, 0.0, 1.0, 1.0,
                dx, dy, 0.0, 0.0, 0.0, 0.0,
                dx + canvas.width, dy, 0.0, 0.0, 1.0, 0.0,
            ]);
        } else {
            throw new Error('参数个数错误');
        }
        let FSIZE = position.BYTES_PER_ELEMENT;
        gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);

        gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, FSIZE * 6, 0);
        gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, FSIZE * 6, FSIZE * 4);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    gl.drawImage2 = function (image, dx, dy, dWidth, dHeight) {

    }
    return gl;
}



let canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 360;
document.body.appendChild(canvas);

let gl = getWebGLContext(canvas, VERTEX_SHADER, FRAG_SHADER);
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

let image = new Image();
image.src = '../assets/hc.jpg';
image.onload = function () {
    gl.drawImage1(image, 240, 200, 340, 300);
}