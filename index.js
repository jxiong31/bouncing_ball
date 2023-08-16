function segment(x1, y1, x2, y2) {
    this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
}

boardOutline = []
ballGeoms = [];
step = 0.05;

function updateScene()
{	
	for (var key in ballGeoms) {
		var o = ballGeoms[key];
		if(o.position.x > 1)
			step = -0.05;
		else if(o.position.x < -1)
			step = 0.05;
		o.position.x += step;
	}
	renderer.render( scene, camera );
}

function addOutlineToScene(sc, bo)
{
	bo.push(new segment(-1, -1, 1, -1));
	bo.push(new segment(1, -1, 1, 1));
	bo.push(new segment(1, 1, -1, 1));
	bo.push(new segment(-1, 1, -1, -1));
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
	var CANVAS_WIDTH = 500;
	var CANVAS_HEIGHT = 500;

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
	addOutlineToScene(scene, boardOutline);
	
	// GEOMETRY & MATERIALS	
	var ballGeometry = new THREE.SphereGeometry(0.25, 32, 16);
	var ballMaterial = new THREE.MeshPhongMaterial({color: 0x33aaff});
	var ball = new THREE.Mesh(ballGeometry, ballMaterial);
	scene.add(ball);
	ballGeoms.push(ball);
	
	// var cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
	// var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff55ff});
	// var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
	// scene.add(cube);
	//cube.position.z = 4;    
	// ball.position.x = -0.25;
	// ball.position.y = -0.25;
	// ball.position.z = 1;
	
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
	// var spot1 = new THREE.SpotLight(0xffffff);
	// spot1.position.set(0.21, 0.21, 0.21);
	// scene.add(spot1);

	// add the canvas element into DOM and render the SCENE
	scene3d.appendChild(renderer.domElement);
	renderer.render(scene, camera);
	
	// setup animation
	setInterval(updateScene, 100);
}
);

//resize event listener
// window.addEventListener('resize', function() {    
  // updateScene();
// });
