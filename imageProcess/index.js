import util from '../glUtil.js';

const VERTEX_SHADER = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    uniform vec2 u_resolution;
    uniform mat4 v_transform;
    void main () {
        gl_Position = (v_transform * a_position / vec4(u_resolution, 1.0, 1.0) * 2.0 - 1.0) * vec4(1, -1, 1, 1);
        v_texCoord = a_texCoord;
    }
`;

const FRAG_SHADER = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform vec2 u_textureSize;
    varying vec2 v_texCoord;
    uniform mat4 u_mask;
    void main () {
        mat4 totalMask = u_mask;
        vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
        for (int i = 0; i < 4; i++) {
            if (v_texCoord.x >= totalMask[i].x && v_texCoord.x <= totalMask[i].y && v_texCoord.y >= totalMask[i].z && v_texCoord.y <= totalMask[i].w) {
                float dY = totalMask[i].w - totalMask[i].z;
                float offsetY = v_texCoord.y - totalMask[i].z;
                vec4 up_texCoord = texture2D(u_texture, vec2(v_texCoord.x, totalMask[i].z));
                vec4 bottom_texCoord = texture2D(u_texture, vec2(v_texCoord.x, totalMask[i].w));


                gl_FragColor = up_texCoord * (1.0 - offsetY / dY) + bottom_texCoord * offsetY / dY;
                break;
            } else {
                gl_FragColor = texture2D(u_texture, v_texCoord);
            }
        }

    }
`;



function main (VERTEX_SHADER, FRAG_SHADER) {
    let canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
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

    let uMask = new Float32Array([
        0.0, 0.4, 0.2, 0.7,
        0.0, 0.5, 0.6, 1.0,
        0.0, 0.6, 0.3, 0.8,
        0.0, 0.2, 0.0, 0.3,
    ]);

    let vTransform = gl.getUniformLocation(gl.program, 'v_transform');
    let rotateMatrix = util.createRotateMatrix({x: 320, y: 180}, 30);
    gl.uniformMatrix4fv(vTransform, false, rotateMatrix);


    let u_mask = gl.getUniformLocation(gl.program, 'u_mask');
    gl.uniformMatrix4fv(u_mask, false, uMask);

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
    video.src = 'http://lmbsy.qq.com/flv/73/89/i0201oyl32u.p201.1.mp4?platform=10201&vkey=9C52B39F7131B7E09F7A949B9817454A64E4A68BEDA453B2A2512CB672EBF64E88DA5740C12CAAC256265A4195EBE799AA60F84AF01BE68B50656D2663436DBDC56A403E21F98AD645FDF6CDC7974C017A0B38568059A646626BDC49D2394AF6E1F40C41A932C9C1DD86D5A65778FF5FB625E26154113ED3&fmt=shd&sdtfrom=&level=0';
    // video.src = 'http://rs4.hive.jove.com:86/buckets/u-4df8k43v6ymuw97l/2019/03/22/1581d32a9d424f97be3089593025de8b/%E5%A5%BD%E5%A3%B0%E9%9F%B3%E7%89%B9%E5%88%AB%E8%8A%82%E7%9B%AE_a79d72d7b7ec4f088fcf9e96a58146b2_low_video.mp4';

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

    let deltaX = 0.006;
    let deltaY = 0.002;

    function draw() {
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