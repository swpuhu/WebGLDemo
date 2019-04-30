import util from '../glUtil.js';

const VERTEX_SHADER = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    uniform vec2 u_resolution;
    uniform mat4 u_translate;
    uniform mat4 u_rotate;
    uniform mat4 u_scale;
    varying vec4 v_transPosition;
    uniform int u_enable;
    void main () {
        if (u_enable == 1) {
            v_transPosition = u_translate * u_rotate * u_scale * a_position;
            gl_Position = (v_transPosition / vec4(u_resolution, 1.0, 1.0) * 2.0 - 1.0) * vec4(1, -1, 1, 1);
        } else {
            v_transPosition = a_position;
            gl_Position = (v_transPosition / vec4(u_resolution, 1.0, 1.0) * 2.0 - 1.0);
        }
        v_texCoord = a_texCoord;
    }
`;


const FRAG_SHADER = `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_texCoord;
    varying vec4 v_transPosition;
    uniform float u_mask[5];
    uniform float u_alpha;
    uniform mat4 u_hueRotate;
    uniform mat4 u_contrast;
    uniform mat4 u_saturate;
    uniform float u_clipPath[6];
    uniform float u_clipPathX[10];
    uniform float u_clipPathY[10];
    uniform int u_isCircle;
    uniform vec4 u_dipColor;
    uniform vec2 u_texResolution;
    const float TERMINAL = -10000.0;

    float getMax(float path[10]) {
        float max = path[0];
        for (int i = 1; i < 10; i++) {
            if (path[i] == TERMINAL) {
                break;
            }
            if (max < path[i]) {
                max = path[i];
            }
        }
        return max;
    }

    float getMin(float path[10]) {
        float min = path[0];
        for (int i = 1; i < 10; i++) {
            if (path[i] == TERMINAL) {
                break;
            }
            if (min > path[i]) {
                min = path[i];
            }
        }
        return min;
    }
    // 检测是否在三角形内
    bool isInTriangle (vec2 p1, vec2 p2, vec2 p3, vec2 p) {
        vec2 v1 = p1 - p;
        vec2 v2 = p2 - p;
        vec2 v3 = p3 - p;
        float t1 = v1.x * v2.y - v1.y * v2.x;
        float t2 = v2.x * v3.y - v2.y * v3.x;
        float t3 = v3.x * v1.y - v3.y * v1.x;
        if ((t1 < 0.0 && t2 < 0.0 && t3 < 0.0) ||
            (t1 >= 0.0 && t2 >= 0.0 && t3 >= 0.0)) {
            return true;
        } else {
            return false;
        }
    }

    bool checkPointIn(float x, float y, float pathX[10], float pathY[10]) {
        float minX = getMin(pathX);
        float maxX = getMax(pathX);
        float minY = getMin(pathY);
        float maxY = getMax(pathY);
        if (x < minX || x> maxX || y < minY || y > maxY) {
            return false;
        } else {
            bool r = false;
            for (int i = 0; i < 10; i += 3) {
                if (pathX[i] == TERMINAL) {
                    break;
                }
                if (isInTriangle(vec2(pathX[i], pathY[i]), vec2(pathX[i + 1], pathY[i + 1]), vec2(pathX[i + 2], pathY[i + 2]), vec2(x, y))) {
                    r = true;
                    break;
                }
            }
            return r;
        }
    }

    void main () {
        vec4 color;
        vec2 p = v_transPosition.xy;
        // vec2 p = v_texCoord * u_texResolution;
        if (v_texCoord.x >= u_mask[0] && v_texCoord.x <= u_mask[1] && v_texCoord.y >= u_mask[2] && v_texCoord.y <= u_mask[3]) {
            if (u_mask[4] == 1.0) {
                float dX = u_mask[1] - u_mask[0];
                float offsetX = v_texCoord.x - u_mask[0];
                vec4 up_texCoord = texture2D(u_texture, vec2(u_mask[0], v_texCoord.y));
                vec4 bottom_texCoord = texture2D(u_texture, vec2(u_mask[1], v_texCoord.y));
                vec4 midColor = up_texCoord * (1.0 - offsetX / dX) + bottom_texCoord * offsetX / dX;
                color = midColor;
            } else {
                float dY = u_mask[3] - u_mask[2];
                float offsetY = v_texCoord.y - u_mask[2];
                vec4 up_texCoord = texture2D(u_texture, vec2(v_texCoord.x, u_mask[2]));
                vec4 bottom_texCoord = texture2D(u_texture, vec2(v_texCoord.x, u_mask[3]));
                vec4 midColor = up_texCoord * (1.0 - offsetY / dY) + bottom_texCoord * offsetY / dY;
                color = midColor;
            }
        } else {
            color = texture2D(u_texture, v_texCoord);
        }

        if (v_texCoord.x < 0.0 ||
            v_texCoord.x > 1.0 ||
            v_texCoord.y < 0.0 ||
            v_texCoord.y > 1.0) {
                color = vec4(0.0, 0.0, 0.0, 0.0);
        } else {
            if (u_isCircle == 1) {
                float centerX = u_clipPath[0];
                float centerY = u_clipPath[1];
                float radius = u_clipPath[2];
                float startArc = radians(u_clipPath[3]);
                float endArc = radians(u_clipPath[4]);
                float angle = endArc - startArc;
                float isInverse = u_clipPath[5];
                if (pow(p.x - centerX, 2.0) + pow(p.y - centerY, 2.0) > pow(radius, 2.0)) {
                    color = vec4(0.0, 0.0, 0.0, 0.0);
                } else {
                    vec2 startVector = vec2(radius * sin(startArc), -radius * cos(startArc));
                    if (isInverse == 1.0) {
                        startVector = vec2(-radius * sin(startArc), -radius * cos(startArc));
                    }
                    if (angle < 0.0) {
                        angle = -angle;
                        startVector = vec2(radius * sin(endArc), -radius * cos(endArc));
                        if (isInverse == 1.0) {
                            startVector = vec2(-radius * sin(endArc), -radius * cos(endArc));
                        }
                    }
                    vec2 vector = vec2(p.x - centerX, p.y - centerY);
                    float result = acos(dot(vector, startVector) / (length(vector) * length(startVector)));
                    if (isInverse == 1.0) {
                        if (vector.x * startVector.y - vector.y * startVector.x < 0.0) {
                            result = radians(360.0) - result;
                        }
                    } else {
                        if (vector.x * startVector.y - vector.y * startVector.x > 0.0) {
                            result = radians(360.0) - result;
                        }
                    }
                    if (result > angle) {
                        color = vec4(0.0, 0.0, 0.0, 0.0);
                    } else {
                        color = vec4((u_saturate * u_hueRotate * u_contrast * color).rgb, u_alpha);
                    }
                }
            } else {
                if (checkPointIn(p.x, p.y, u_clipPathX, u_clipPathY)) {
                    color = vec4((u_saturate * u_hueRotate * u_contrast * color).rgb, u_alpha);
                } else {
                    color = vec4(0.0, 0.0, 0.0, 0.0);
                }
            }
        }

        gl_FragColor = vec4((color.rgb * (1.0 - u_dipColor.w) + u_dipColor.rgb * u_dipColor.w), color.a);
    }
