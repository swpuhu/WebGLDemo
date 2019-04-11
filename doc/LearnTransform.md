# WebGL学习笔记（三）——深入理解平移、旋转、缩放

之前学习了如何使用缓冲区向GL程序中传入多个顶点，也学习了如何使用纹理。本次学习一下如何对图形进行平移，旋转和缩放。

在正式编码之前，我们先复习一些数学知识。接下来，我们将从一个点出发，看这个点是如何进行平移，旋转和缩放的。

## 平移

设点P(x, y) 沿x轴方向移动了tx的距离，沿y轴方向移动了ty的距离。那么移动后的点P'的坐标应该是：

<h4 style="text-align: center">P' (x + tx, y + ty)</h4>

<div style="text-align: center"><img width="400" height="auto" src="https://raw.githubusercontent.com/swpuhu/pictures/master/translate.png"></div>

那如何使用向量来表示平移呢？

**我们在GL程序中使用一个四维向量来表示坐标**

<div style="text-align: center"><img width="50" height="auto" src="https://raw.githubusercontent.com/swpuhu/pictures/master/vector.png"></div>

**使用一个4X4的矩阵来表示变换矩阵**

<div style="text-align: center"><img width="200" height="auto" src="https://raw.githubusercontent.com/swpuhu/pictures/master/matrix.png"></div>

**然后让它们相乘，从而达到改变坐标的目的。**

<div style="text-align: center"><img width="500" height="auto" src="https://raw.githubusercontent.com/swpuhu/pictures/master/multiple2.png"></div>

在平移中，P'的坐标(x', y'), x' = x + tx; y' = y + ty;

那么：

ax + by + cz + d = x + tx

所以， 

a = 1, b = 0, c = 0, d = tx;

依此类推： 

e = 0, f = 1, g = 0, h = ty;

那么平移的变换矩阵为：
<div style="text-align: center"><img width="200" height="auto" src="https://raw.githubusercontent.com/swpuhu/pictures/master/translateMatrix2.png"></div>


## 旋转

设点O(a, b) 为旋转中心， 点P(x, y) 绕点O逆时针旋转β度，得到点P'(x', y'), 那么旋转后的点P' 与旋转前的点P的关系如下：


<div style="text-align: center"><img width="500" height="auto" src="https://raw.githubusercontent.com/swpuhu/pictures/master/rotate.png"></div>


<div style="text-align: center"><img width="400" height="auto" src="https://raw.githubusercontent.com/swpuhu/pictures/master/rotate-tuidao.png"></div>


<h4>①, ③ / ②, ④ 联立求解可得： </h4>


<div style="text-align: center"><img width="400" height="auto" src="https://raw.githubusercontent.com/swpuhu/pictures/master/rotate-result.png"></div>

**可得绕某一点旋转一定角度的变换矩阵为：**


<div style="text-align: center"><img width="500" height="auto" src="https://raw.githubusercontent.com/swpuhu/pictures/master/rotateMatrix.png"></div>


## 缩放

缩放就相对简单一些，只需要对x 和 y的坐标乘以相应的系数就可以了。

#### 例如：

已知一点P(x, y) 放大2倍后的坐标P'(x' , y');

x' = 2 * x;

y' = 2 * y;

**变换矩阵为：**

<div style="text-align: center"><img width="200" height="auto" src="https://raw.githubusercontent.com/swpuhu/pictures/master/scaleMatrix.png"></div>

## WebGL实现

我们已经讲了基本的原理，那现在就看看如何在webgl中实现上述的效果。

### GLSL:

#### 顶点着色器程序：

```js
const VERTEX_SHADER = `
    attribute vec4 a_position;
    uniform vec2 u_resolution;
    attribute vec2 a_texCoord;
    uniform mat4 v_matrix; // 旋转变换矩阵
    uniform mat4 v_translateMatrix; // 平移变换矩阵
    uniform mat4 v_scaleMatrix; // 缩放变换矩阵
    varying vec2 v_texCoord;
    void main () {
        gl_Position = ((v_translateMatrix * v_matrix * v_scaleMatrix * a_position) / vec4(u_resolution, 1.0, 1.0) * 2.0 - 1.0) * vec4(1, -1, 1, 1);
        v_texCoord = a_texCoord;
    }
`;
```

在这里需要解释的在**本程序中**是在传入顶点着色器的坐标范围并不是-1~1，而是采用了类似于2D Canvas的绝对坐标，所以在这里引入了u_resolution这样的一个变量，来将绝对坐标映射为-1~1的范围。

#### 片段着色器程序
```js
const FRAG_SHADER = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    void main () {
        gl_FragColor = texture2D(u_texture, v_texCoord);
    }
`;

```

```js

function main(vertexShaderSource, fragShaderSource, i, src) {

    let canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    document.body.appendChild(canvas);
    let gl = canvas.getContext('webgl', {
        preserveDrawingBuffer: true
    });

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    util.createProgramBySource(gl, vertexShaderSource, fragShaderSource);


    let bufferPosition = new Float32Array([
        0.0, canvas.height, 0.0, 1.0, 0.0, 1.0,
        canvas.width, canvas.height, 0.0, 1.0, 1.0, 1.0,
        0.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        canvas.width, 0.0, 0.0, 1.0, 1.0, 0.0,
    ]);

    let rotate = 0;
    let center = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };

    let matrix = util.createRotateMatrix(center, rotate);
    let translateMatrix = util.createTranslateMatrix(0, 0);
    let scaleMatrix = util.createScaleMatrix(1, 1);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferPosition, gl.STATIC_DRAW);

    let texture = gl.createTexture();
    gl.activeTexture(gl['TEXTURE' + i]);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let a_position = gl.getAttribLocation(gl.program, 'a_position');
    let FSIZE = bufferPosition.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_position);

    let a_texCoord = gl.getAttribLocation(gl.program, 'a_texCoord');
    gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, FSIZE * 6, FSIZE * 4);
    gl.enableVertexAttribArray(a_texCoord);

    let u_resolution = gl.getUniformLocation(gl.program, 'u_resolution');
    gl.uniform2f(u_resolution, canvas.width, canvas.height);

    let v_matrix = gl.getUniformLocation(gl.program, 'v_matrix');
    gl.uniformMatrix4fv(v_matrix, false, matrix);

    let v_translateMatrix = gl.getUniformLocation(gl.program, 'v_translateMatrix');
    gl.uniformMatrix4fv(v_translateMatrix, false, translateMatrix);

    let v_scaleMatrix = gl.getUniformLocation(gl.program, 'v_scaleMatrix');
    gl.uniformMatrix4fv(v_scaleMatrix, false, scaleMatrix);

    let u_texture = gl.getUniformLocation(gl.program, 'u_texture');
    gl.uniform1i(u_texture, i);

    let image = new Image();
    image.src = src || '../assets/icon.jpg';
    if (image.complete) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    image.onload = function () {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}
```

## 思考

在上述程序中：

我们采用了多个变换矩阵相乘的方法，来让这几种变换叠加起来。**v_translateMatrix * v_matrix * v_scaleMatrix**

但是值得注意的一点是： 这种叠加是用顺序，在本程序中，我们是先将图片先平移，再旋转，再缩放。

那如果我们先将图片先旋转，再平移，再缩放呢？

又或者先缩放，再平移，再缩放呢？

这个问题留给读者自己实践。或者查看下面的Demo

## Demo

[点此查看旋转缩放平移Demo](https://swpuhu.github.io/WebGLDemo/transform/index.html)