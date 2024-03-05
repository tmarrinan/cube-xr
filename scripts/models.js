function createPlane(gl, position_attrib, texcoord_attrib) {
    // Create a new Vertex Array Object
    let vertex_array = gl.createVertexArray();
    // Set newly created Vertex Array Object as the active one we are modifying
    gl.bindVertexArray(vertex_array);

    // Create buffer to store vertex positions (3D points)
    let vertex_position_buffer = gl.createBuffer();
    // Set newly created buffer as the active one we are modifying
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_position_buffer);
    // Create array of 3D vertex values (each set of 3 values specifies a vertex: x, y, z)
    let vertices = [
        -1.0,  0.0,  1.0,
         1.0,  0.0,  1.0,
         1.0,  0.0, -1.0,
        -1.0,  0.0, -1.0
    ];
    // Store array of vertex positions in the vertex_position_buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // Enable position_attrib in our GPU program
    gl.enableVertexAttribArray(position_attrib);
    // Attach vertex_position_buffer to the vertex_position_attrib
    // (as 3-component floating point values)
    gl.vertexAttribPointer(position_attrib, 3, gl.FLOAT, false, 0, 0);

    // Create buffer to store vertex texture coordinates (UV)
    let vertex_texcoord_buffer = gl.createBuffer();
    // Set newly created buffer as the active one we are modifying
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_texcoord_buffer);
    // Create array of UV texture coordinate values (each set of 2 values specifies a texture coordinate)
    let texcoords = [
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];
    // Store array of vertex texture coordinates in the vertex_texcoord_buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    // Enable texcoord_attrib in our GPU program
    gl.enableVertexAttribArray(texcoord_attrib);
    // Attach vertex_texcoord_buffer to the texcoord_attrib
    // (as 2-component floating point values)
    gl.vertexAttribPointer(texcoord_attrib, 2, gl.FLOAT, false, 0, 0);

    // Create buffer to store faces of the triangle
    let vertex_index_buffer = gl.createBuffer();
    // Set newly created buffer as the active one we are modifying
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertex_index_buffer);
    // Create array of vertex indices (each set of 3 represents a triangle)
    let indices = [
        0, 1, 2, 0, 2, 3
    ];
    // Store array of vertex indices in the vertex_index_buffer
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // No longer modifying our Vertex Array Object, so deselect
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Return created Vertex Array Object
    return vertex_array;
}

function createCube(gl, position_attrib, texcoord_attrib) {
    // Create a new Vertex Array Object
    let vertex_array = gl.createVertexArray();
    // Set newly created Vertex Array Object as the active one we are modifying
    gl.bindVertexArray(vertex_array);

    // Create buffer to store vertex positions (3D points)
    let vertex_position_buffer = gl.createBuffer();
    // Set newly created buffer as the active one we are modifying
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_position_buffer);
    // Create array of 3D vertex values (each set of 3 values specifies a vertex: x, y, z)
    let vertices = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
         1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,

        // Top face
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,
        -1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
         1.0, -1.0,  1.0,
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
    ];
    // Store array of vertex positions in the vertex_position_buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // Enable position_attrib in our GPU program
    gl.enableVertexAttribArray(position_attrib);
    // Attach vertex_position_buffer to the vertex_position_attrib
    // (as 3-component floating point values)
    gl.vertexAttribPointer(position_attrib, 3, gl.FLOAT, false, 0, 0);

    // Create buffer to store vertex texture coordinates (UV)
    let vertex_texcoord_buffer = gl.createBuffer();
    // Set newly created buffer as the active one we are modifying
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_texcoord_buffer);
    // Create array of UV texture coordinate values (each set of 2 values specifies a texture coordinate)
    let texcoords = [
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Back face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Top face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Bottom face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Right face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];
    // Store array of vertex texture coordinates in the vertex_texcoord_buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    // Enable texcoord_attrib in our GPU program
    gl.enableVertexAttribArray(texcoord_attrib);
    // Attach vertex_texcoord_buffer to the texcoord_attrib
    // (as 2-component floating point values)
    gl.vertexAttribPointer(texcoord_attrib, 2, gl.FLOAT, false, 0, 0);

    // Create buffer to store faces of the triangle
    let vertex_index_buffer = gl.createBuffer();
    // Set newly created buffer as the active one we are modifying
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertex_index_buffer);
    // Create array of vertex indices (each set of 3 represents a triangle)
    let indices = [
         0,  1,  2,      0,  2,  3,   // Front
         4,  5,  6,      4,  6,  7,   // Back
         8,  9, 10,      8, 10, 11,   // Top
        12, 13, 14,     12, 14, 15,   // Bottom
        16, 17, 18,     16, 18, 19,   // Right
        20, 21, 22,     20, 22, 23    // Left
    ];
    // Store array of vertex indices in the vertex_index_buffer
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // No longer modifying our Vertex Array Object, so deselect
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Return created Vertex Array Object
    return vertex_array;
}

export default {
    createPlane,
    createCube
};
