import getWebGLContext from './index.js';

function test() {
    let wrapper = document.createElement('div');
    wrapper.style.cssText = 'background: url(\'../assets/hc.jpg\')'
    let canvas = document.createElement('canvas');
    wrapper.appendChild(canvas);
    canvas.width = 640 * 2;
    canvas.height = 360 * 2;
    document.body.appendChild(wrapper);

    let gl = getWebGLContext(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    let image = new Image();
    image.src = '../assets/hc.jpg';

    let canvas2d = document.createElement('canvas');
    canvas2d.width = 640;
    canvas2d.height = 360;
    // document.body.appendChild(canvas2d);
    let ctx = canvas2d.getContext('2d');

    // image.onload = function () {
    //     gl.drawImage2(image, 500, 500, 1100, 300, 0, 0, 600, 300);
    //     ctx.drawImage(image, 500, 500, 1100, 300, 0, 0, 600, 300);
    // }


    let video = document.createElement('video');
    window.video = video;
    video.crossOrigin = 'anonymous';
    video.controls = true;
    // if (Hls.isSupported()) {
    //     let hls = new Hls();
    //     hls.loadSource('../assets/result.m3u8');
    //     hls.attachMedia(video);
    //     hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {

    //     });
    //     hls.on(Hls.Events.LEVEL_LOADED, function (event, data) {
    //         console.log(data.details.totalduration);
    //     })
    // }
    // let video = window.video = document.createElement('video');
    video.src = 'http://lmbsy.qq.com/flv/118/186/w0201qrxqy1.p201.1.mp4?sdtfrom=&platform=10201&fmt=shd&vkey=3AF565DB9EB483B31E3717BBDFA9FA29B950335B0A8CD55FDF84FA01F2F23AC7BC1F0AD3447315288FA3584565CF7667837742275714CB4BF14F270CDD2866A7721DAE0211D88CFEE07DB6CDA864CF319E0EA1CEECE1E7998175ED8264C98E07C3D05729C601056067E66AB1C693B9DC09186604CC6E5B96&level=0';
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
        gl.setMask(video.mask);
        gl.setHue(video.hue);
        gl.setContrast(video.contrast);
        if (video.clipPath) {
            if (video.clipPath.mode === 0) {
                if (video.clipPath.type === 'circle') {
                    gl.cancelRound();
                    gl.drawArc(video, canvas.width / 2, canvas.height / 2, video.clipPath.radius, video.clipPath.startArc, video.clipPath.endArc, video.clipPath.isInverse);
                }
            } else if (video.clipPath.mode === 1) {
                gl.setRound(canvas.width / 2, canvas.height / 2, video.clipPath.radius, video.clipPath.startArc, video.clipPath.endArc, video.clipPath.isInverse);
                gl.drawImage(video, 0, 0, canvas.width, canvas.height);
            }
        } else {
            gl.cancelRound();
            gl.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        gl.cancelRound();
        gl.setTranslate(video2.translateX, video2.translateY);
        gl.setRotate(video2.rotate);
        gl.setScale(video2.scaleX, video2.scaleY);
        gl.setMask(video2.mask);
        gl.setAlpha(video2.alpha);
        gl.setHue(video2.hue);
        gl.setContrast(video2.contrast);
        if (video2.clipPath) {
            if (video2.clipPath.mode === 0) {
                if (video2.clipPath.type === 'circle') {
                    gl.cancelRound();
                    gl.drawArc(video2, canvas.width / 2, canvas.height / 2, video2.clipPath.radius, video2.clipPath.startArc, video2.clipPath.endArc, video2.clipPath.isInverse);
                }
            } else if (video2.clipPath.mode === 1) {
                gl.setRound(canvas.width / 2, canvas.height / 2, video2.clipPath.radius, video2.clipPath.startArc, video2.clipPath.endArc, video2.clipPath.isInverse);
                gl.drawImage(video2, 0, 0, canvas.width, canvas.height);
            }

        } else {
            gl.cancelRound();
            gl.drawImage(video2, 0, 0, canvas.width, canvas.height);
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
                0.2, 0.5, 0.2, 0.7, 2,
                0.1, 0.5, 0.3, 0.8, 1,
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

        function createUI(obj) {
            let lastName;
            return (function() {

                let groups = document.createElement('div');
                let translateX = document.createElement('input');
                translateX.type = 'range';
                translateX.min = -canvas.width;
                translateX.max = canvas.width;
                translateX.value = 0;

                let translateY = document.createElement('input');
                translateY.type = 'range';
                translateY.min = -canvas.height;
                translateY.max = canvas.height;
                translateY.value = 0;

                let rotate = document.createElement('input');
                rotate.type = 'range';
                rotate.min = -180;
                rotate.max = 180;
                rotate.value = 0;


                let scaleX = document.createElement('input');
                scaleX.step = 0.1;
                scaleX.type = 'range';
                scaleX.min = 0.1;
                scaleX.max = 5;
                scaleX.value = 1;

                let scaleY = document.createElement('input');
                scaleY.step = 0.1;
                scaleY.type = 'range';
                scaleY.min = 0.1;
                scaleY.max = 5;
                scaleY.value = 1;

                let alpha = document.createElement('input');
                alpha.step = 0.02;
                alpha.type = 'range';
                alpha.min = 0;
                alpha.max = 1;
                alpha.value = 1;

                let hue = document.createElement('input');
                hue.type = 'range';
                hue.min = -180;
                hue.max = 180;
                hue.value = 0;


                let contrast = document.createElement('input');
                contrast.type = 'range';
                contrast.step = 0.02;
                contrast.min = 0;
                contrast.max = 5;
                contrast.value = 1;

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

                let radiusWrapper = document.createElement('div');
                let radiusLabel = document.createElement('label');
                radiusLabel.innerText = 'radius';
                let radius = document.createElement('input');
                radius.type = 'range';
                radius.min = 0;
                radius.max = canvas.width;
                radius.value = canvas.height;
                radiusWrapper.appendChild(radiusLabel);
                radiusWrapper.appendChild(radius);

                let startArcWrapper = document.createElement('div');
                let startArcLabel = document.createElement('label');
                startArcLabel.innerText = 'startArc';
                let startArc = document.createElement('input');
                startArc.type = 'range';
                startArc.min = 0;
                startArc.max = 360;
                startArc.value = 0;
                startArcWrapper.appendChild(startArcLabel);
                startArcWrapper.appendChild(startArc);

                let endArcWrapper = document.createElement('div');
                let endArcLabel = document.createElement('label');
                endArcLabel.innerText = 'endArc';
                let endArc = document.createElement('input');
                endArc.type = 'range';
                endArc.min = 0;
                endArc.max = 360;
                endArc.value = 360;
                endArcWrapper.appendChild(endArcLabel);
                endArcWrapper.appendChild(endArc);

                function setCircle(e) {
                    if (circleCheckBox.checked) {
                        obj.clipPath = {
                            mode: 0,
                            type: 'circle',
                            radius: +radius.value,
                            startArc: +startArc.value,
                            endArc: +endArc.value,
                        }
                    } else if (circleCheckBox2.checked) {
                        obj.clipPath = {
                            mode: 1,
                            type: 'circle',
                            radius: +radius.value,
                            startArc: +startArc.value,
                            endArc: +endArc.value
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
                radius.oninput = setCircle;
                startArc.oninput = setCircle;
                endArc.oninput = setCircle;

                circle.appendChild(circleLabel);
                circle.appendChild(circleCheckBox);
                circle.appendChild(circleCheckBox2);
                circle.appendChild(circleCheckBox3);
                circle.appendChild(radiusWrapper);
                circle.appendChild(startArcWrapper);
                circle.appendChild(endArcWrapper);

                clipPath.appendChild(circle);

                translateX.oninput = function() {
                    obj.translateX = +this.value;
                }

                translateY.oninput = function() {
                    obj.translateY = +this.value;
                }

                rotate.oninput = function() {
                    obj.rotate = +this.value;
                }

                scaleX.oninput = function() {
                    obj.scaleX = +this.value;
                }

                scaleY.oninput = function() {
                    obj.scaleY = +this.value;
                }

                alpha.oninput = function() {
                    obj.alpha = +this.value;
                }

                hue.oninput = function() {
                    obj.hue = +this.value;
                }

                contrast.oninput = function() {
                    obj.contrast = +this.value;
                }

                let labelTranslateX = document.createElement('label');
                labelTranslateX.innerText = 'translateX';
                let labelTranslateY = document.createElement('label');
                labelTranslateY.innerText = 'translateY';
                let labelRotate = document.createElement('label');
                labelRotate.innerText = 'rotate';
                let labelScaleX = document.createElement('label');
                labelScaleX.innerText = 'scaleX';
                let labelScaleY = document.createElement('label');
                labelScaleY.innerText = 'scaleY';
                let labelAlpha = document.createElement('label');
                labelAlpha.innerText = 'alpha';
                let labelHue = document.createElement('label');
                labelHue.innerText = 'hue';
                let labelContrast = document.createElement('label');
                labelContrast.innerText = 'contrast';

                let translateXWrapper = document.createElement('div');
                let translateYWrapper = document.createElement('div');
                let rotateWrapper = document.createElement('div');
                let scaleXWrapper = document.createElement('div');
                let scaleYWrapper = document.createElement('div');
                let alphaWrapper = document.createElement('div');
                let hueWrapper = document.createElement('div');
                let contrastWrapper = document.createElement('div');

                translateXWrapper.appendChild(labelTranslateX);
                translateXWrapper.appendChild(translateX);
                translateYWrapper.appendChild(labelTranslateY);
                translateYWrapper.appendChild(translateY);
                rotateWrapper.appendChild(labelRotate);
                rotateWrapper.appendChild(rotate);
                scaleXWrapper.appendChild(labelScaleX);
                scaleXWrapper.appendChild(scaleX);
                scaleYWrapper.appendChild(labelScaleY);
                scaleYWrapper.appendChild(scaleY);
                alphaWrapper.appendChild(labelAlpha);
                alphaWrapper.appendChild(alpha);
                hueWrapper.appendChild(labelHue);
                hueWrapper.appendChild(hue);
                contrastWrapper.appendChild(labelContrast);
                contrastWrapper.appendChild(contrast);


                groups.appendChild(translateXWrapper);
                groups.appendChild(translateYWrapper);
                groups.appendChild(rotateWrapper);
                groups.appendChild(scaleXWrapper);
                groups.appendChild(scaleYWrapper);
                groups.appendChild(alphaWrapper);
                groups.appendChild(hueWrapper);
                groups.appendChild(contrastWrapper);
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