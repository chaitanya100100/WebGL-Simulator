"use strict";

var canvas;
var gl;
var bgColor;
var models;
var vertexShader;
var fragmentShader;
var program;

var eye;
var dir;
var up;

var modelUniformLocation;
var viewUniformLocation;
var projUniformLocation;
var modelMat;
var viewMat;
var projMat;

var drag;
var oldX;
var oldY;
var camera_move_unit;

var KEY_W;
var KEY_D;
var KEY_S;
var KEY_A;

var initializeGlobals = function () {

	console.log("initializeGlobals");

	bgColor = vec4.fromValues(0.7, 0.7, 0.7, 1.0);
    models = {};

	eye = vec3.fromValues(0,-5,0);
    dir = vec3.fromValues(0,1,0);
    up = vec3.fromValues(0,0,1);

	modelMat = new Float32Array(16);
	viewMat = new Float32Array(16);
	projMat = new Float32Array(16);

	drag = false;
	camera_move_unit = 0.15;

	KEY_A = 65;
	KEY_S = 83;
	KEY_W = 87;
	KEY_D = 68;
};