`;



function getWebGLContext(canvas) {
    const TERMINAL = -10000.0;
    /**
     * @type {WebGLRenderingContext}
     */
    let gl = canvas.getContext('webgl2', {
        preserveDrawingBuffer: true,
        antialias: true
    });
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
    util.createProgramBySource(gl, VERTEX_SHADER, FRAG_SHADER);
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    let originTexture = util.createTexture(gl);
    let textures = [];
    let frameBuffers = [];

    for (let i = 0; i < 2; ++i) {
        let texture = util.createTexture(gl);
        textures.push(texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        let frameBuffer = gl.createFramebuffer();
        frameBuffers.push(frameBuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    }
    gl.bindTexture(gl.TEXTURE_2D, originTexture);

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

    let u_saturate = gl.getUniformLocation(gl.program, 'u_saturate');
    let saturate = util.createSaturateMatrix(1);
    gl.uniformMatrix4fv(u_saturate, false, saturate);

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

    let u_clipPathX = gl.getUniformLocation(gl.program, 'u_clipPathX[0]');
    let clipPathX = new Float32Array([0, canvas.width, canvas.width, canvas.width, 0, 0, TERMINAL]);
    gl.uniform1fv(u_clipPathX, clipPathX);

    let u_clipPathY = gl.getUniformLocation(gl.program, 'u_clipPathY[0]');
    let clipPathY = new Float32Array([0, 0, canvas.height, canvas.height, canvas.height, 0,TERMINAL]);
    gl.uniform1fv(u_clipPathY, clipPathY);

    let u_dipColor = gl.getUniformLocation(gl.program, 'u_dipColor');
    let dipToColor = new Float32Array([
        1.0, 1.0, 0.0, 0.1
    ]);
    gl.uniform4fv(u_dipColor, dipToColor);

    let u_enable = gl.getUniformLocation(gl.program, 'u_enable');
    gl.uniform1i(u_enable, 1);

    let u_texResolution = gl.getUniformLocation(gl.program, 'u_texResolution');

    gl.drawImage1 = function(image, dx, dy, dWidth, dHeight) {
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
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    gl.drawImage2 = function(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
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
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    gl.drawImage = function() {
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
        if (!mask.length) return;
        let arr = [];
        let n = 40;
        gl.uniform1i(u_enable, 0);
        if (mask.length % 5 !== 0) {
            throw new Error('数据数量错误！');
        }
        if (mask.length < n) {
            arr = arr.concat(mask);
            for (let i = 0; i < n - mask.length; i++) {
                arr.push(0.0);
            }
            uMask = new Float32Array(arr);
        } else if (mask.length > n) {
            uMask = mask.slice(0, n);
        } else {
            uMask = new Float32Array(mask);
        }

        for (let i = 0; i < uMask.length; i+= 5) {
            let _mask = uMask.slice(i, i + 5);
            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[i % 2]);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1fv(u_mask, _mask);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.bindTexture(gl.TEXTURE_2D, textures[i % 2]);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform1i(u_enable, 1);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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

    function setSaturate(saturate = 1) {
        let matrix = util.createSaturateMatrix(saturate);
        gl.uniformMatrix4fv(u_saturate, false, matrix);
    }

    function setDipColor(r = 0, g = 0, b = 0, p = 0) {
        let dipToColor = new Float32Array([
            r, g, b, p
        ]);
        gl.uniform4fv(u_dipColor, dipToColor);
    }

    function setRound(x = canvas.width / 2, y = canvas.height / 2, radius = 800, startArc = 0, endArc = 360, isInverse = false) {
        gl.uniform1i(u_isCircle, 1);
        clipPath = new Float32Array([
            x, y, radius, startArc, endArc, isInverse ? 1 : 0
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
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
        setSaturate: {
            value: setSaturate
        },
        cancelRound: {
            value: cancelRound
        },
        drawArc: {
            value: drawArc
        },
        setDipColor: {
            value: setDipColor
        }
    });

    return gl;
}

export default getWebGLContext;
