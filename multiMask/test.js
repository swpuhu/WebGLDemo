import main from './multiMask.js';


let canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 360;

document.body.appendChild(canvas);
let gl = main(canvas);