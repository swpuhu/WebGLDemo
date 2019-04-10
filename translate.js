import util from './glUtil.js';
const VERTEX_SHADER = `
    attribute vec4 a_position;
    uniform vec2 u_resolution;
    uniform mat4 u_transform;
    void main () {
        gl_Position = ((u_transform * a_position) / vec4(u_resolution, 1.0, 1.0) * 2.0 - 1.0) * vec4(1, -1, 1, 1);
    }
`;

const FRAG_SHADER = `
    precision mediump float;
    uniform vec4 u_color;
    void main () {
        gl_FragColor = u_color;
    }
`


function main() {
    let canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    let gl = canvas.getContext('webgl', {
        preserveDrawingBuffer: true
    });
    util.createProgramBySource(gl, VERTEX_SHADER, FRAG_SHADER);

    let resolutionLocation = gl.getUniformLocation(gl.program, 'u_resolution');

    let colorLocation = gl.getUniformLocation(gl.program, 'u_color');

    let positionLocation = gl.getAttribLocation(gl.program, 'a_position');

    let transformLocation = gl.getUniformLocation(gl.program, 'u_transform');

    let positionBuffer = gl.createBuffer();

    let translation = [0, 0];
    let width = 100;
    let height = 30;
    let color = [Math.random(), Math.random(), Math.random(), 1];

    drawScene();

    function drawScene() {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // setRectangle(gl, translation[0], translation[1], width, height);
        setGeometry(gl);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform4fv(colorLocation, color);

        let rotate = 20 ;
        let cos = Math.cos(rotate * Math.PI / 180);
        let sin = Math.sin(rotate * Math.PI / 180);

        gl.uniformMatrix4fv(transformLocation, false, new Float32Array([
            cos, -sin, 0.0, 0.0,
            sin, cos, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]));

        gl.drawArrays(gl.TRIANGLES, 0, 18);
    }

    /**
     *
     * @param {WebGLRenderingContext} gl
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     */
    function setRectangle(gl, x, y, width, height) {
        let x1 = x;
        let y1 = y;
        let x2 = x + width;
        let y2 = y + height;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ]), gl.STATIC_DRAW);
    }

    function setGeometry(gl) {

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0, 0,
            30, 0,
            0, 150,
            0, 150,
            30, 0,
            30, 150,

            // 上横
            30, 0,
            100, 0,
            30, 30,
            30, 30,
            100, 0,
            100, 30,

            // 中横
            30, 60,
            67, 60,
            30, 90,
            30, 90,
            67, 60,
            67, 90,
        ]), gl.STATIC_DRAW);
    }
}

main();