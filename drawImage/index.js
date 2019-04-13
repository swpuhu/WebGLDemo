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
    uniform mat4 u_mask;
    void main () {
        mat4 totalMask = u_mask;
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




function getWebGLContext(canvas, VERTEX_SHADER, FRAG_SHADER) {
    /**
     * @type {WebGLRenderingContext}
     */
    let gl = canvas.getContext('webgl', {
        preserveDrawingBuffer: true
    });
    window.gl = gl;
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

    let uMask = new Float32Array([
        0.0, 0.4, 0.2, 0.7,
        0.0, 0.5, 0.6, 1.0,
        0.0, 0.6, 0.3, 0.8,
        0.0, 0.2, 0.0, 0.3,
    ]);

    let u_mask = gl.getUniformLocation(gl.program, 'u_mask');
    gl.uniformMatrix4fv(u_mask, false, uMask);

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

    gl.drawImage2 = function (image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
        let imageWidth, imageHeight;
        let canvasWidth = this.canvas.width;
        let canvasHeight = this.canvas.height;
        let _sWidth = sWidth;
        let _sHeight = sHeight;
        let _dWidth = dWidth;
        let _dHeight = dHeight;
        if (Object.prototype.toString.call(image) === '[object HTMLVideoElement]') {
            imageWidth = image.videoWidth;
            imageHeight = image.videoHeight;
        } else {
            imageWidth = image.width;
            imageHeight = image.height;
        }
        if (sx + sWidth > imageWidth) {
            _sWidth = imageWidth - sx;
            _dWidth = _sWidth / sWidth * dWidth;
        }
        if (sy + sHeight > imageHeight) {
            _sHeight = imageHeight - sy;
            _dHeight = _sHeight / sHeight * dHeight;
        }
        // if (dWidth > sWidth) {
        //     dWidth = sWidth;
        // }
        // if (dHeight > sHeight) {
        //     dHeight = sHeight;
        // }
        let position = new Float32Array([
            dx, dy + _dHeight, 0.0, 0.0, sx / imageWidth, (sy + _sHeight) / imageHeight,
            dx + _dWidth, dy + _dHeight, 0.0, 0.0, (sx + _sWidth) / imageWidth, (sy + _sHeight) / imageHeight,
            dx, dy, 0.0, 0.0, sx / imageWidth, sy / imageHeight,
            dx + _dWidth, dy, 0.0, 0.0, (sx + _sWidth) / imageWidth, sy / imageHeight,
        ]);

        let FSIZE = position.BYTES_PER_ELEMENT;
        gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);

        gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, FSIZE * 6, 0);
        gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, FSIZE * 6, FSIZE * 4);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    return gl;
}



function test() {
    let canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    document.body.appendChild(canvas);

    let gl = getWebGLContext(canvas, VERTEX_SHADER, FRAG_SHADER);
    gl.clearColor(1.0, 1.0, 0.0, 0.8);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let image = new Image();
    image.src = '../assets/hc.jpg';

    let canvas2d = document.createElement('canvas');
    canvas2d.width = 640;
    canvas2d.height = 360;
    document.body.appendChild(canvas2d);
    let ctx = canvas2d.getContext('2d');

    // image.onload = function () {
    //     gl.drawImage2(image, 500, 500, 1100, 300, 0, 0, 600, 300);
    //     ctx.drawImage(image, 500, 500, 1100, 300, 0, 0, 600, 300);
    // }


    let video = document.createElement('video');
    window.video = video;
    video.crossOrigin = 'anonymous';
    video.controls = true;
    if (Hls.isSupported()) {
        let hls = new Hls();
        hls.loadSource('../assets/u0027cffhts.321002.ts.m3u8');
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
            console.log(data);
            video.play();
        });
        hls.on(Hls.Events.LEVEL_LOADED, function (event, data) {
            console.log(data.details.totalduration);
        })
    }
    // let video = window.video = document.createElement('video');
    // video.src = 'http://lmbsy.qq.com/flv/73/89/i0201oyl32u.p201.1.mp4?platform=10201&vkey=9C52B39F7131B7E09F7A949B9817454A64E4A68BEDA453B2A2512CB672EBF64E88DA5740C12CAAC256265A4195EBE799AA60F84AF01BE68B50656D2663436DBDC56A403E21F98AD645FDF6CDC7974C017A0B38568059A646626BDC49D2394AF6E1F40C41A932C9C1DD86D5A65778FF5FB625E26154113ED3&fmt=shd&sdtfrom=&level=0';
    // video.src = 'http://lmbsy.qq.com/flv/118/186/w0201qrxqy1.p201.1.mp4?sdtfrom=&platform=10201&fmt=shd&vkey=3AF565DB9EB483B31E3717BBDFA9FA29B950335B0A8CD55FDF84FA01F2F23AC7BC1F0AD3447315288FA3584565CF7667837742275714CB4BF14F270CDD2866A7721DAE0211D88CFEE07DB6CDA864CF319E0EA1CEECE1E7998175ED8264C98E07C3D05729C601056067E66AB1C693B9DC09186604CC6E5B96&level=0';

    let sx = 0;
    let sy = 0;
    let sWidth = 848;
    let sHeight = 480;
    let dx = 0;
    let dy = 0;
    let dWidth = 640;
    let dHeight = 360;


    video.oncanplaythrough = function () {
        gl.drawImage2(video, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        ctx.drawImage(video, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }

    let button = document.createElement('button');
    button.innerText = 'play';
    document.body.appendChild(button);

    let id;

    function draw() {
        gl.drawImage2(video, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        ctx.drawImage(video, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        id = requestAnimationFrame(draw);
    }


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

test();