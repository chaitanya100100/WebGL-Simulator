"use strict";

var setMouseEvents = function () {

	console.log('setMouseEvents');

	canvas.addEventListener('wheel', function(event){

		console.log('scroll');
		var sc = -event.deltaY/Math.abs(event.deltaY);
		eye[0] += 0.1 * sc * dir[0];
		eye[1] += 0.1 * sc * dir[1];
		eye[2] += 0.1 * sc * dir[2];
		event.preventDefault();

	});

	canvas.addEventListener('mousedown', function(event){

		console.log('mousedown');
		drag = true;
		oldX = event.pageX;
		oldY = event.pageY;
		event.preventDefault();

	});

	canvas.addEventListener('mouseup', function(event){

		console.log('mouseup');
		drag = false;
		event.preventDefault();

	});

	canvas.addEventListener('mousemove', function(event){

		if(!drag) return;
		//console.log(event.pageX);
		var dx = (event.pageX - oldX) / canvas.width;
		var dy = (event.pageY - oldY) / canvas.height;

		var hor = vec3.create();
		vec3.cross(hor, dir, up);
		vec3.normalize(hor, hor);

		dir[0] += -dx * hor[0] + dy * up[0];
		dir[1] += -dx * hor[1] + dy * up[1];
		dir[2] += -dx * hor[2] + dy * up[2];

		vec3.cross(up, hor, dir);
		vec3.normalize(up, up);

		vec3.set(up, 0,0,1);

		oldX = event.pageX;
		oldY = event.pageY;
		event.preventDefault();

	});

	document.addEventListener('keydown', function(event){

		if (event.keyCode == KEY_A || event.keyCode == KEY_D) {

			var hor = vec3.create();
			vec3.cross(hor, dir, up);
			vec3.normalize(hor, hor);
			var d = (event.keyCode == KEY_A) ? -1 : 1;
			eye[0] += camera_move_unit * d * hor[0];
			eye[1] += camera_move_unit * d * hor[1];
			eye[2] += camera_move_unit * d * hor[2];

		} else if (event.keyCode == KEY_W || event.keyCode == KEY_S) {

			var d = (event.keyCode == KEY_S) ? -1 : 1;
			eye[0] += camera_move_unit * d * up[0];
			eye[1] += camera_move_unit * d * up[1];
			eye[2] += camera_move_unit * d * up[2];

		}

	});
};
