function point(x, y) {
	this.x = x;
	this.y = y;
}

function segment(p1, p2) {
    this.start = p1;
	this.end = p2;
}

var CANVAS_WIDTH = 500;
var CANVAS_HEIGHT = 500;
var BALL_SIZE = 0.1;

var boardOutline = [];
var shrinkedOutline = [];
var ballGeoms = [];
var step = 0.005;
var curPos = {
	x: 0,
	y: 0,
};
var direction = {
	i: Math.sqrt(3)/2,
	j: 1/2
}
function nextPos() {
	let pos = new point(curPos.x + step*direction.i, curPos.y + step*direction.j)
	return pos;
}

function getCurSeg(curPos, newPos) {
	return new segment(curPos, newPos);
}

function getSegmentSegmentIntersection(lineseg, seg, inter) {
	
	let slope1 = (lineseg.end.y - lineseg.start.y)/(lineseg.end.x - lineseg.start.x);
	let slope2 = (seg.end.y - seg.start.y)/(seg.end.x - seg.start.x);
	if(slope1 == slope2) {
		return false;
	}
	let xval = (-(lineseg.end.y - seg.end.y) + slope1*(lineseg.end.x) - slope2*(seg.end.x))/(slope1-slope2);
	if(seg.end.x == seg.start.x) {
		xval = 	seg.start.x;
	}
	let yval = slope1 * (xval - lineseg.end.x) + lineseg.end.y;
	let xmin = Math.min(lineseg.start.x, lineseg.end.x);
	let xmax = Math.max(lineseg.start.x, lineseg.end.x);
	let ymin = Math.min(lineseg.start.y, lineseg.end.y);
	let ymax = Math.max(lineseg.start.y, lineseg.end.y);
	
	if(xval <= xmin || xval >= xmax) {
		return false;
	}
	if(yval <= ymin || yval >= ymax) {
		return false;
	}
	inter.x = xval;
	inter.y = yval;
	return true;
}


function findIntersection(lineseg) {
	for(var i in shrinkedOutline) {
		let seg = shrinkedOutline[i];

		let inter = {
			x: 0,
			y: 0,
		};
		if(getSegmentSegmentIntersection(lineseg, seg, inter))
		{
			lineseg.start = inter;
			return i;
		} 
	}
	return -1;
}

function getVector(p1, p2) {
	let xcomp = p2.x - p1.x;
	let ycomp = p2.y - p1.y;
	let vec = {
		i: (xcomp),
		j: (ycomp), 
	}
	return vec;
}

function getLength(vec1, vec2) {
	return (vec1.i * vec2.i) + (vec1.j * vec2.j);
}
function getPoint(p, vec) {
	let p1 = {
		x: vec.i + p.x,
		y: vec.j + p.y,
	}
	return p1;
}

function makeUnit(vec) {
	let unit = Math.sqrt(Math.pow(vec.i, 2) +Math.pow(vec.j, 2));
	vec.i /= unit;
	vec.j /= unit;
}

function reflectPoint(intersection, lineseg) {
	let inter = shrinkedOutline[intersection];
	let vec1 = getVector(inter.start, inter.end);
	let vec2 = getVector(inter.start, lineseg.end);
	makeUnit(vec1);
	let length = getLength(vec1, vec2);
	let vec3 = {
		i: vec1.i *= length,
		j: vec1.j *= length,
	}
	let perpPoint = getPoint(inter.start, vec3);
	let vec4 = getVector(lineseg.end, perpPoint);
	let finalPoint = getPoint(perpPoint, vec4);
	lineseg.end = finalPoint;
	direction = getVector(lineseg.start, lineseg.end)
	makeUnit(direction);
}


function getFinalPos(lineseg) {
	while(true) {
		let intersection = findIntersection(lineseg);
		if(intersection === -1) {
			return lineseg.end;
		}
		reflectPoint(intersection, lineseg)
	}
}

