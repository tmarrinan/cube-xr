import { CubeXR } from './cubexr.js'

let cube_app;

function init() {
    if (navigator.xr) {
        navigator.xr.isSessionSupported("immersive-vr").then((is_supported) => {
            console.log('WebXR Support:', is_supported);
            if (is_supported) {
                let xr_btn = document.getElementById('xr-btn');
                xr_btn.addEventListener('click', enterXR);
                xr_btn.style.display = 'inline';

                document.addEventListener('keydown', onKeyDown);
            }
            else {
                alert('Warning: WebXR not supported');
            }
        });
    }
    else {
        alert('Warning: WebXR not supported');
    }

    initGLCube(900, 600);
}

function initGLCube(width, height) {
    let canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;

    cube_app = new CubeXR(canvas);
}

function enterXR(event) {
    cube_app.enterXR();
}

function onKeyDown(event) {
    if (cube_app.isXR() && event.keyCode === 27) {
        cube_app.exitXR();
    }
}


init();
