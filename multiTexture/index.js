import util from '../glUtil.js';

const VERTEX_SHADER = `
    attribute vec4 a_position;
    attribute vec4 a_position2;
    attribute vec2 a_texCoord;
    attribute vec2 a_texCoord2;
    varying vec2 v_texCoord;
    varying vec2 v_texCoord2;
    varying vec4 v_position;
    uniform vec2 u_resolution;
    void main () {
        vec4 mid_position = (a_position / vec4(u_resolution, 1.0, 1.0) * 2.0 - 1.0) * vec4(1.0, -1.0, 1.0, 1.0);
        gl_Position = mid_position;
        v_position = a_position;
        v_texCoord = a_texCoord;
        v_texCoord2 = a_texCoord2;
    }
`;

const FRAG_SHADER = `
    precision mediump float;
    varying vec2 v_texCoord;
    varying vec2 v_texCoord2;
    varying vec4 v_position;
    uniform sampler2D u_texture1;
    uniform sampler2D u_texture2;
    void main () {
        vec4 color1 = texture2D(u_texture1, v_texCoord);
        vec4 color2 = texture2D(u_texture2, v_texCoord2);
        if (v_position.x < 320.0) {
            gl_FragColor = color1;
        }
        else if (color2 == vec4(0.0, 0.0, 0.0, 1.0)) {
            gl_FragColor = color1;
        } else {
            gl_FragColor = vec4((color1 + color2).rgb / 2.0, 1.0);
        }


    }
`

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {*} VERTEX_SHADER
 * @param {*} FRAG_SHADER
 */
function multiTexture(gl, VERTEX_SHADER, FRAG_SHADER, images) {
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ZERO, gl.ONE, gl.ZERO);
    let canvas = gl.canvas;
    util.createProgramBySource(gl, VERTEX_SHADER, FRAG_SHADER);
    let position = new Float32Array([
        0, 0, 0.0, 0.0,
        gl.canvas.width / 2, 0.0, 1.0, 0.0,
        0, gl.canvas.height / 2, 0.0, 1.0,
        0, gl.canvas.height / 2, 0.0, 1.0,
        gl.canvas.width / 2, gl.canvas.height / 2, 1.0, 1.0,
        gl.canvas.width / 2, 0.0, 1.0, 0.0,
        gl.canvas.width / 2, gl.canvas.height / 2, 0.0, 0.0,
        gl.canvas.width, gl.canvas.height / 2, 1.0, 0.0,
        gl.canvas.width, gl.canvas.height, 1.0, 1.0,
        gl.canvas.width, gl.canvas.height, 1.0, 1.0,
        gl.canvas.width / 2, gl.canvas.height, 0.0, 1.0,
        gl.canvas.width / 2, gl.canvas.height / 2, 0.0, 0.0,
    ]);
    let position2 = new Float32Array([
        0, 0, 0.0, 0.0,
        gl.canvas.width / 2, 0.0, 1.0, 0.0,
        0, gl.canvas.height / 2, 0.0, 1.0,
        gl.canvas.width / 2, gl.canvas.height / 2, 1.0, 1.0
    ]);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);

    let buffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
    gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);

    let FSIZE = position.BYTES_PER_ELEMENT;
    let FSIZE2 = position.BYTES_PER_ELEMENT;
    let aPosition = gl.getAttribLocation(gl.program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, FSIZE * 4, 0);

    let aTexCoord = gl.getAttribLocation(gl.program, 'a_texCoord');
    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);

    // let aPosition2 = gl.getAttribLocation(gl.program, 'a_position2');
    // gl.enableVertexAttribArray(aPosition2);
    // gl.vertexAttribPointer(aPosition2, 2, gl.FLOAT, false, FSIZE * 4, 0);

    let aTexCoord2 = gl.getAttribLocation(gl.program, 'a_texCoord2');
    gl.enableVertexAttribArray(aTexCoord2);
    gl.vertexAttribPointer(aTexCoord2, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);

    let uResolution = gl.getUniformLocation(gl.program, 'u_resolution');
    gl.uniform2f(uResolution, canvas.width, canvas.height);

    let textures = [];
    for (let i = 0; i < images.length; i++) {
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
        textures.push(texture);
    }

    let u_texture1Location = gl.getUniformLocation(gl.program, 'u_texture1');
    let u_texture2Location = gl.getUniformLocation(gl.program, 'u_texture2');
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(u_texture1Location, 0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.activeTexture(gl.TEXTURE1);
    gl.uniform1i(u_texture2Location, 1);
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 12);
}


function test() {
    let canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    let gl = canvas.getContext('webgl', {
        preserveDrawingBuffer: true
    });
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    document.body.appendChild(canvas);
    let image1 = new Image();
    image1.src = '../assets/icon.jpg';


    image1.onload = function () {
        let image2 = new Image();
        image2.src = '../assets/hc.jpg';
        image2.onload = function () {
            multiTexture(gl, VERTEX_SHADER, FRAG_SHADER, [image1, image2]);
        }
    }

    let image3 = new Image();
    image3.src = '../assets/test.png';
    document.body.appendChild(image3);
}

test();