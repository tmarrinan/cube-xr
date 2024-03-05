const vertex_src = `#version 300 es

precision highp float;

in vec3 vertex_position;
in vec2 vertex_texcoord;

uniform mat4 model_matrix;
uniform mat4 view_matrix;
uniform mat4 projection_matrix;

out vec2 out_texcoord;

void main() {
    gl_Position = projection_matrix * view_matrix * model_matrix * vec4(vertex_position, 1.0);
    out_texcoord = vertex_texcoord;
}
`;

const fragment_src = `#version 300 es

precision mediump float;

in vec2 out_texcoord;

uniform sampler2D image;

out vec4 FragColor;

void main() {
    FragColor = texture(image, out_texcoord);
}
`;

export default {
    'texture.vert': vertex_src,
    'texture.frag': fragment_src
};
