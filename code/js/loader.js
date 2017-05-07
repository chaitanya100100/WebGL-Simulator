"use strict";

// Load All Models
var loadAllModels = function () {
	$.when(
			loadModel("data/goldfish.obj")
		).done(
			function (d1) {

				console.log('loaded all');

				models["goldfish"] = createModel(
							'Goldfish',						// Name
							"data/goldfish.obj", 			// URL to obj file
							"goldfish", 					// ID of image
							vec3.fromValues(0,0,0), 		// Position
							vec3.fromValues(1,1,1),		 	// Scale
							vec3.fromValues(0,0,0), 		// Speed
							d1,								// Model Data
							vec3.fromValues(0.5, 0.5, 0.5)	// Initial Scale
						);

				Game();
			}
		);
};


// get model data
var loadModel = function (url) {
	console.log('load : ' + url);
	return $.ajax({
            url : url,
            dataType: "text"
        });
};

// create model
var createModel = function (modelName, dataUrl, textureImageId, pos, scale, speed, modelText, initialScale) {

	var VERTEX_RE = /^v\s/;
    var NORMAL_RE = /^vn\s/;
    var TEXTURE_RE = /^vt\s/;
    var FACE_RE = /^f\s/;
	var WHITESPACE_RE = /\s+/;

	var verts = [];
	var normals = [];
	var textures = [];
	var unpacked = {
		verts : [],
		normals : [],
		textures : [],
		hash : {},
		indices : [],
		index : 0
	};

	var lines = modelText.split('\n');

	for (var i = 0; i < lines.length; i++) {
		var line = lines[i].trim();
		var elements = line.split(WHITESPACE_RE);
		var type = elements.shift();

		if (line.match(VERTEX_RE)) {
			verts.push.apply(verts, elements);
		} else if (line.match(NORMAL_RE)) {
			normals.push.apply(normals, elements);
		} else if (line.match(TEXTURE_RE)) {
			textures.push.apply(textures, elements);
		} else if (line.match(FACE_RE)) {

			for (var j = 0; j < elements.length; j++) {

				if (elements[j] in unpacked.hash) {
					unpacked.indices.push(unpacked.hash[elements[j]]);
				} else {

					var vd = elements[j].split('/');

					unpacked.verts.push( parseFloat(verts[ (vd[0]-1) * 3 + 0 ]) * initialScale[0]);
					unpacked.verts.push( parseFloat(verts[ (vd[0]-1) * 3 + 1 ]) * initialScale[1]);
					unpacked.verts.push( parseFloat(verts[ (vd[0]-1) * 3 + 2 ]) * initialScale[2]);

					if (textures.length) {
						unpacked.textures.push( textures[ (vd[1]-1) * 2 + 0 ]);
						unpacked.textures.push( textures[ (vd[1]-1) * 2 + 1 ]);
					}

					unpacked.normals.push( normals[ (vd[2]-1) * 3 + 0 ]);
					unpacked.normals.push( normals[ (vd[2]-1) * 3 + 1 ]);
					unpacked.normals.push( normals[ (vd[2]-1) * 3 + 2 ]);

					unpacked.hash[elements[j]] = unpacked.index;
					unpacked.indices.push(unpacked.index);
					unpacked.index++;
				}
			}

		}
	}

	// Position
	var VBO = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpacked.verts), gl.STATIC_DRAW);

	// Textures
	var TBO = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, TBO);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpacked.textures), gl.STATIC_DRAW);

	// Normals
	var NBO = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, NBO);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpacked.normals), gl.STATIC_DRAW);

	// Indices
	var IBO = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(unpacked.indices), gl.STATIC_DRAW);


	// Bind Vertices
	gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
	var posAttrLocation = gl.getAttribLocation(program, 'vertPosition');
	gl.vertexAttribPointer(
		posAttrLocation,
		3, gl.FLOAT, gl.FALSE,
		3 * Float32Array.BYTES_PER_ELEMENT,
		0
	);
	gl.enableVertexAttribArray(posAttrLocation);

	// Bind Textures
	gl.bindBuffer(gl.ARRAY_BUFFER, TBO);
	var texAttrLocation = gl.getAttribLocation(program, 'vertTexCoord');
	gl.vertexAttribPointer(
		texAttrLocation,
		2, gl.FLOAT, gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT,
		0
	);
	gl.enableVertexAttribArray(texAttrLocation);

	// Bind Normals
	gl.bindBuffer(gl.ARRAY_BUFFER, NBO);
	var normalAttrLocation = gl.getAttribLocation(program, 'vertNormal');
	gl.vertexAttribPointer(
		normalAttrLocation,
		3, gl.FLOAT, gl.FALSE,
		3 * Float32Array.BYTES_PER_ELEMENT,
		0
	);
	gl.enableVertexAttribArray(normalAttrLocation);

	// Bind Textures 2
	var modelTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, modelTexture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		document.getElementById(textureImageId)
	);

	return {
		name : modelName,
		pos : pos,
		scale : scale,
		speed : speed,

		vertices : unpacked.verts,
		textures : unpacked.textures,
		normals : unpacked.normals,
		indices : unpacked.indices,

		VBO : VBO,
		IBO : IBO,
		TBO : TBO,
		NBO : NBO,
		TO : modelTexture,

		filedata : modelText,
		dataUrl : dataUrl,
		textureImageId : textureImageId,
	};
};


// Return Image from given url
var loadImage = function (url) {
	var image = new Image();
	image.onload = function(){
		callback(null, image);
	};
	image.src = url;
};


// Return Text from given url
var loadTextResource = function (url, callback) {
	$.ajax({
            url : url,
            dataType: "text",
            success : callback,
			failure : function (xhr, textStatus, err) {
				console.error(xhr);
				console.error(textStatus);
				console.error(err);
			}
        });
};
