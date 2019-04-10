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
function createProgramBySource (gl, VERTEX_SHADER, FRAGMENT_SHADER) {
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
function createScaleMatrix(scaleX, scaleY) {
    return new Float32Array([
        scaleX, 0.0, 0.0, 0.0,
        0.0, scaleY, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,
    ]);
}

export default {
  createShader, createProgram, createProgramBySource,
  createRotateMatrix, createTranslateMatrix, createScaleMatrix
}