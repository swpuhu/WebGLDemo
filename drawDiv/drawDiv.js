import util from '../glUtil.js';

const VERTEX_SHADER = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main () {
        gl_Position = a_position * vec4(1, -1, 1, 1);
        v_texCoord = a_texCoord;
    }
`;

const FRAG_SHADER =  `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    void main () {
        gl_FragColor = texture2D(u_texture, v_texCoord);
    }
`;

let canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 360;
document.body.appendChild(canvas);
let gl = canvas.getContext('webgl', {
    preserveDrawingBuffer: true
});

let program = util.createProgramBySource(gl, VERTEX_SHADER, FRAG_SHADER);

let points = new Float32Array([
    -1, -1, 0, 0,
    -1, 1, 0, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, -1, 1, 0,
    -1, -1, 0, 0,
]);

let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

let texture = util.createTexture(gl);

let a_position = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(a_position);

let a_texCoord = gl.getAttribLocation(program, 'a_texCoord');
gl.enableVertexAttribArray(a_texCoord);

let fsize = points.BYTES_PER_ELEMENT;

gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, fsize * 4, 0);
gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, fsize * 4, fsize * 2);



let svg = util.generateImageByDiv(640, 360, `
    <h1 style="color: red; font-family: ShouJinTi">
        字体测试
    </h1>
    <h2>
        sub title
    </h2>
`);
document.body.appendChild(svg);

let image = new Image();

document.body.appendChild(image);

image.onload = function () {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

let canvas2d = document.createElement('canvas');
let ctx = canvas2d.getContext('2d');

setTimeout(() => {
    // console.log(checkFont('ShouJinTi'));

    ctx.font = '48px ShouJinTi';
    ctx.fillText('字体测试',0,100);
    ctx.strokeText('字体测试',0,100);
    // image.src = canvas2d.toDataURL();
}, 100);
document.body.appendChild(canvas2d);


function checkFont(name){
    let values=document.fonts.values();
    let isHave=false;
    let item=values.next();
    while(!item.done&&!isHave)
    {
        let fontFace=item.value;
        if(fontFace.family==name)
        {
            isHave=true;
        }
        item=values.next();
    }
    return isHave;
}
image.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svg.outerHTML)));

