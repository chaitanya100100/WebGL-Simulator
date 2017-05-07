 "use strict";

// Load shaders and init
var initSimulation = function () {

	console.log("initSimulation");
	$.ajax({
            url : 'shaders/vertexShader.glsl',
            dataType: "text",
            success : function (vsText) {

				$.ajax({
			            url : 'shaders/fragmentShader.glsl',
			            dataType: "text",
			            success : function (fsText) {
							runSimulation(vsText, fsText);
						},
						failure : function (xhr, textStatus, err) {
							console.error(xhr);
							console.error(textStatus);
							console.error(err);
						}
			        });

			},
			failure : function (xhr, textStatus, err) {
				console.error(xhr);
				console.error(textStatus);
				console.error(err);
			}
        });
};


var runSimulation = function (vsText, fsText) {
	// Initialization
	console.log("startSimulation");
    
	initializeGlobals();
	canvas = document.getElementById('main_window');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

	// Get Canvas context
	gl = canvas.getContext('webgl');
	if(!gl){
		console.log("WebGL not supported. Jumping to experimental");
		gl = canvas.getContext('experimental-webgl');
	}
	if(!gl){
		alert('Your browser does not support WebGL');
		return;
	}
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	// Vertex Shader
	vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vsText);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR : compiling vertex shader');
		console.error(gl.getShaderInfoLog(vertexShader));
		return;
	}

	// Fragment Shader
	fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fsText);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR : compiling fragment shader');
		console.error(gl.getShaderInfoLog(fragmentShader));
		return;
	}

	// Create and link program
	program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR : linking program');
		console.error(gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR : validating program');
	}

    gl.useProgram(program);
	modelUniformLocation = gl.getUniformLocation(program, 'model');
	viewUniformLocation = gl.getUniformLocation(program, 'view');
	projUniformLocation = gl.getUniformLocation(program, 'proj');

    loadAllModels();
    setMouseEvents();
	//createModel('block', "data/block.obj", "image/wood.jpg", vec3.fromValues(0,0,0), vec3.fromValues(1,1,1), vec3.fromValues(0,0,0));
};


// update
var update = function () {

};


// render
var render = function () {

    gl.useProgram(program);
    gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    mat4.lookAt(viewMat, eye, vec3.add( vec3.create(), eye, dir ), up);
    mat4.perspective(projMat, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 100.0);

    var rotationX = mat4.create();
    var rotationY = mat4.create();
    var rotationZ = mat4.create();
    var translation = mat4.create();

    for (var model in models) {

        model = models[model];

        mat4.identity(modelMat);

        mat4.fromXRotation(rotationX, 90.0 * Math.PI / 180.0);
        mat4.fromZRotation(rotationZ, 90.0 * Math.PI / 180.0);
        mat4.fromTranslation(translation, model.pos);

        mat4.mul(modelMat, modelMat, translation);
        mat4.mul(modelMat, modelMat, rotationZ);
        mat4.mul(modelMat, modelMat, rotationX);

        gl.uniformMatrix4fv(modelUniformLocation, gl.FALSE, modelMat);
        gl.uniformMatrix4fv(viewUniformLocation, gl.FALSE, viewMat);
        gl.uniformMatrix4fv(projUniformLocation, gl.FALSE, projMat);


        gl.bindTexture(gl.TEXTURE_2D, model.TO);
        gl.activeTexture(gl.TEXTURE0);
        gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);

    }
};


// Main loop
var Game = function () {

	var loop = function () {
        update();
        render();
        requestAnimationFrame(loop);
    };
	requestAnimationFrame(loop);
};
