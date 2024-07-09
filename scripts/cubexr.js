import { vec3, mat4 } from './glMatrix.js';
import glsl from './glsl.js';
import shaders from './shaders.js';
import models from './models.js';

const BASE_URL = new URL('./', document.baseURI).href;

class CubeXR {
    constructor(canvas) {
        // Create WebGL2 rendering context
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2', {xrCompatible: true});
        if (!this.gl) {
            alert('Error: WebGL2 not supported');
        }

        // Declare vertex attributes
        this.vertex_position_attrib = 0;
        this.vertex_texcoord_attrib = 1;

        // Compile shader program
        this.program = glsl.createShaderProgram(this.gl, shaders['texture.vert'], shaders['texture.frag']);
        // Bind vertex input data locations
        this.gl.bindAttribLocation(this.program, this.vertex_position_attrib, 'vertex_position');
        this.gl.bindAttribLocation(this.program, this.vertex_texcoord_attrib, 'vertex_texcoord');
        // Link shader program
        glsl.linkShaderProgram(this.gl, this.program);
        // Get list of uniforms available in shaders
        this.uniforms = glsl.getShaderProgramUniforms(this.gl, this.program);

        // Declare member variables
        this.start_time = performance.now();
        this.xr_mode = false;
        this.xr_ref_space = null;
        this.projection_matrix = null;
        this.view_matrix = null;
        this.model_matrix_cube = null;
        this.model_matrix_plane = null;
        this.textures = {};
        this.cube_model = null;
        this.plane_model = null;

        // Initialize application
        this.initialize();
    }

    initialize() {
        // Set the background color to a dark gray
        this.gl.clearColor(0.2, 0.2, 0.2, 1.0);
        // Enable z-buffer for visible surface determination
        this.gl.enable(this.gl.DEPTH_TEST);

        // Create projection, view, and model matrices
        let fov = 60.0 * (Math.PI / 180.0);
        let aspect = this.canvas.width / this.canvas.height;
        this.projection_matrix = mat4.create();
        mat4.perspective(this.projection_matrix, fov, aspect, 0.1, 100.0);
        this.view_matrix = mat4.create();
        mat4.identity(this.view_matrix);
        this.model_matrix_cube = mat4.create();
        this.model_matrix_plane = mat4.create();

        // Initialize textures
        this.textures['crate'] = this.createTexture(BASE_URL + 'images/crate.jpg');
        this.textures['grid'] = this.createTexture(BASE_URL + 'images/grid.png');

        // Create a model of a cube and plane
        this.plane_model = models.createPlane(this.gl, this.vertex_position_attrib, this.vertex_texcoord_attrib);
        this.cube_model = models.createCube(this.gl, this.vertex_position_attrib, this.vertex_texcoord_attrib);

        let ground_position = vec3.fromValues(0.0, -1.0, -5.0);
        let ground_scale = vec3.fromValues(3.0, 1.0, 3.0);
        mat4.identity(this.model_matrix_plane);
        mat4.translate(this.model_matrix_plane, this.model_matrix_plane, ground_position);
        mat4.scale(this.model_matrix_plane, this.model_matrix_plane, ground_scale);

        // Set which GPU program (shaders) to use for rendering
        this.gl.useProgram(this.program);

        // Animate scene (start draw loop)
        window.requestAnimationFrame((timestamp) => { this.animate(timestamp); });
    }

    createTexture(image_url) {
        // Create texture
        let texture = this.gl.createTexture();
        // Set newly created texture as the active one we are modifying
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        // Set texture parameters and upload a temporary 1px white RGBA array [255,255,255,255]
        let white = new Uint8Array([255,255,255,255]);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, white);

