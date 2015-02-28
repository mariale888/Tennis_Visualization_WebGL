/**
  @author Maria Alejandra Montenegro

  Implementation of graph visualisations.
  Consists of Graph, Nodes and Edges and different 
  types of Layouts.
**/

// scene variables
var container, stats;
var camera, scene, raycaster, controls, renderer;
var pickingData = [], pickingTexture, pickingScene;

var mouse = new THREE.Vector2(), INTERSECTED;
var radius = 100, theta = 0;

var graph ;
var players = [];
var parent;



function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	var info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '10px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> webgl - interactive cubes';
	container.appendChild( info );
	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 10000 );
				camera.position.z = 1000;
	camera.lookAt( scene.position );
	

	var light = new THREE.DirectionalLight( 0xffffff, 1 );
	light.position.set( 1, 1, 1 ).normalize();
	scene.add( light );


	
	raycaster = new THREE.Raycaster();

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xf0f0f0 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	container.appendChild(renderer.domElement);

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	// adding camera controls
	controls = new THREE.TrackballControls( camera );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	//adding mouse stuff
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );


	// laod info
	var minNeighborhs = 2;
	var mainNodesInGraph = false;
	
	graph = new Graph();
	loadPlayers();
	
}

function addNodes()
{
	var initX = window.innerWidth /-2 + 100;
	var initY = window.innerHeight/ -2 + 150;
	console.log(initY);
	console.log("load");
	for (var i = 0; i < players.length; i++) {
		var x = initX + i*20;
		var y = initY + Math.random()*400;
		var z = -300;//Math.random() * Math.random() * 800 - 400;
		var vec = new THREE.Vector3( x, y, z );
		var n = new Node(i, players[i], vec);
		
		n.draw(scene);
		graph.addNode(n);
	} 
}


//function to load players txt file into nodes for the graph
function loadPlayers()
{
	// load a resource
	graph.loadInformation('../../data.txt',
		// Function when resource is loaded
		function ( players_data ) {
			for (var i = 0; i < players_data.length; i++) {
				var p_temp = new Player(players_data[i], Math.random() * 0xf0ffff);
				players.push(p_temp);
			} 
			//ready to load graph
			addNodes();
		}
	);

}


function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();
}


function render() {

	
	
	// find intersections
	controls.update();
	var vector = new THREE.Vector3( mouse.x, mouse.y, - 1 ).unproject( camera );
	var direction = new THREE.Vector3( 0, 0, -1 ).transformDirection( camera.matrixWorld );

	raycaster.set( vector, direction );

	var intersects = raycaster.intersectObjects( scene.children );

	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
			INTERSECTED.material.emissive.setHex( 0xff0000 );

		}

	} else {

		if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

		INTERSECTED = null;

	}

	renderer.render( scene, camera );

}

function onWindowResize() {

	camera.left = window.innerWidth / - 2;
	camera.right = window.innerWidth / 2;
	camera.top = window.innerHeight / 2;
	camera.bottom = window.innerHeight / - 2;

	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}