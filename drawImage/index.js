import util from '../glUtil.js';

const VERTEX_SHADER = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    uniform vec2 u_resolution;
    uniform mat4 u_translate;
    uniform mat4 u_rotate;
    uniform mat4 u_scale;
    void main () {
        gl_Position = (u_translate * u_rotate * u_scale * a_position / vec4(u_resolution, 1.0, 1.0) * 2.0 - 1.0) * vec4(1, -1, 1, 1);
        v_texCoord = a_texCoord;
    }
`;


const FRAG_SHADER = `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_texCoord;
    uniform float u_mask[40];
    uniform float u_alpha;
    uniform mat4 u_hueRotate;
    uniform mat4 u_contrast;
    uniform float u_clipPath[40];
    uniform int u_isCircle;
    uniform vec2 u_texResolution;
    void main () {
        vec4 color;
        for (int i = 0; i < 40; i += 5) {
            if (v_texCoord.x >= u_mask[i] && v_texCoord.x <= u_mask[i + 1] && v_texCoord.y >= u_mask[i + 2] && v_texCoord.y <= u_mask[i + 3]) {
                if (u_mask[i + 4] == 1.0) {
                    float dX = u_mask[i + 1] - u_mask[i];
                    float offsetX = v_texCoord.x - u_mask[i];
                    vec4 up_texCoord = texture2D(u_texture, vec2(u_mask[i], v_texCoord.y));
                    vec4 bottom_texCoord = texture2D(u_texture, vec2(u_mask[i + 1], v_texCoord.y));
                    vec4 midColor = up_texCoord * (1.0 - offsetX / dX) + bottom_texCoord * offsetX / dX;
                    color = midColor;
                } else {
                    float dY = u_mask[i + 3] - u_mask[i + 2];
                    float offsetY = v_texCoord.y - u_mask[i + 2];
                    vec4 up_texCoord = texture2D(u_texture, vec2(v_texCoord.x, u_mask[i + 2]));
                    vec4 bottom_texCoord = texture2D(u_texture, vec2(v_texCoord.x, u_mask[i + 3]));
                    vec4 midColor = up_texCoord * (1.0 - offsetY / dY) + bottom_texCoord * offsetY / dY;
                    color = midColor;
                }
                break;
            } else {
                color = texture2D(u_texture, v_texCoord);
            }
        }
        if (v_texCoord.x < 0.0 ||
            v_texCoord.x > 1.0 ||
            v_texCoord.y < 0.0 ||
            v_texCoord.y > 1.0) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        } else {
            if (u_isCircle == 1) {
                if (pow(v_texCoord.x * u_texResolution.x - u_clipPath[0], 2.0) + pow(v_texCoord.y * u_texResolution.y - u_clipPath[1], 2.0) > pow(u_clipPath[2], 2.0)) {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
                } else {
                    gl_FragColor = vec4((u_hueRotate * u_contrast * color).rgb, u_alpha);
                }
                vec2 startPoint = vec2(u_clipPath[0] + sin(radians(u_clipPath[3])), u_clipPath[1] - cos(radians(u_clipPath[3])));
                vec2 endPoint = vec2(u_clipPath[0] + sin(radians(u_clipPath[4])), u_clipPath[1] - cos(radians(u_clipPath[4])));
                float angle = u_clipPath[4] - u_clipPath[3];
                vec2 vector = vec2(v_texCoord.x - u_clipPath[0], v_texCoord.y - u_clipPath[1]);
                vec2 startVector = vec2(startPoint.x - u_clipPath[0], startPoint.y - u_clipPath[1]);
                float result;
                if (vector.x * startVector.y - vector.y * startVector.x >= 0.0) {
                    result = acos(dot(vector, startVector) / (sqrt(vector.x * vector.x + vector.y * vector.y) * sqrt(startVector.x * startVector.x + startVector.y * startVector.y)));
                    if (result < 0.0) {
                        result = radians(90.0) - result;
                    }
                } else {
                    result = 2.0 * radians(360.0) - result;
                    if (result < 0.0) {
                        result = radians(270.0) + result;
                    }
                }
                if (result > (angle)) {
                    gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
                }
            } else {
                gl_FragColor = vec4((u_hueRotate * u_contrast * color).rgb, u_alpha);
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
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
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

    let u_translate = gl.getUniformLocation(gl.program, 'u_translate');
    let translateMatrix = util.createTranslateMatrix(0, 0);
    gl.uniformMatrix4fv(u_translate, false, translateMatrix);

    let u_rotate = gl.getUniformLocation(gl.program, 'u_rotate');
    let rotateMatrix = util.createRotateMatrix({
        x: 0,
        y: 0
    }, 0);
    gl.uniformMatrix4fv(u_rotate, false, rotateMatrix);

    let u_scale = gl.getUniformLocation(gl.program, 'u_scale');
    let scaleMatrix = util.createScaleMatrix(1, 1);
    gl.uniformMatrix4fv(u_scale, false, scaleMatrix);

    let u_hueRotate = gl.getUniformLocation(gl.program, 'u_hueRotate');
    let hueRotate = util.createHueRotateMatrix(0);
    gl.uniformMatrix4fv(u_hueRotate, false, hueRotate);


    let u_contrast = gl.getUniformLocation(gl.program, 'u_contrast');
    let contrast = util.createContrastMatrix(1);
    gl.uniformMatrix4fv(u_hueRotate, false, contrast);

    let uMask = new Float32Array([
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0,
    ]);
    let u_mask = gl.getUniformLocation(gl.program, 'u_mask[0]');
    gl.uniform1fv(u_mask, uMask);

    let u_alpha = gl.getUniformLocation(gl.program, 'u_alpha');
    let alpha = 1.0;
    gl.uniform1f(u_alpha, alpha);

    let u_isCircle = gl.getUniformLocation(gl.program, 'u_isCircle');
    gl.uniform1i(u_isCircle, 0);

    let u_clipPath = gl.getUniformLocation(gl.program, 'u_clipPath[0]');
    let clipPath = new Float32Array([
        300, 300, 300, 0.0, 180.0
    ]);
    gl.uniform1fv(u_clipPath, clipPath);

    let u_texResolution = gl.getUniformLocation(gl.program, 'u_texResolution');

    gl.drawImage1 = function (image, dx, dy, dWidth, dHeight) {
        let position;
        let imageWidth, imageHeight;
        if (Object.prototype.toString.call(image) === '[object HTMLVideoElement]') {
            imageWidth = image.videoWidth;
            imageHeight = image.videoHeight;
        } else {
            imageWidth = image.width;
            imageHeight = image.height;
        }
        gl.uniform2f(u_texResolution, canvas.width, canvas.height);
        if (dWidth && dHeight) {
            position = new Float32Array([
                dx, dy + dHeight, 0.0, 1.0, 0.0, dHeight / canvas.height,
                dx + dWidth, dy + dHeight, 0.0, 1.0, dWidth / canvas.width, dHeight / canvas.height,
                dx, dy, 0.0, 1.0, 0.0, 0.0,
                dx + dWidth, dy, 1.0, 0.0, dWidth / canvas.width, 0.0,
            ]);
        } else if (!dWidth && !dHeight) {
            position = new Float32Array([
                dx, dy + imageHeight, 0.0, 1.0, 0.0, 1.0,
                dx + imageWidth, dy + imageHeight, 0.0, 1.0, 1.0, 1.0,
                dx, dy, 0.0, 1.0, 0.0, 0.0,
                dx + imageWidth, dy, 0.0, 1.0, 1.0, 0.0,
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
        gl.uniform2f(u_texResolution, canvas.width, canvas.height);
        let position = new Float32Array([
            dx, dy + _dHeight, 0.0, 1.0, sx / imageWidth, (sy + _sHeight) / imageHeight,
            dx + _dWidth, dy + _dHeight, 0.0, 1.0, (sx + _sWidth) / imageWidth, (sy + _sHeight) / imageHeight,
            dx, dy, 0.0, 1.0, sx / imageWidth, sy / imageHeight,
            dx + _dWidth, dy, 0.0, 1.0, (sx + _sWidth) / imageWidth, sy / imageHeight,
        ]);

        let FSIZE = position.BYTES_PER_ELEMENT;
        gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);

        gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, FSIZE * 6, 0);
        gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, FSIZE * 6, FSIZE * 4);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    gl.drawImage = function () {
        if (arguments.length === 3) {
            /**
             * @params image, dx, dy
             */
            gl.drawImage1(...arguments);

        } else if (arguments.length === 5) {
            /**
             * @params image dx, dy, dWidth, dHeight
             */
            gl.drawImage1(...arguments);
        } else if (arguments.length === 9) {
            /**
             * @params image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
             */
            gl.drawImage2(...arguments);
        } else {
            throw new Error('参数个数错误！');
        }
    }

    /**
     * @param {Array} matrix
     */
    function setMask(mask = []) {
        let arr = [];
        if (mask.length % 5 !== 0) {
            throw new Error('数据数量错误！');
        }
        if (mask.length < 40) {
            arr = arr.concat(mask);
            for (let i = 0; i < 40 - mask.length; i++) {
                arr.push(0.0);
            }
            uMask = new Float32Array(arr);
        } else if (mask.length > 40) {
            mask = mask.slice(0, 32);
        } else {
            uMask = new Float32Array(mask);
        }

        gl.uniform1fv(u_mask, uMask);
    }


    function setTranslate(tx = 0, ty = 0) {
        let translateMatrix = util.createTranslateMatrix(tx, ty);
        gl.uniformMatrix4fv(u_translate, false, translateMatrix);
    }

    function setRotate(rotate = 0, center = {
        x: canvas.width / 2,
        y: canvas.height / 2
    }) {
        let rotateMatrix = util.createRotateMatrix(center, rotate);
        gl.uniformMatrix4fv(u_rotate, false, rotateMatrix);
    }

    function setScale(sx = 1, sy = 1) {
        let scaleMatrix = util.createScaleMatrix(sx, sy, {
            x: canvas.width / 2,
            y: canvas.height / 2
        });
        gl.uniformMatrix4fv(u_scale, false, scaleMatrix);
    }

    function setAlpha(alpha = 1) {
        gl.uniform1f(u_alpha, alpha);
    }

    function setHue(hue = 0) {
        let matrix = util.createHueRotateMatrix(hue);
        gl.uniformMatrix4fv(u_hueRotate, false, matrix);
    }

    function setContrast(contrast = 1) {
        let matrix = util.createContrastMatrix(contrast);
        gl.uniformMatrix4fv(u_contrast, false, matrix);
    }

    function setRound(x = canvas.width / 2, y = canvas.height / 2, radius = 800, startArc = 0, endArc = 360) {
        gl.uniform1i(u_isCircle, 1);
        clipPath = new Float32Array([
            x, y, radius, startArc, endArc
        ])
        gl.uniform1fv(u_clipPath, clipPath);
    }

    function cancelRound() {
        gl.uniform1i(u_isCircle, 2);
    }

    /**
     * @param {HTMLImageElement|HTMLVideoElement} image
     * @param {Number} x 中心x坐标
     * @param {Number} y 中心y坐标
     * @param {radius} radius 圆弧半径
     * @param {Number} startArc 起始圆弧半径
     * @param {Number} endArc 终止圆弧半径
     * @param {Boolean} clockwise 方向，默认顺时针
     */
    function drawArc(image, x, y, radius, startArc, endArc, clockwise = true) {
        let vertices = util.createArcVertex(this, x, y, radius, startArc, endArc, clockwise);
        let FSIZE = vertices.BYTES_PER_ELEMENT;
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, FSIZE * 4, 0);
        gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 4);
    }

    Object.defineProperties(gl, {
        setScale: {
            value: setScale
        },
        setRotate: {
            value: setRotate
        },
        setTranslate: {
            value: setTranslate
        },
        setMask: {
            value: setMask
        },
        setAlpha: {
            value: setAlpha
        },
        setHue: {
            value: setHue
        },
        setContrast: {
            value: setContrast
        },
        setRound: {
            value: setRound
        },
        cancelRound: {
            value: cancelRound
        },
        drawArc: {
            value: drawArc
        }
    });

    return gl;
}


