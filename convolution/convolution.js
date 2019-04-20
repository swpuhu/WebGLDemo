import util from '../glUtil.js';

const VERTEX_SHADER = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    uniform int u_flipY;
    void main () {
        gl_Position = a_position;
        if (u_flipY == 1) {
            gl_Position = a_position * vec4(1.0, -1.0, 1.0, 1.0);
        }
        v_texCoord = a_texCoord;
    }
`;

const FRAG_SHADER = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform vec2 u_texResolution;
    uniform float u_kernal[100];
    uniform float u_kernalWeight;
    varying vec2 v_texCoord;
    float TERMINAL = -9999.0;
    vec4 getAverage(vec4 color) {
        float average = (color.r + color.g + color.b) / 3.0;
        // return vec4(average, average, average, color.a);
        return color;
    }

    int computeKernalSize(float kernal[100]) {
        int size = 0;
        for(int i = 0; i < 100; i++) {
            if (kernal[i] == TERMINAL) {
                size = i;
                break;
            }
        }
        return size;
    }
    void main () {
        // 计算1像素对应的纹理坐标
        vec2 onePixel = vec2(1.0, 1.0) / u_texResolution;
        vec4 colorSum = (getAverage(texture2D(u_texture, v_texCoord)) * u_kernal[4] +
        getAverage(texture2D(u_texture, v_texCoord + onePixel * vec2(-1, -1))) * u_kernal[0] +
                        getAverage(texture2D(u_texture, v_texCoord + onePixel * vec2( 0, -1))) * u_kernal[1] +
                        getAverage(texture2D(u_texture, v_texCoord + onePixel * vec2( 1, -1))) * u_kernal[2] +
                        getAverage(texture2D(u_texture, v_texCoord + onePixel * vec2(-1,  0))) * u_kernal[3] +
                        getAverage(texture2D(u_texture, v_texCoord + onePixel * vec2( 1,  0)))* u_kernal[5] +
                        getAverage(texture2D(u_texture, v_texCoord + onePixel * vec2(-1,  1))) * u_kernal[6] +
                        getAverage(texture2D(u_texture, v_texCoord + onePixel * vec2( 0,  1)))* u_kernal[7] +
                        getAverage(texture2D(u_texture, v_texCoord + onePixel * vec2( 1,  1)))* u_kernal[8]);
        gl_FragColor = vec4((colorSum / u_kernalWeight).rgb, 1.0);
    }
`;



function main (canvas) {
    /**
     * @type {WebGLRenderingContext}
     */
    let gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true});
    let program = util.createProgramBySource(gl, VERTEX_SHADER, FRAG_SHADER);

    let points = new Float32Array([
        1.0, 1.0, 1.0, 1.0,
        -1.0, 1.0, 0.0, 1.0,
        1.0, -1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0, 0.0,
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

    let u_flipY = gl.getUniformLocation(program, 'u_flipY');

    let u_texResolution = gl.getUniformLocation(program, 'u_texResolution');
    let u_kernal = gl.getUniformLocation(program, 'u_kernal[0]');
    let origin = new Float32Array([
        0, 0, 0,
        0, 1, 0,
        0, 0, 0,
    ])
    let edgeKernal = new Float32Array([
        -1, -1, -1,
        -1, 8, -1,
        -1, -1, -1,
    ]);

    let blurKernal = new Float32Array([
        1, 1 ,1,
        1, 1, 1,
        1, 1, 1,
    ]);

    let verticalEdgeKernal = new Float32Array([
        1, -2, 1,
        1, -2, 1,
        1, -2, 1,
    ]);

    let horizontalEdgeKernal = new Float32Array([
        1, 1, 1,
        -2, -2, -2,
        1, 1, 1,
    ]);

    let gaussianBlur = new Float32Array([
        0.045, 0.122, 0.045,
        0.122, 0.332, 0.122,
        0.045, 0.122, 0.045
      ]);

      let emboss = new Float32Array([
        -2, -1,  0,
        -1,  1,  1,
         0,  1,  2
     ]);

    let sharpenKernal = new Float32Array([
           -1, -1, -1,
           -1, 9, -1,
           -1, -1, -1
        ]);

    let effectsApply = [
        'origin',
        'blurKernal',
        'sharpenKernal',
        'emboss',
    ];

    let kernals = {
        origin,
        edgeKernal,
        blurKernal,
        verticalEdgeKernal,
        horizontalEdgeKernal,
        sharpenKernal,
        emboss,
        gaussianBlur
    };
    let currentKernals = origin;
    gl.uniform1fv(u_kernal, currentKernals);

    let u_kernalWeight = gl.getUniformLocation(program, 'u_kernalWeight');
    gl.uniform1f(u_kernalWeight, util.computeKernalWeight(currentKernals));

    let texture = util.createTexture(gl);
    let src = '../assets/icon.jpg';
    let image = new Image();
    image.onload = function () {
        let originImageTexture = util.createTexture(gl);
        gl.uniform2f(u_texResolution, image.width, image.height);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        let textures = [];
        let frameBuffers = [];
        for (let i = 0; i < 2; i++) {
            let texture = util.createTexture(gl);
            textures.push(texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            let fbo = gl.createFramebuffer();
            frameBuffers.push(fbo);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        }


        gl.bindTexture(gl.TEXTURE_2D, originImageTexture);
        let i =0;
        for (i = 0; i < effectsApply.length; i++) {
            setFramebuffer(frameBuffers[i % 2], canvas.width, canvas.height);
            fresh(effectsApply[i]);
            gl.bindTexture(gl.TEXTURE_2D, textures[i % 2]);
        }
        gl.uniform1i(u_flipY, 1);
        setFramebuffer(null, canvas.width, canvas.height);
        fresh('origin');
    }
    image.src = src;


    function fresh (kernalName) {
        let currentKernals = kernals[kernalName];
        gl.uniform1fv(u_kernal, currentKernals);
        gl.uniform1f(u_kernalWeight, util.computeKernalWeight(currentKernals));
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    /**
     *
     * @param {WebGLFramebuffer} fbo
     * @param {Number} width
     * @param {Number} height
     */
    function setFramebuffer(fbo, width, height) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.uniform2f(u_texResolution, width, height);
        // gl.viewport(0, 0, canvas.width, canvas.height);
        gl.viewport(0, 0, width, height);
    }

    Object.defineProperties(gl, {
        fresh: {
            value: fresh
        }
    });

    return gl;
}

export default main;