        // Download the actual image and update texture
        let image = new Image();
        image.crossOrigin = 'anonymous';
        image.addEventListener('load', (event) => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }, false);
        image.src = image_url;

        // No longer modifying our texture, so deselect
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        // Return created texture
        return texture;
    }

    animate(timestamp) {
        // Queue next frame
        if (!this.xr_mode) {
            window.requestAnimationFrame((timestamp) => { this.animate(timestamp); });
        }

        // Time (seconds) since start of app
        let t = (timestamp - this.start_time) / 1000.0;

        // Update model matrices
        this.updateModelTransforms(t);

        // Render to XR framebuffer
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        // Delete previous frame (reset both framebuffer and z-buffer)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Set drawing area to be the entire framebuffer
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        // Render scene
        this.drawFrame(this.projection_matrix, this.view_matrix);
    }

    xrAnimate(timestamp, frame) {
        // Queue next XR frame
        frame.session.requestAnimationFrame((timestamp, frame) => { this.xrAnimate(timestamp, frame); });

        // Time (seconds) since start of app
        let t = (timestamp - this.start_time) / 1000.0;

        // Update model matrices
        this.updateModelTransforms(t);

        // Get the user pose
        let pose = frame.getViewerPose(this.xr_ref_space);
        if (pose) {
            // Get the WebGL layer
            let gl_layer = frame.session.renderState.baseLayer;

            // Render to XR framebuffer
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, gl_layer.framebuffer);

            // Delete previous frame (reset both framebuffer and z-buffer)
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            // Render scene for each pose
            for (let view of pose.views) {
                let viewport = gl_layer.getViewport(view);
                this.gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

                let mat_proj = view.projectionMatrix;
                let mat_view = view.transform.inverse.matrix;
                this.drawFrame(mat_proj, mat_view);
            }
        }
    }

    updateModelTransforms(time) {
        let position = vec3.fromValues(0.0, 0.5, -5.0);
        let rotate_x = 10.0 * (Math.PI / 180.0) * time;
        let rotate_y = 15.0 * (Math.PI / 180.0) * time;
        mat4.identity(this.model_matrix_cube);
        mat4.translate(this.model_matrix_cube, this.model_matrix_cube, position);
        mat4.rotateX(this.model_matrix_cube, this.model_matrix_cube, rotate_x);
        mat4.rotateY(this.model_matrix_cube, this.model_matrix_cube, rotate_y);
    }

    drawFrame(projection_matrix, view_matrix) {
        // Upload our projection and view matrices to the GPU
        this.gl.uniformMatrix4fv(this.uniforms.projection_matrix, false, projection_matrix);
        this.gl.uniformMatrix4fv(this.uniforms.view_matrix, false, view_matrix);
        

        // GROUND
        // Upload model matrix
        this.gl.uniformMatrix4fv(this.uniforms.model_matrix, false, this.model_matrix_plane);

        // Select texture to use
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['grid']);

        // Select our plane Vertex Array Object for drawing
        this.gl.bindVertexArray(this.plane_model);
        // Draw the selected Vertex Array Object (using triangles)
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);

        // CUBE
        // Upload model matrix
        this.gl.uniformMatrix4fv(this.uniforms.model_matrix, false, this.model_matrix_cube);

        // Select texture to use
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['crate']);

        // Select our cube Vertex Array Object for drawing
        this.gl.bindVertexArray(this.cube_model);
        // Draw the selected Vertex Array Object (using triangles)
        this.gl.drawElements(this.gl.TRIANGLES, 36, this.gl.UNSIGNED_SHORT, 0);


        // Unselect Vertex Array Object and texture
        this.gl.bindVertexArray(null);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    isXR() {
        return this.xr_mode;
    }

    enterXR() {
        console.log('Enter XR');

        navigator.xr.requestSession("immersive-vr").then((session) => {
            this.startXRSession(session);
        }).catch((error) => {
            console.log(error);
        });
    }

    startXRSession(session) {
        // Now in XR
        this.xr_mode = true;
        this.xr_session = session;

        this.xr_session.addEventListener('end', (event) => {
            this.endXRSession();
        });

        // Set XR session's WebGL context to application WebGL2 context
        this.xr_session.updateRenderState({baseLayer: new XRWebGLLayer(this.xr_session, this.gl)});
        // Request our referance space (local => center of world where user head is at start of session)
        this.xr_session.requestReferenceSpace('local').then((ref_space) => {
            this.xr_ref_space = ref_space;
            // Swtich to XR animation loop
            this.xr_session.requestAnimationFrame((timestamp, frame) => { this.xrAnimate(timestamp, frame); });
        }).catch((error) => {
            console.log(error);
        });
    }

    exitXR() {
        this.xr_session.end().then(() => {
            console.log('Manually exiting XR session');
        });
    }

    endXRSession(event) {
        console.log('Exit XR');

        // No longer in XR
        this.xr_mode = false;

        // Restart regular animation loop
        window.requestAnimationFrame((timestamp) => { this.animate(timestamp); });
    }
};

export { CubeXR };
