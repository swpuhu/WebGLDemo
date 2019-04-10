import util from './glUtil.js';

let VERTEX_SHADER = `
  attribute vec4 a_Position;
  void main () {
    gl_Position = a_Position;
  }
`

let FRAGMENT_SHADER = `
  precision mediump float;
  void main () {
    gl_FragColor = vec4(0.5, 0.2, 0.2, 1.0);
  }
`


function main() {
  let canvas = document.createElement('canvas');
  canvas.width = canvas.height = 500;
  let gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
  let program = util.createProgramBySource(gl, VERTEX_SHADER, FRAGMENT_SHADER);
  gl.useProgram(program);
  let input = document.createElement('input');
  input.type = 'range';
  input.min = 1;
  input.max = 90;
  input.step = 1;
  input.value = 90;
  document.body.appendChild(canvas);
  document.body.appendChild(input);
  let positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRound(gl, program, 10);
  input.oninput = function () {
    setRound(gl, program, +this.value);
  }
}
/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {Number} _step
 */
function setRound(gl, program, _step) {
  let points = [0.0, 0.0];
  let step = _step;
  for (let i = 0; i <= 360; i += step) {
    points.push(Math.cos(i * Math.PI / 180));
    points.push(Math.sin(i * Math.PI / 180));
  }
  if (360 % step !== 0) {
    points.push(1.0);
    points.push(0.0);
  }
  points = new Float32Array(points);
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
  let a_Position = gl.getAttribLocation(program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length / 2);
}
main();

