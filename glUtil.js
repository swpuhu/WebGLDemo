/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {String} type
 * @param {String} source
 */

function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLShader} vertexShader
 * @param {WebGLShader} fragmentShader
 */
function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return gl.program = program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {String} VERTEX_SHADER
 * @param {String} FRAGMENT_SHADER
 */
function createProgramBySource(gl, VERTEX_SHADER, FRAGMENT_SHADER) {
    let vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    let program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
    gl.program = program;
    return program;
}

/**
 *
 * @param {Object} center
 * @param {Number} rotate
 */
function createRotateMatrix(center, rotate) {
    let cos = Math.cos(rotate * Math.PI / 180);
    let sin = Math.sin(rotate * Math.PI / 180);
    return new Float32Array([
        cos, sin, 0.0, 0.0,
        -sin, cos, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        (1 - cos) * center.x + sin * center.y, (1 - cos) * center.y - sin * center.x, 0.0, 1.0,
    ]);
}

/**
 *
 * @param {Number} tx
 * @param {Number} ty
 */
function createTranslateMatrix(tx, ty) {
    return new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        tx, ty, 0.0, 1.0,
    ]);
}

/**
 *
 * @param {Number} scaleX
 * @param {Number} scaleY
 */
function createScaleMatrix(scaleX, scaleY, center = {
    x: 0,
    y: 0
}) {
    return new Float32Array([
        scaleX, 0.0, 0.0, 0.0,
        0.0, scaleY, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        -scaleX * center.x + center.x, -scaleY * center.y + center.y, 0.0, 1.0,
    ]);
}

/**
 * @desc 对比度矩阵
 * @param {Number} value
 */
function createContrastMatrix(value) {
    return new Float32Array([
        value, 0.0, 0.0, 0.0,
        0.0, value, 0.0, 0.0,
        0.0, 0.0, value, 0.0,
        0.5 * (1 - value), 0.5 * (1 - value), 0.5 * (1 - value), 1.0,
    ]);
}


/**
 * @desc 色相旋转矩阵
 * @param {Number} value
 */
function createHueRotateMatrix(value) {
    let sin = Math.sin(value * Math.PI / 180);
    let cos = Math.cos(value * Math.PI / 180);
    return new Float32Array([
        0.213 + cos * 0.787 - sin * 0.213, 0.213 - cos * 0.213 + sin * 0.143, 0.213 - cos * 0.213 - sin * 0.787, 0.0,
        0.715 - cos * 0.715 - sin * 0.715, 0.715 + cos * 0.285 + sin * 0.140, 0.715 - cos * 0.715 + sin * 0.715, 0.0,
        0.072 - cos * 0.072 + sin * 0.928, 0.072 - cos * 0.072 - sin * 0.283, 0.072 + cos * 0.928 + sin * 0.072, 0.0,
        0.0, 0.0, 0.0, 1.0,
    ]);
}

/**
 * @desc 饱和度矩阵
 * @param {Number} value
 */
function createSaturateMatrix(value) {
    return new Float32Array([
        0.3086 * (1 - value) + value, 0.3086 * (1 - value), 0.3086 * (1 - value), 0.0,
        0.6094*(1 - value), 0.6094*(1 - value) + value, 0.6094*(1 - value), 0.0,
        0.0820 * (1 - value), 0.0820 * (1 - value), 0.0820 * (1 - value) + value, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {Number} x 中心x坐标
 * @param {Number} y 中心y坐标
 * @param {radius} radius 圆弧半径
 * @param {Number} startArc 起始圆弧半径
 * @param {Number} endArc 终止圆弧半径
 * @param {Boolean} clockwise 方向，默认顺时针
 */
function createArcVertex(gl, x, y, radius, startArc, endArc, isInverse = false) {
    let precision = 1;
    let oneArc = Math.PI / 180
    let points = [x, y, x / gl.canvas.width, y / gl.canvas.height];
    for (let i = startArc; i <= endArc; i += precision) {
        if (!isInverse) {
            points.push(
                x + radius * Math.sin(i * oneArc),
                (y - radius * Math.cos(i * oneArc)),
                (x + radius * Math.sin(i * oneArc)) / gl.canvas.width,
                (y - radius * Math.cos(i * oneArc)) / gl.canvas.height);
        } else {
            points.push(
                x - radius * Math.sin(i * oneArc),
                (y - radius * Math.cos(i * oneArc)),
                (x - radius * Math.sin(i * oneArc)) / gl.canvas.width,
                (y - radius * Math.cos(i * oneArc)) / gl.canvas.height);
        }

    }
    return new Float32Array(points);
}

/**
 *
 * @param {WebGLRenderingContext} gl
 */
function createTexture(gl) {
   let texture = gl.createTexture();
   gl.bindTexture(gl.TEXTURE_2D, texture);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
   return texture;
}

function computeKernalWeight(kernal) {
    let weight = kernal.reduce((prev, cur) => {
        return prev + cur;
    }, 0);
    return weight <= 0 ? 1: weight;
}

/**
 *
 * @param {Number} x
 * @param {Number} y
 * @param {Array} vertX
 * @param {Array} vertY
 */
function checkPointIn(x, y, vertX, vertY) {
    let minX = Math.min(...vertX);
    let minY = Math.min(...vertY);
    let maxX = Math.max(...vertX);
    let maxY = Math.max(...vertY);
    if (x < minX || x > maxX || y < minY || y > maxY) {
        return false;
    } else {
        let i, j, r;
        r = false;
        for (let i = 0, j = vertX.length - 1; i < vertX.length; j = i++) {
            if ((vertY[i] > y) !== (vertY[j] > y) &&
                (x < (y - vertY[i]) * (vertX[j] - vertX[i]) / (vertY[j] - vertY[i]) + vertX[i])) {
                    r = !r;
                }
        }
        return r;
    }
}

/**
 *
 * @param {Number} x
 * @param {Number} y
 * @param {Array} vertX
 * @param {Array} vertY
 */
function checkPointIn2 (x, y, vertX, vertY) {
    let minX = Math.min(...vertX);
    let minY = Math.min(...vertY);
    let maxX = Math.max(...vertX);
    let maxY = Math.max(...vertY);
    if (x < minX || x > maxX || y < minY || y > maxY) {
        return false;
    } else {
        let i, j, r;
        r = false;
        for (let i = 0, j = vertX.length - 1; i < vertX.length; j = i++) {
            if ((vertY[i] > y) !== (vertY[j] > y) &&
                (x < (y - vertY[i]) * (vertX[j] - vertX[i]) / (vertY[j] - vertY[i]) + vertX[i])) {
                    r = !r;
                }
        }
        return r;
    }

}


export default {
    createShader,
    createProgram,
    createProgramBySource,
    createRotateMatrix,
    createTranslateMatrix,
    createScaleMatrix,
    createContrastMatrix,
    createHueRotateMatrix,
    createArcVertex,
    createTexture,
    computeKernalWeight,
    checkPointIn,
    createSaturateMatrix
}