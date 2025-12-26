import dispatcher from '../dispatcher.js';
import EventEmitter from '../utils/EventEmitter.js';
import THREE from '../../libs/THREE.js';

var eventEmitter = new EventEmitter();

var alpha = 0;
var	beta = 0;
var	gamma = 0;

// var relative = {
// 	alpha: 0,
// 	beta: 0,
// 	gamma: 0
// }

// var startPosition = {
// 	alpha: null,
// 	beta: null,
// 	gamma: null
// }

var rotX = 0;
var rotY = 0;
var rotZ = 0;
var normX = 0;
var normY = 0;
var normZ = 0;

var q = new THREE.Quaternion();
var e = new THREE.Vector3();
var oe;
var re = new THREE.Vector3();

var _handleEvent = function(e) {

}

var _getQuaternion = function (alpha, beta, gamma, orient) {
	var zee = new THREE.Vector3( 0, 0, 1 );
	var euler = new THREE.Euler();
	var q0 = new THREE.Quaternion();
	var q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0,  Math.sqrt(0.5)); // - PI/2 around the x-axis
	var quaternion = new THREE.Quaternion();

	euler.set(beta, alpha, -gamma, 'YXZ');
	quaternion.setFromEuler(euler);
	quaternion.multiply(q1);
	quaternion.multiply(q0.setFromAxisAngle(zee, - orient));
	return quaternion
}

var _getEuler = function(x, y, z, w) {
	var pitch, roll, yaw;
	var euler;
	var test = x * y + z * w;
	var sqx, sqy, sqz;

	if (test > 0.499) { // singularity at north pole
		yaw = 2 * Math.atan2(x, w);
		pitch = Math.PI / 2;
		roll = 0;

		euler = new THREE.Vector3( pitch, roll, yaw);
		return euler;
	}
	if (test < -0.499) { // singularity at south pole
		yaw = -2 * Math.atan2(x, w);
		pitch = -Math.PI / 2;
		roll = 0;
		euler = new THREE.Vector3( pitch, roll, yaw);
		return euler;
	}
	sqx = x * x;
	sqy = y * y;
	sqz = z * z;
	yaw = Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * sqy - 2 * sqz);
	pitch = Math.asin(2 * test);
	roll = Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * sqx - 2 * sqz);

	euler = new THREE.Vector3( pitch, roll, yaw);
	return euler;
}

var _handleOrientation = function(e) {
	var gamma = THREE.Math.degToRad(e.gamma);
	var beta = THREE.Math.degToRad(e.beta);
	var alpha = THREE.Math.degToRad(e.alpha);
	var orient = 0;

	q = _getQuaternion(alpha, beta, gamma, orient);
	e = _getEuler(q.x, q.y, q.z, q.w);

	if (!oe) {
		oe = new THREE.Vector3().copy(e);
	}

	re = oe.clone().sub(e);

	// rotY += (rotY - q.z) / 5;
	// rotX += (rotX - q.y) / 5;

	normX = normX + (-re.x - normX) / 5;
	normY = normY + (-re.y - normY) / 5;
	normZ = normZ + (-re.z - normZ) / 5;
}

var _loop = function() {
	rotX = normX;
	rotY = normY;
	rotZ = normZ;

	eventEmitter.dispatch();
	requestAnimationFrame(_loop);
}

var getData = function() {
	return {
		alpha: alpha,
		beta: beta,
		gamma: gamma,
		rotX: rotX,
		rotY: rotY,
		rotZ: rotZ,
		q: q,
		e: e,
		re: re
	}
}

var _init = function() {
	dispatcher.subscribe(_handleEvent);
	window.addEventListener('deviceorientation', _handleOrientation);
	_loop();
}

_init();

export default {
	subscribe: eventEmitter.subscribe.bind(eventEmitter),
	unsubscribe: eventEmitter.unsubscribe.bind(eventEmitter),
	getData: getData
}