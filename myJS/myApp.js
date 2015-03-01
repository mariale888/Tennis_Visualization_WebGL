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

var graph , myAxis;
var players = {};
var parent;

var numDays = 13;
var games = ['usopen_25','usopen_26','usopen_27','usopen_28',
			'usopen_29','usopen_30','usopen_31','usopen_01',
			'usopen_02','usopen_03','usopen_04','usopen_05','usopen_07'];

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
	numDays = games.length;
	graph = new Graph();
	loadPlayers();
	myAxis = new CanvasAxis(numDays, -700, -450,-900);
	var axes = myAxis.buildAxes(1400);
	scene.add(axes);
}

function addNodes()
{
	var index = 0;
	var d = 0;
	for(var i = 0;i <numDays;i++)
	{
		var file_name = '../../CleanData/' + games[i] + '.txt';
		graph.loadInformation(file_name,
			// Function when resource is loaded
			function ( games ) {
				var cur = 0;
				var totalL =Object.keys(games).length;
				for (var key in games)
				{
					for(var a = 0; a < games[key].length;a++)
					{
						var info = games[key][a];
						var pos = myAxis.getPos(d,a + cur,totalL,info);
						//console.log(pos);
						var n = new Node(index,players[key],info, pos);
						n.draw(scene);
						graph.addNode(n);

						if(players[key].nodeGames.length > 0){
							graph.addEdge(players[key].nodeGames[players[key].nodeGames.length-1],n,true);
						}
						players[key].nodeGames.push(n)
						index += 1;
					}
					cur+=1;
				} 
				//add game edges
				for (var key in games)
				{
					for(var a = 0; a < games[key].length;a++)
					{
						var info = games[key][a];
						if(info.length < 3) continue;
						//console.log(players[key])
						//console.log(players[info[4]]);
						if(players[info[4]] ==null) continue;
						for(var i = 0;i<players[key].nodeGames.length;i++)
						{
							if(players[key].nodeGames[i].isSet)
								continue;
							
							for(var j=0;j<players[info[4]].nodeGames.length;j++)
							{
								if(players[info[4]].nodeGames[j]) {
									if(players[info[4]].nodeGames[j].isSet == true)
										continue;
									if(key == players[info[4]].nodeGames[j].info['oponent']){
										graph.addEdge(players[key].nodeGames[i],players[info[4]].nodeGames[j],false);
									}
								}
							}
						}
					}
				} 

				d+=1;
				if(d >= numDays)
					graph.drawEdges(scene,5);
			}
		);
	}
}


//function to load players txt file into nodes for the graph
function loadPlayers()
{
	// load a resource
	graph.loadInformation('../../data.txt',
		// Function when resource is loaded
		function ( players_data ) {
			var myColor = new ColorNode(players_data.length);

			for (var i = 0; i < players_data.length; i++) {
				var color = myColor.getRGBColor(i, true);
				var name = players_data[i].split(' ');
				var p_temp = new Player(name[1],name[0], new THREE.Color( color ));

				players[name[0]] = (p_temp);
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
	
	camera.lookAt( scene.position );
	camera.updateMatrixWorld();
	// find intersections
	controls.update();
	//var vector = new THREE.Vector3( mouse.x, mouse.y, - 1 ).unproject( camera );
	var direction = new THREE.Vector3( 0, 0, -1 ).transformDirection( camera.matrixWorld );
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( camera );

	raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
	var intersects = raycaster.intersectObjects( scene.children );
	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED && INTERSECTED['name'] == 'node'){
				//INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
				INTERSECTED.material.opacity = INTERSECTED.currentopacity
				graph.findSame(INTERSECTED,INTERSECTED.currentopacity, new THREE.Vector3( 1, 1, 1 ) );
			}

			INTERSECTED = intersects[ 0 ].object;
			if(INTERSECTED['name'] == 'node')
			{
				INTERSECTED.currentopacity = INTERSECTED.material.opacity;
				INTERSECTED.material.opacity = 1;
				//INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
				//INTERSECTED.material.emissive.setHex( 0xff0000 );
				graph.findSame(INTERSECTED,1, new THREE.Vector3( 5, 5, 5 ) );
			}
		}

	} else {

		if ( INTERSECTED && INTERSECTED['name'] == 'node'){
			//INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
			INTERSECTED.material.opacity = INTERSECTED.currentopacity
			graph.findSame(INTERSECTED,INTERSECTED.currentopacity, new THREE.Vector3( 1, 1, 1 ) );
		}
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