let wrapper = document.createElement('div');
wrapper.style.cssText = 'background: url(\'../assets/hc.jpg\')'
let canvas = document.createElement('canvas');
wrapper.appendChild(canvas);
canvas.width = 640;
canvas.height = 360;
document.body.appendChild(wrapper);

let gl = getWebGLContext(canvas, VERTEX_SHADER, FRAG_SHADER);
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 0.0);
gl.clear(gl.COLOR_BUFFER_BIT);

function test() {

    let image = new Image();
    image.src = '../assets/hc.jpg';

    let canvas2d = document.createElement('canvas');
    canvas2d.width = 640;
    canvas2d.height = 360;
    // document.body.appendChild(canvas2d);
    let ctx = canvas2d.getContext('2d');

    // image.onload = function () {
    //     gl.drawImage2(image, 500, 500, 1100, 300, 0, 0, 600, 300);
    //     ctx.drawImage(image, 500, 500, 1100, 300, 0, 0, 600, 300);
    // }


    let video = document.createElement('video');
    window.video = video;
    video.crossOrigin = 'anonymous';
    video.controls = true;
    // if (Hls.isSupported()) {
    //     let hls = new Hls();
    //     hls.loadSource('../assets/result.m3u8');
    //     hls.attachMedia(video);
    //     hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {

    //     });
    //     hls.on(Hls.Events.LEVEL_LOADED, function (event, data) {
    //         console.log(data.details.totalduration);
    //     })
    // }
    // let video = window.video = document.createElement('video');
    video.src = 'http://lmbsy.qq.com/flv/118/186/w0201qrxqy1.p201.1.mp4?sdtfrom=&platform=10201&fmt=shd&vkey=3AF565DB9EB483B31E3717BBDFA9FA29B950335B0A8CD55FDF84FA01F2F23AC7BC1F0AD3447315288FA3584565CF7667837742275714CB4BF14F270CDD2866A7721DAE0211D88CFEE07DB6CDA864CF319E0EA1CEECE1E7998175ED8264C98E07C3D05729C601056067E66AB1C693B9DC09186604CC6E5B96&level=0';
    // video.src = 'http://lmbsy.qq.com/flv/118/186/w0201qrxqy1.p201.1.mp4?sdtfrom=&platform=10201&fmt=shd&vkey=3AF565DB9EB483B31E3717BBDFA9FA29B950335B0A8CD55FDF84FA01F2F23AC7BC1F0AD3447315288FA3584565CF7667837742275714CB4BF14F270CDD2866A7721DAE0211D88CFEE07DB6CDA864CF319E0EA1CEECE1E7998175ED8264C98E07C3D05729C601056067E66AB1C693B9DC09186604CC6E5B96&level=0';
    let video2 = document.createElement('video');
    window.video2 = video2;
    video2.crossOrigin = 'anonymous';
    video.controls = true;
    video2.src = 'http://lmbsy.qq.com/flv/118/186/w0201qrxqy1.p201.1.mp4?sdtfrom=&platform=10201&fmt=shd&vkey=3AF565DB9EB483B31E3717BBDFA9FA29B950335B0A8CD55FDF84FA01F2F23AC7BC1F0AD3447315288FA3584565CF7667837742275714CB4BF14F270CDD2866A7721DAE0211D88CFEE07DB6CDA864CF319E0EA1CEECE1E7998175ED8264C98E07C3D05729C601056067E66AB1C693B9DC09186604CC6E5B96&level=0';
    // video2.src = 'http://rs6.hive.jove.com:86/buckets/u-4df8k43v6ymuw97l/2019/03/22/1581d32a9d424f97be3089593025de8b/%E5%A5%BD%E5%A3%B0%E9%9F%B3%E7%89%B9%E5%88%AB%E8%8A%82%E7%9B%AE_a79d72d7b7ec4f088fcf9e96a58146b2_low_video.mp4';
    video2.loop = true;

    video2.oncanplaythrough = function () {
        gl.drawImage(video2, 0, 0, video2.videoWidth, video2.videoHeight, 200, 50, 500, 600);
    }

    video.oncanplaythrough = function () {
        gl.drawImage(video, 0, 0);
        ctx.drawImage(video, 0, 0, canvas2d.width, canvas2d.height);
    }
    video.loop = true;

    let button = document.createElement('button');
    button.innerText = 'play';
    document.body.appendChild(button);

    let id;

    function draw() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.setTranslate(video.translateX, video.translateY);
        gl.setRotate(video.rotate);
        gl.setScale(video.scaleX, video.scaleY);
        gl.setAlpha(video.alpha);
        gl.setMask(video.mask);
        gl.setHue(video.hue);
        gl.setContrast(video.contrast);
        if (video.clipPath) {
            if (video.clipPath.mode === 0) {
                if (video.clipPath.type === 'circle') {
                    gl.cancelRound();
                    gl.drawArc(video, canvas.width / 2, canvas.height / 2, video.clipPath.radius, video.clipPath.startArc, video.clipPath.endArc);
                }
            } else if (video.clipPath.mode === 1) {
                gl.setRound(canvas.width / 2, canvas.height / 2,  video.clipPath.radius, video.clipPath.startArc, video.clipPath.endArc);
                gl.drawImage(video, 0, 0, canvas.width, canvas.height);
            }
        } else {
            gl.cancelRound();
            gl.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        gl.cancelRound();
        gl.setTranslate(video2.translateX, video2.translateY);
        gl.setRotate(video2.rotate);
        gl.setScale(video2.scaleX, video2.scaleY);
        gl.setMask(video2.mask);
        gl.setAlpha(video2.alpha);
        gl.setHue(video2.hue);
        gl.setContrast(video2.contrast);
        if (video2.clipPath) {
            if (video2.clipPath.mode === 0) {
                if (video2.clipPath.type === 'circle') {
                    gl.cancelRound();
                    gl.drawArc(video2, canvas.width / 2, canvas.height / 2, video2.clipPath.radius, video2.clipPath.startArc, video2.clipPath.endArc);
                }
            } else if (video2.clipPath.mode === 1) {
                gl.setRound(canvas.width / 2, canvas.height / 2,  video2.clipPath.radius, video2.clipPath.startArc, video2.clipPath.endArc);
                gl.drawImage(video, 0, 0, canvas.width, canvas.height);
            }

        } else {
            gl.cancelRound();
            gl.drawImage(video2, 0, 0, canvas.width, canvas.height);
        }
        // gl.drawImage(video2, 300, 300, 1000, 500, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas2d.width, canvas2d.height);
        ctx.drawImage(video2, 0, 0, video2.videoWidth, video2.videoHeight, 200, 100, canvas2d.width, canvas2d.height);
        id = requestAnimationFrame(draw);
    }


    button.onmousedown = function () {
        if (video.paused) {
            video.play();
            video2.play();
            draw();
        } else {
            video.pause();
            cancelAnimationFrame(id);
        }
    }

}

