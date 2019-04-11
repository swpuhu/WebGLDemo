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
    uniform vec2 u_textureSize;
    varying vec2 v_texCoord;
    uniform float u_x1;
    uniform float u_x2;
    uniform float u_y1;
    uniform float u_y2;
    void main () {
        vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
        if (v_texCoord.x >= u_x1 && v_texCoord.x <= u_x2 && v_texCoord.y >= u_y1 && v_texCoord.y <= u_y2) {
            vec2 mid_texCoord = vec2(v_texCoord.x, u_y2);
            // vec2 mid_texCoord = vec2(u_x2, v_texCoord.y);
            gl_FragColor = texture2D(u_texture, mid_texCoord);
        } else {
            gl_FragColor = texture2D(u_texture, v_texCoord);
        }

    }
`;




function main (VERTEX_SHADER, FRAG_SHADER) {
    let canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 320;
    document.body.appendChild(canvas);
    let gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
    util.createProgramBySource(gl, VERTEX_SHADER, FRAG_SHADER);

    let position = new Float32Array([
        0, 0, 0.0, 0.0,
        canvas.width, 0.0, 1.0, 0.0,
        0, canvas.height, 0.0, 1.0,
        canvas.width, canvas.height, 1.0, 1.0
    ]);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);
    let FSIZE = position.BYTES_PER_ELEMENT;
    let aPosition = gl.getAttribLocation(gl.program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, FSIZE * 4, 0);

    let aTexCoord = gl.getAttribLocation(gl.program, 'a_texCoord');
    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);

    let uResolution = gl.getUniformLocation(gl.program, 'u_resolution');
    gl.uniform2f(uResolution, canvas.width, canvas.height);

    let uX1 = gl.getUniformLocation(gl.program, 'u_x1');
    let uX2 = gl.getUniformLocation(gl.program, 'u_x2');
    let uY1 = gl.getUniformLocation(gl.program, 'u_y1');
    let uY2 = gl.getUniformLocation(gl.program, 'u_y2');
    let x1 = 0.0;
    let y1 = 0.0;
    let x2 = 0.5;
    let y2 = 0.3;
    gl.uniform1f(uX1, x1);
    gl.uniform1f(uX2, x2);
    gl.uniform1f(uY1, y1);
    gl.uniform1f(uY2, y2);

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // let image = new Image();
    // image.src = '../assets/icon.jpg';
    // image.onload = function () {
    //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    //     gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // }
    let id;
    let video = window.video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.controls = true;
    // document.body.appendChild(window.video);
    video.src = 'http://lmbsy.qq.com/flv/73/89/i0201oyl32u.p201.1.mp4?platform=10201&vkey=9C52B39F7131B7E09F7A949B9817454A64E4A68BEDA453B2A2512CB672EBF64E88DA5740C12CAAC256265A4195EBE799AA60F84AF01BE68B50656D2663436DBDC56A403E21F98AD645FDF6CDC7974C017A0B38568059A646626BDC49D2394AF6E1F40C41A932C9C1DD86D5A65778FF5FB625E26154113ED3&fmt=shd&sdtfrom=&level=0';

    video.oncanplaythrough = function () {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    video.oncancel = function () {
        cancelAnimationFrame(id);
        console.log('cancel');
    }

    video.onpause = function () {
        cancelAnimationFrame(id);
        console.log('pause');
    }

    video.onabort = function () {
        cancelAnimationFrame(id);
        console.log('abort');
    }

    let delta = 0.006;

    function draw() {
        gl.uniform1f(uX1, x1);
        gl.uniform1f(uX2, x2);
        gl.uniform1f(uY1, y1);
        gl.uniform1f(uY2, y2);
        if (x2 >= 1.0 || y2 >= 1.0 || x1 < 0.0 || y1 < 0.0) {
            delta = -delta;
        }
        x1 += delta;
        x2 += delta;
        y1 += delta;
        y2 += delta;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        id = requestAnimationFrame(draw);
    }

    let button = document.createElement('button');
    document.body.appendChild(button);
    button.innerText = 'play';

    button.onmousedown = function () {
        if (video.paused) {
            video.play();
            draw();
        } else {
            video.pause();
            cancelAnimationFrame(id);
        }


    }

}

main(VERTEX_SHADER, FRAG_SHADER);