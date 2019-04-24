import getWebGLContext from './index.js';

function test() {
    let wrapper = document.createElement('div');
    wrapper.style.cssText = 'background: url(\'../assets/hc.jpg\')'
    let canvas = document.createElement('canvas');
    wrapper.appendChild(canvas);
    canvas.width = 640;
    canvas.height = 360;
    document.body.appendChild(wrapper);

    let gl = getWebGLContext(canvas);
    window.gl = gl;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    let image = new Image();
    image.src = '../assets/hc.jpg';

    let canvas2d = document.createElement('canvas');
    canvas2d.width = 640;
    canvas2d.height = 360;
    let ctx = canvas2d.getContext('2d');


    let video = document.createElement('video');
    window.video = video;
    video.crossOrigin = 'anonymous';
    video.controls = true;
    video.src = 'https://swpuhu.github.io/pictures/test2.mp4';
    // video.src = 'http://lmbsy.qq.com/flv/118/186/w0201qrxqy1.p201.1.mp4?sdtfrom=&platform=10201&fmt=shd&vkey=3AF565DB9EB483B31E3717BBDFA9FA29B950335B0A8CD55FDF84FA01F2F23AC7BC1F0AD3447315288FA3584565CF7667837742275714CB4BF14F270CDD2866A7721DAE0211D88CFEE07DB6CDA864CF319E0EA1CEECE1E7998175ED8264C98E07C3D05729C601056067E66AB1C693B9DC09186604CC6E5B96&level=0';
    let video2 = document.createElement('video');
    window.video2 = video2;
    video2.crossOrigin = 'anonymous';
    video.controls = true;
    video2.src = 'http://vhoth.dnion.videocdn.qq.com/flv/107/117/a0201rs3lid.p201.1.mp4?fmt=shd&level=0&sdtfrom=&platform=10201&vkey=75088F3E0FF79CA2BB83B825245980A72A409A578571BEBA210CCF1AE333D52CD7115401C235AE4C3981EC4B78A91152EBF31789867B4AA36C689CA743555E4FC82B2C5EE462EF9EC2A96E6B3E7A12C692D6B8DDECD756585E9864EF6072C8C5AE4142B0CE94B85EB6786CD63096C9D927539B2CB4ACBB6A';
    // video2.src = 'http://gitee.com/swpuhu/media/raw/master/test1.mp4';
    video2.loop = true;

    video2.oncanplaythrough = function() {
        gl.drawImage(video2, 0, 0, video2.videoWidth, video2.videoHeight, 200, 50, 500, 600);
    }

    video.oncanplaythrough = function() {
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
        gl.setHue(video.hue);
        gl.setContrast(video.contrast);
        gl.setSaturate(video.saturate);
        if (video.clipPath) {
            if (video.clipPath.mode === 0) {
                if (video.clipPath.type === 'circle') {
                    gl.cancelRound();
                    gl.drawArc(video, canvas.width / 2, canvas.height / 2, video.clipPath.radius, video.clipPath.startArc, video.clipPath.endArc, video.clipPath.isInverse);
                    gl.setMask(video.mask);
                }
            } else if (video.clipPath.mode === 1) {
                gl.setRound(canvas.width / 2, canvas.height / 2, video.clipPath.radius, video.clipPath.startArc, video.clipPath.endArc, video.clipPath.isInverse);
                gl.drawImage(video, 0, 0, canvas.width, canvas.height);
                gl.setMask(video.mask);
            }
        } else {
            gl.cancelRound();
            gl.drawImage(video, 0, 0, canvas.width, canvas.height);
            gl.setMask(video.mask);
        }

        gl.cancelRound();
        gl.setTranslate(video2.translateX, video2.translateY);
        gl.setRotate(video2.rotate);
        gl.setScale(video2.scaleX, video2.scaleY);
        gl.setAlpha(video2.alpha);
        gl.setHue(video2.hue);
        gl.setContrast(video2.contrast);
        gl.setSaturate(video2.saturate);
        if (video2.clipPath) {
            if (video2.clipPath.mode === 0) {
                if (video2.clipPath.type === 'circle') {
                    gl.cancelRound();
                    gl.drawArc(video2, canvas.width / 2, canvas.height / 2, video2.clipPath.radius, video2.clipPath.startArc, video2.clipPath.endArc, video2.clipPath.isInverse);
                    gl.setMask(video2.mask);
                }
            } else if (video2.clipPath.mode === 1) {
                gl.setRound(canvas.width / 2, canvas.height / 2, video2.clipPath.radius, video2.clipPath.startArc, video2.clipPath.endArc, video2.clipPath.isInverse);
                gl.drawImage(video2, 0, 0, canvas.width, canvas.height);
                gl.setMask(video2.mask);
            }

        } else {
            gl.cancelRound();
            gl.drawImage(video2, 0, 0, canvas.width, canvas.height);
            gl.setMask(video2.mask);
        }
        // gl.drawImage(video2, 300, 300, 1000, 500, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas2d.width, canvas2d.height);
        ctx.drawImage(video2, 0, 0, video2.videoWidth, video2.videoHeight, 200, 100, canvas2d.width, canvas2d.height);
        id = requestAnimationFrame(draw);
    }


    button.onmousedown = function() {
        if (video.paused) {
            video.play();
            video2.play();
            draw();
        } else {
            video.pause();
            cancelAnimationFrame(id);
        }
    }

    function testSetMask() {
        let setMask = document.createElement('button');
        setMask.innerText = 'setMask';
        document.body.appendChild(setMask);

        setMask.onclick = function() {
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
                0.2, 0.5, 0.2, 0.7, 1,
                0.1, 0.5, 0.3, 0.8, 2,
                0.5, 0.9, 0.3, 0.5, 2,
                0.1, 0.5, 0.0, 0.2, 1,
                0.6, 0.9, 0.3, 0.8, 2,
            ];
        }

        let cancel = document.createElement('button');
        cancel.innerText = 'cancelMask';
        document.body.appendChild(cancel);

        cancel.onclick = function() {
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

        function createEditor (name, type, min, max, value, step = 1) {
            let obj = {};
            let oninput = null;
            let wrapper = document.createElement('div');
            let label = document.createElement('label');
            label.innerText = name;
            let input = document.createElement('input');
            input.type = type;
            input.max = max;
            input.min = min;
            input.value = value;
            input.step = step;
            input.oninput = function (e) {
                oninput && oninput.call(this, e);
            }
            wrapper.appendChild(label);
            wrapper.appendChild(input);
            Object.defineProperties(obj, {
                oninput: {
                    set (value) {
                        oninput = value;
                    },
                    get () {
                        return oninput;
                    }
                },
                ref: {
                    get () {
                        return wrapper;
                    }
                },
                step: {
                    set (value) {
                        input.step = value;
                    }
                },
                value: {
                    get () {
                        return input.value;
                    }
                }
            })
            return obj;
        }
        function createUI(obj) {
            let lastName;
            return (function() {

                let groups = document.createElement('div');

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
                circleCheckBox3.type = 'checkbox';

                let radiusWrapper = createEditor('radius', 'range', 0, canvas.width / 2, canvas.height / 2);

                let startArcWrapper = createEditor('startArc', 'range', 0, 360, 0);

                let endArcWrapper = createEditor('endArc', 'range', 0, 360, 360);

                function setCircle(e) {
                    if (circleCheckBox.checked) {
                        obj.clipPath = {
                            mode: 0,
                            type: 'circle',
                            radius: +radiusWrapper.value,
                            startArc: +startArcWrapper.value,
                            endArc: +endArcWrapper.value,
                        }
                    } else if (circleCheckBox2.checked) {
                        obj.clipPath = {
                            mode: 1,
                            type: 'circle',
                            radius: +radiusWrapper.value,
                            startArc: +startArcWrapper.value,
                            endArc: +endArcWrapper.value
                        }
                    } else {
                        obj.clipPath = null;
                    }
                    if (obj.clipPath) {
                        if (circleCheckBox3.checked) {
                            obj.clipPath.isInverse = true;
                        } else {
                            obj.clipPath.isInverse = false;
                        }
                    }
                }
                circleCheckBox.onclick = setCircle;
                circleCheckBox2.onclick = setCircle;
                circleCheckBox3.onclick = setCircle;
                radiusWrapper.oninput = setCircle;
                startArcWrapper.oninput = setCircle;
                endArcWrapper.oninput = setCircle;

                circle.appendChild(circleLabel);
                circle.appendChild(circleCheckBox);
                circle.appendChild(circleCheckBox2);
                circle.appendChild(circleCheckBox3);
                circle.appendChild(radiusWrapper.ref);
                circle.appendChild(startArcWrapper.ref);
                circle.appendChild(endArcWrapper.ref);

                clipPath.appendChild(circle);


                let translateXWrapper = createEditor('translateX', 'range', -canvas.width, canvas.width, 0);
                let translateYWrapper = createEditor('translateY', 'range', -canvas.height, canvas.height, 0);
                let rotateWrapper = createEditor('rotate', 'range', -180, 180, 0);
                let scaleXWrapper = createEditor('scaleX', 'range', 0.1, 5, 1, 0.1);
                let scaleYWrapper = createEditor('scaleY', 'range', 0.1, 5, 1, 0.1);
                let alphaWrapper = createEditor('alpha', 'range', 0, 1, 1, 0.02);
                let hueWrapper = createEditor('hue', 'range', -180, 180, 0);
                let contrastWrapper = createEditor('contrast', 'range', 0, 5, 1, 0.1);
                let saturateWrapper = createEditor('saturate', 'range', 0, 2, 1, 0.02);

                translateXWrapper.oninput = function() {
                    obj.translateX = +this.value;
                }

                translateYWrapper.oninput = function() {
                    obj.translateY = +this.value;
                }

                rotateWrapper.oninput = function() {
                    obj.rotate = +this.value;
                }

                scaleXWrapper.oninput = function() {
                    obj.scaleX = +this.value;
                }

                scaleYWrapper.oninput = function() {
                    obj.scaleY = +this.value;
                }

                alphaWrapper.oninput = function() {
                    obj.alpha = +this.value;
                }

                hueWrapper.oninput = function() {
                    obj.hue = +this.value;
                }

                contrastWrapper.oninput = function() {
                    obj.contrast = +this.value;
                }

                saturateWrapper.oninput = function() {
                    obj.saturate = +this.value;
                }



                groups.appendChild(translateXWrapper.ref);
                groups.appendChild(translateYWrapper.ref);
                groups.appendChild(rotateWrapper.ref);
                groups.appendChild(scaleXWrapper.ref);
                groups.appendChild(scaleYWrapper.ref);
                groups.appendChild(alphaWrapper.ref);
                groups.appendChild(hueWrapper.ref);
                groups.appendChild(contrastWrapper.ref);
                groups.appendChild(saturateWrapper.ref);
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

    testSetMask();

}

test();