function testSetMask() {
    let setMask = document.createElement('button');
    setMask.innerText = 'setMask';
    document.body.appendChild(setMask);

    setMask.onclick = function () {
        video.mask = [
            0.0, 0.4, 0.2, 0.7, 1,
            0.8, 1.0, 0.2, 0.7, 1,
            0.1, 0.5, 0.3, 0.7, 2,
            0.2, 0.6, 0.6, 0.9, 2,
            0.1, 0.5, 0.0, 0.2, 1,
            0.6, 0.9, 0.3, 0.8, 1,
        ];

        video2.mask = [
            0.0, 0.4, 0.2, 0.6, 1,
            0.2, 0.5, 0.2, 0.7, 2,
            0.1, 0.5, 0.3, 0.8, 1,
            0.5, 0.9, 0.3, 0.5, 2,
            0.1, 0.5, 0.0, 0.2, 1,
            0.6, 0.9, 0.3, 0.8, 2,
        ];
    }

    let cancel = document.createElement('button');
    cancel.innerText = 'cancelMask';
    document.body.appendChild(cancel);

    cancel.onclick = function () {
        video.mask = [
            0.0, 0.0, 0.0, 0.0, 1,
            0.0, 0.0, 0.0, 0.0, 1,
            0.0, 0.0, 0.0, 0.0, 1,
            0.0, 0.0, 0.0, 0.0, 1,
        ];

        video2.mask = [
            0.0, 0.0, 0.0, 0.0, 1,
            0.0, 0.0, 0.0, 0.0, 1,
            0.0, 0.0, 0.0, 0.0, 1,
            0.0, 0.0, 0.0, 0.0, 1,
        ];
    }

    function generateName(lastName) {
        let name = String.fromCharCode(~~(Math.random() * 26 + 97));
        if (lastName === name) {
            generateName(lastName)
        } else {
            return name;
        }
    }
    function createUI(obj) {
        let lastName;
        return (function () {

            let groups = document.createElement('div');
            let translateX = document.createElement('input');
            translateX.type = 'range';
            translateX.min = -canvas.width;
            translateX.max = canvas.width;
            translateX.value = 0;

            let translateY = document.createElement('input');
            translateY.type = 'range';
            translateY.min = -canvas.height;
            translateY.max = canvas.height;
            translateY.value = 0;

            let rotate = document.createElement('input');
            rotate.type = 'range';
            rotate.min = -180;
            rotate.max = 180;
            rotate.value = 0;


            let scaleX = document.createElement('input');
            scaleX.step = 0.1;
            scaleX.type = 'range';
            scaleX.min = 0.1;
            scaleX.max = 5;
            scaleX.value = 1;

            let scaleY = document.createElement('input');
            scaleY.step = 0.1;
            scaleY.type = 'range';
            scaleY.min = 0.1;
            scaleY.max = 5;
            scaleY.value = 1;

            let alpha = document.createElement('input');
            alpha.step = 0.02;
            alpha.type = 'range';
            alpha.min = 0;
            alpha.max = 1;
            alpha.value = 1;

            let hue = document.createElement('input');
            hue.type = 'range';
            hue.min = -180;
            hue.max = 180;
            hue.value = 0;


            let contrast = document.createElement('input');
            contrast.type = 'range';
            contrast.step = 0.02;
            contrast.min = 0;
            contrast.max = 5;
            contrast.value = 1;

            let clipPath = document.createElement('div');
            let clipPathTitle = document.createElement('h4');
            clipPathTitle.innerText = '裁剪';
            clipPath.appendChild(clipPathTitle);

            let circle = document.createElement('div');
            circle.classList.add('all-border');
            let circleLabel = document.createElement('h5');
            circleLabel.innerText = 'Circle';
            circleLabel.classList.add('sub-title');

            let name = generateName(lastName);
            let circleCheckBox = document.createElement('input');
            circleCheckBox.type = 'radio';
            circleCheckBox.name = name;

            let circleCheckBox2 = document.createElement('input');
            circleCheckBox2.type = 'radio';
            circleCheckBox2.name = name;

            let circleCheckBox3 = document.createElement('input');
            circleCheckBox3.type = 'radio';
            circleCheckBox3.name = name;

            let radiusWrapper = document.createElement('div');
            let radiusLabel = document.createElement('label');
            radiusLabel.innerText = 'radius';
            let radius = document.createElement('input');
            radius.type = 'range';
            radius.min = 0;
            radius.max = canvas.width;
            radius.value = canvas.height;
            radiusWrapper.appendChild(radiusLabel);
            radiusWrapper.appendChild(radius);

            let startArcWrapper = document.createElement('div');
            let startArcLabel = document.createElement('label');
            startArcLabel.innerText = 'startArc';
            let startArc = document.createElement('input');
            startArc.type = 'range';
            startArc.min = 0;
            startArc.max = 360;
            startArc.value = 0;
            startArcWrapper.appendChild(startArcLabel);
            startArcWrapper.appendChild(startArc);

            let endArcWrapper = document.createElement('div');
            let endArcLabel = document.createElement('label');
            endArcLabel.innerText = 'endArc';
            let endArc = document.createElement('input');
            endArc.type = 'range';
            endArc.min = 0;
            endArc.max = 360;
            endArc.value = 360;
            endArcWrapper.appendChild(endArcLabel);
            endArcWrapper.appendChild(endArc);

            function setCircle(e) {
                if (circleCheckBox.checked) {
                    obj.clipPath = {
                        mode: 0,
                        type: 'circle',
                        radius: +radius.value,
                        startArc: +startArc.value,
                        endArc: +endArc.value
                    }
                } else if (circleCheckBox2.checked) {
                    obj.clipPath = {
                        mode: 1,
                        type: 'circle',
                        radius: +radius.value,
                        startArc: +startArc.value,
                        endArc: +endArc.value
                    }
                } else {
                    obj.clipPath = null;
                }
            }
            circleCheckBox.onclick = setCircle;
            circleCheckBox2.onclick = setCircle;
            circleCheckBox3.onclick = setCircle;
            radius.oninput = setCircle;
            startArc.oninput = setCircle;
            endArc.oninput = setCircle;

            circle.appendChild(circleLabel);
            circle.appendChild(circleCheckBox);
            circle.appendChild(circleCheckBox2);
            circle.appendChild(circleCheckBox3);
            circle.appendChild(radiusWrapper);
            circle.appendChild(startArcWrapper);
            circle.appendChild(endArcWrapper);

            clipPath.appendChild(circle);

            translateX.oninput = function () {
                obj.translateX = +this.value;
            }

            translateY.oninput = function () {
                obj.translateY = +this.value;
            }

            rotate.oninput = function () {
                obj.rotate = +this.value;
            }

            scaleX.oninput = function () {
                obj.scaleX = +this.value;
            }

            scaleY.oninput = function () {
                obj.scaleY = +this.value;
            }

            alpha.oninput = function () {
                obj.alpha = +this.value;
            }

            hue.oninput = function () {
                obj.hue = +this.value;
            }

            contrast.oninput = function () {
                obj.contrast = +this.value;
            }

            let labelTranslateX = document.createElement('label');
            labelTranslateX.innerText = 'translateX';
            let labelTranslateY = document.createElement('label');
            labelTranslateY.innerText = 'translateY';
            let labelRotate = document.createElement('label');
            labelRotate.innerText = 'rotate';
            let labelScaleX = document.createElement('label');
            labelScaleX.innerText = 'scaleX';
            let labelScaleY = document.createElement('label');
            labelScaleY.innerText = 'scaleY';
            let labelAlpha = document.createElement('label');
            labelAlpha.innerText = 'alpha';
            let labelHue = document.createElement('label');
            labelHue.innerText = 'hue';
            let labelContrast = document.createElement('label');
            labelContrast.innerText = 'contrast';

            let translateXWrapper = document.createElement('div');
            let translateYWrapper = document.createElement('div');
            let rotateWrapper = document.createElement('div');
            let scaleXWrapper = document.createElement('div');
            let scaleYWrapper = document.createElement('div');
            let alphaWrapper = document.createElement('div');
            let hueWrapper = document.createElement('div');
            let contrastWrapper = document.createElement('div');

            translateXWrapper.appendChild(labelTranslateX);
            translateXWrapper.appendChild(translateX);
            translateYWrapper.appendChild(labelTranslateY);
            translateYWrapper.appendChild(translateY);
            rotateWrapper.appendChild(labelRotate);
            rotateWrapper.appendChild(rotate);
            scaleXWrapper.appendChild(labelScaleX);
            scaleXWrapper.appendChild(scaleX);
            scaleYWrapper.appendChild(labelScaleY);
            scaleYWrapper.appendChild(scaleY);
            alphaWrapper.appendChild(labelAlpha);
            alphaWrapper.appendChild(alpha);
            hueWrapper.appendChild(labelHue);
            hueWrapper.appendChild(hue);
            contrastWrapper.appendChild(labelContrast);
            contrastWrapper.appendChild(contrast);


            groups.appendChild(translateXWrapper);
            groups.appendChild(translateYWrapper);
            groups.appendChild(rotateWrapper);
            groups.appendChild(scaleXWrapper);
            groups.appendChild(scaleYWrapper);
            groups.appendChild(alphaWrapper);
            groups.appendChild(hueWrapper);
            groups.appendChild(contrastWrapper);
            groups.appendChild(clipPath);
            groups.style.cssText = `
            margin: 0 15px;
        `;
            return groups;
        }());
    }

    let groups = document.createElement('div');
    let group1 = createUI(video);
    let group2 = createUI(video2);
    groups.appendChild(group1);
    groups.appendChild(group2);
    groups.style.cssText = `
        display: flex;
    `
    document.body.appendChild(groups);
}

test();
testSetMask();