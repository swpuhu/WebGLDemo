import util from '../glUtil.js';

// 先平移再旋转
const VERTEX_SHADER = `
    attribute vec4 a_position;
    uniform vec2 u_resolution;
    attribute vec2 a_texCoord;
    uniform mat4 v_matrix;
    uniform mat4 v_translateMatrix;
    uniform mat4 v_scaleMatrix;
    varying vec2 v_texCoord;
    void main () {
        gl_Position = ((v_translateMatrix * v_matrix * v_scaleMatrix * a_position) / vec4(u_resolution, 1.0, 1.0) * 2.0 - 1.0) * vec4(1, -1, 1, 1);
        v_texCoord = a_texCoord;
    }
`;

// 先旋转再平移
const VERTEX_SHADER2 = `
    attribute vec4 a_position;
    uniform vec2 u_resolution;
    attribute vec2 a_texCoord;
    uniform mat4 v_matrix;
    uniform mat4 v_translateMatrix;
    uniform mat4 v_scaleMatrix;
    varying vec2 v_texCoord;
    void main () {
        gl_Position = ((v_matrix * v_translateMatrix * v_scaleMatrix * a_position) / vec4(u_resolution, 1.0, 1.0) * 2.0 - 1.0) * vec4(1, -1, 1, 1);
        v_texCoord = a_texCoord;
    }
`;

// 先旋转再平移
const VERTEX_SHADER3 = `
    attribute vec4 a_position;
    uniform vec2 u_resolution;
    attribute vec2 a_texCoord;
    uniform mat4 v_matrix;
    uniform mat4 v_translateMatrix;
    uniform mat4 v_scaleMatrix;
    varying vec2 v_texCoord;
    void main () {
        gl_Position = ((v_scaleMatrix * v_translateMatrix * v_matrix * a_position) / vec4(u_resolution, 1.0, 1.0) * 2.0 - 1.0) * vec4(1, -1, 1, 1);
        v_texCoord = a_texCoord;
    }
`

const FRAG_SHADER = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    void main () {
        gl_FragColor = texture2D(u_texture, v_texCoord);
    }
`;


/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {*} vertexShaderSource
 * @param {*} fragShaderSource
 * @param {*} i
 * @param {*} src
 */
function main(vertexShaderSource, fragShaderSource, i, src) {

    let canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    document.body.appendChild(canvas);
    let gl = canvas.getContext('webgl', {
        preserveDrawingBuffer: true
    });

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    util.createProgramBySource(gl, vertexShaderSource, fragShaderSource);


    let bufferPosition = new Float32Array([
        0.0, canvas.height, 0.0, 1.0, 0.0, 1.0,
        canvas.width, canvas.height, 0.0, 1.0, 1.0, 1.0,
        0.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        canvas.width, 0.0, 0.0, 1.0, 1.0, 0.0,
    ]);

    let rotate = 0;
    let center = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };

    let matrix = util.createRotateMatrix(center, rotate);
    let translateMatrix = util.createTranslateMatrix(0, 0);
    let scaleMatrix = util.createScaleMatrix(1, 1);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferPosition, gl.STATIC_DRAW);

    let texture = gl.createTexture();
    gl.activeTexture(gl['TEXTURE' + i]);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let a_position = gl.getAttribLocation(gl.program, 'a_position');
    let FSIZE = bufferPosition.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_position);

    let a_texCoord = gl.getAttribLocation(gl.program, 'a_texCoord');
    gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, FSIZE * 6, FSIZE * 4);
    gl.enableVertexAttribArray(a_texCoord);

    let u_resolution = gl.getUniformLocation(gl.program, 'u_resolution');
    gl.uniform2f(u_resolution, canvas.width, canvas.height);

    let v_matrix = gl.getUniformLocation(gl.program, 'v_matrix');
    gl.uniformMatrix4fv(v_matrix, false, matrix);

    let v_translateMatrix = gl.getUniformLocation(gl.program, 'v_translateMatrix');
    gl.uniformMatrix4fv(v_translateMatrix, false, translateMatrix);

    let v_scaleMatrix = gl.getUniformLocation(gl.program, 'v_scaleMatrix');
    gl.uniformMatrix4fv(v_scaleMatrix, false, scaleMatrix);

    let u_texture = gl.getUniformLocation(gl.program, 'u_texture');
    gl.uniform1i(u_texture, i);

    let image = new Image();
    image.src = src || '../assets/icon.jpg';
    if (image.complete) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    image.onload = function () {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function setRotateUI () {
        let div = document.createElement('div');
        let label1 = document.createElement('label');
        label1.innerText = 'rotate: ';
        let label2 = document.createElement('label');
        label2.innerText = 'translateX: ';
        let label3 = document.createElement('label');
        label3.innerText = 'translateY: ';
        let label4 = document.createElement('label');
        label4.innerText = 'scaleX: ';
        let label5 = document.createElement('label');
        label5.innerText = 'scaleY: ';
        let input = document.createElement('input');
        let input2 = document.createElement('input');
        let input3 = document.createElement('input');
        let input4 = document.createElement('input');
        let input5 = document.createElement('input');
        div.appendChild(label1);
        div.appendChild(input);
        div.appendChild(label2);
        div.appendChild(input2);
        div.appendChild(label3);
        div.appendChild(input3);
        div.appendChild(label4);
        div.appendChild(input4);
        div.appendChild(label5);
        div.appendChild(input5);
        document.body.appendChild(div);
        input.type = 'range';
        input.value = 0;
        input.max = 360;
        input.min = -360;
        input2.type = 'range';
        input2.value = 0;
        input2.max = canvas.width;
        input2.min = -canvas.width;
        input3.type = 'range';
        input3.value = 0;
        input3.max = canvas.height;
        input3.min = -canvas.height;
        input4.type = 'range';
        input4.step = 0.1;
        input4.value = 0;
        input4.max = 5;
        input4.min = 1;
        input5.type = 'range';
        input5.step = 0.1;
        input5.value = 0;
        input5.max = 5;
        input5.min = 1;

        input.oninput = function () {
            let newRotateMatrix = util.createRotateMatrix(center, +input.value);
            gl.uniformMatrix4fv(v_matrix, false, newRotateMatrix);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        function updateTranslate () {
            let newTranslateMatrix = util.createTranslateMatrix(+input2.value, +input3.value);
            gl.uniformMatrix4fv(v_translateMatrix, false, newTranslateMatrix);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        function updateScale () {
            let newScaleMatrix = util.createScaleMatrix(+input4.value, +input5.value);
            gl.uniformMatrix4fv(v_scaleMatrix, false, newScaleMatrix);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        input2.oninput = input3.oninput = updateTranslate;
        input4.oninput = input5.oninput = updateScale;
    }

    setRotateUI();
}




main(VERTEX_SHADER, FRAG_SHADER, 0);

main(VERTEX_SHADER2, FRAG_SHADER, 0);

main(VERTEX_SHADER3, FRAG_SHADER, 0);