function updateScene()
{	
	for(var key in ballGeoms) {
		var o = ballGeoms[key];
		let newPos = nextPos();
		let lineseg = getCurSeg(curPos, newPos);
		let finalPos = getFinalPos(lineseg);
		o.position.x = finalPos.x;
		o.position.y = finalPos.y;
		curPos = finalPos;
	}

	renderer.render( scene, camera );
}

function setCoordinates() {
	let xc = parseFloat(document.getElementById("x").value);
	let yc = parseFloat(document.getElementById("y").value);
	let angle = parseFloat(document.getElementById("angle").value);
	curPos.x = xc;
	curPos.y = yc;
	direction.i = Math.cos(angle * (Math.PI)/180);
	direction.j = Math.sin(angle * (Math.PI)/180);
	makeUnit(direction);
	
	updateScene();
}



function addOutlineToScene(sc, bo)
{
	let p1 = new point(-1,-1);
	let p2 = new point(1,-1);
	let p3 = new point(1,1);
	let p4 = new point(-1,1);

	bo.push(new segment(p1, p2));
	bo.push(new segment(p2, p3));
	bo.push(new segment(p3, p4));
	bo.push(new segment(p4, p1));
	const lmaterial = new THREE.LineBasicMaterial({
		color: 0x0000ff
	});
	for (var key in bo) {
		var o = bo[key];
		var points = [];
		points.push( new THREE.Vector3( o.x1, o.y1, 0 ) );
		points.push( new THREE.Vector3( o.x2, o.y2, 0 ) );
		var geometry = new THREE.BufferGeometry();
		geometry.setFromPoints( points );
		var line = new THREE.LineSegments( geometry, lmaterial );
		sc.add( line );

	}
}

function addBallToScene()
{
}

$(document).ready(function() {
	var scene3d = document.getElementById("scene3d");
	

	// SCENE
	scene = new THREE.Scene();

	// setup CAMERA 

	// projection matrix
	// near/far is distance to camera in world coodinate unit
	camera = new THREE.OrthographicCamera(-1.1, 1.1, 1.1, -1.1, 0, 1000);

	// view matrix
    camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 10;
	camera.lookAt(0, 0, 0);	

	// setup RENDERER

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0xeeeeee, 1.0);
	renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

	// prepare scene
	// outline
	addOutlineToScene(scene, shrinkedOutline);
	
	// GEOMETRY & MATERIALS	
	var ballGeometry = new THREE.SphereGeometry(BALL_SIZE, 32, 16);
	var ballMaterial = new THREE.MeshPhongMaterial({color: 0x33aaff});
	var ball = new THREE.Mesh(ballGeometry, ballMaterial);
	scene.add(ball);
	ballGeoms.push(ball);
	
	//  var cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
	//  var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff55ff});
	//  var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
	//  scene.add(cube);
    //  ballGeoms.push(cube);
	//cube.position.z = 0;    
	 ball.position.x = 0;
	 ball.position.y = 0;
	 ball.position.z = -0.5;
	
	// scene.position.x = 0.5;
	// scene.position.y = 0.5;

	// var floorGeometry = new THREE.BoxGeometry(30, 1, 30);
	// var floorMaterial = new THREE.MeshBasicMaterial({color: 0x656587});
	// var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	// scene.add(floor);
	// floor.position.y = -3;
	// floor.receiveShadow = true;

	// setup LIGHT
    const alight = new THREE.AmbientLight( 0xffffff );
	scene.add(alight);
	var spot1 = new THREE.SpotLight(0xffffff);
	spot1.position.set(0.25, 0, 0.25);
	scene.add(spot1);

	// add the canvas element into DOM and render the SCENE
	scene3d.appendChild(renderer.domElement);
	renderer.render(scene, camera);
	
	// setup animation
	setInterval(updateScene, 0.001);
}
);

//resize event listener
 window.addEventListener('resize', function() {    
   updateScene();
 });
