import util from '../glUtil.js';

const VERTEX_SHADER = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main () {
        gl_Position = a_position * vec4(1.0, -1, 1, 1);
        v_texCoord = a_texCoord;
    }
`;

const FRAG_SHADER = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    uniform float u_mask[5];
    void main () {
        gl_FragColor =  texture2D(u_texture, v_texCoord);
    }
`;

/**
 *
 * @param {HTMLCanvasElement} canvas
 */
function main (canvas) {
    let gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
    gl.viewport(0, 0, canvas.width, canvas.height);
    let program = util.createProgramBySource(gl, VERTEX_SHADER, FRAG_SHADER);

    let points = new Float32Array([
        1.0, 1.0, 1.0, 1.0,
        -1.0, 1.0, 0.0, 1.0,
        1.0, -1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0, 0.0
    ]);

    let FSIZE = points.BYTES_PER_ELEMENT;
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    let a_position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(a_position);

    let a_texCoord = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(a_texCoord);

    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);


    let u_mask = gl.getUniformLocation(program, 'u_mask[0]');
    gl.uniform1fv(u_mask, new Float32Array([
        0.0, 0.5, 0.2, 0.5, 0.0
    ]));
    let masks = new Float32Array([
        0.0, 0.5, 0.2, 0.5, 1.0,
        0.1, 0.6, 0.3, 0.6, 0.0,
        0.2, 0.7, 0.4, 0.7, 1.0,
        0.3, 0.8, 0.5, 0.8, 1.0,
        0.4, 0.9, 0.6, 0.9, 0.0,
        0.5, 0.0, 0.7, 1,0, 1.0,
    ]);

    let originImageTexture = util.createTexture(gl);

    let textures = [];
    let frameBuffers = [];

    for (let i = 0; i < 2; i++) {
        let texture = util.createTexture(gl);
        textures.push(texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        let frameBuffer = gl.createFramebuffer();
        frameBuffers.push(frameBuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    }

    let image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, originImageTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // for (let i = 0; i < masks.length; i += 5) {
        //     let _mask = masks.slice(i);
        //     setFramebuffer(frameBuffers[i % 2], canvas.width, canvas.height);

        //     gl.uniform1fv(u_mask, _mask);
        //     gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        //     gl.bindTexture(gl.TEXTURE_2D, textures[i % 2]);
        // }

        setFramebuffer(null, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    let svg = document.getElementById('svg');
    image.src = 'data:image/svg+xml;base64,' + window.btoa(svg.outerHTML);

    function setFramebuffer(fbo, width, height) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        // gl.viewport(0, 0, width, height);
    }

}

export default main;``