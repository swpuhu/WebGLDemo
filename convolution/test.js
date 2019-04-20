import main from './convolution.js';


let canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 360;

document.body.appendChild(canvas);
let gl = main(canvas);

function createOption (name) {
    let item = document.createElement('option');
    item.innerText = name;
    return item;
}

function setUI() {
    let select = document.createElement('select');
    select.add(createOption('origin'));
    select.add(createOption('edgeKernal'));
    select.add(createOption('blurKernal'));
    select.add(createOption('verticalEdgeKernal'));
    select.add(createOption('horizontalEdgeKernal'));
    select.add(createOption('sharpenKernal'));
    document.body.appendChild(select);
    select.onchange = function (e) {
        gl.fresh(this.value);
    }
}

setUI();