/**
  @author Maria Alejandra Montenegro

  Implementation of graph visualizations.
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

var game_date = ['08/25/2014','08/26/2014','08/27/2014','08/28/2014',
			'08/29/2014','08/30/2014','08/31/2014','09/01/2014',
			'09/02/2014','09/03/2014','09/04/2014','09/05/2014','09/07/2014'];




var group,isDragX, isDragY;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var mouseY = 0;
var mouseYOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var isCircle = true;

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	var info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '10px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	info.innerHTML = "<h2> USOPEN Women's Twitter Popularity Per-Game  </h2> <h3 id='players'>Select a Player:</h3> ";
	container.appendChild( info );
	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 50000 );
	camera.position.set( 0, 150, 10500);//2350 );10500
	//camera.position.z = 1000;
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
	controls.noZoom = false;
	controls.noPan = true;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	//adding mouse stuff
	document.addEventListener('keydown',onDocumentKeyDown, false);
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );

	// load info
	isDragX = false;
	isDragY = false;
	group = new THREE.Group();
	
	numDays = games.length;
	graph = new Graph();
	loadPlayers();
	
	myAxis = new CanvasAxis(numDays, -4700, -1700,0, isCircle);//new CanvasAxis(numDays, -950, -550,0, isCircle);
	var axes = myAxis.buildAxes(4900, game_date);	
	group.add(axes);

	scene.add( group );
}

//Function to add nodes to the graph after reading players data
function addNodes()
{
	var index = 0;
	var d = 0;
	for(var i = 0;i <numDays;i++)
	{
		var file_name = 'CleanData/' + games[i] + '.txt';
		graph.loadInformation(file_name,
			// Function when resource is loaded
			function ( games ) {
				var cur = 0;
				var totalL = Object.keys(games).length;
				var myColor = new ColorNode(totalL);
				
				var color1 = '#088A08';//'#036564';
				var color2 = '#64FE2E';//'#00A0B0';
				var cur_ = 0;
				//first load winners if iscircle
				var looking = 'w';
				var tt = 1;
				if(isCircle) tt = 2;
				for( var w = 0;w < tt;w++){
					for (var key in games)
					{
						var didPass = true;
						for(var a = 0; a < games[key].length;a++)
						{
							var info = games[key][a];
							if(info[3]!=looking && isCircle) {
								didPass = false;
								continue;
							}
							
							var color = myColor.getColorChroma(cur_,color1,color2);
				
							//checking if opponent already set
							var y_player = null;
							
							var opponent_ = graph.getNode_byName(info[4],key);
							if(opponent_ != null)
								y_player = opponent_.position.y;

							// d: cur day // a: cur game // total: total games that day // info:info game
							var pos = myAxis.getPos(d,a + cur,totalL,info,y_player);
							//console.log(pos);
							var n = new Node(index,players[key],info, pos, isCircle, new THREE.Color( color ));
							n.draw( group);
							graph.addNode(n);

							if(players[key].nodeGames.length > 0){
								graph.addEdge(players[key].nodeGames[players[key].nodeGames.length-1],n,true);
							}
							players[key].nodeGames.push(n)

							index += 1;
						}
						if(didPass ){
							cur_+=1;
							cur+=1;
						}
					} 
					looking = 'l';
					color1 = '#B40431';//'#BD1550';
				    color2 = '#DF0101';//'#E97F02';
					cur_ = 0;
				}
				//add game edges
				for (var key in games)
				{
					for(var a = 0; a < games[key].length;a++)
					{
						var info = games[key][a];
						for(var i = 0;i<players[key].nodeGames.length;i++)
						{
							if(players[key].nodeGames[i].isSet)
								continue;
							for(var j=0;j<players[info[4]].nodeGames.length;j++)
							{
								if(players[info[4]].nodeGames[j]) {
									if(players[info[4]].nodeGames[j].isSet == true)
										continue;
									if(key == players[info[4]].nodeGames[j].info['opponent']){
										graph.addEdge(players[key].nodeGames[i],players[info[4]].nodeGames[j],false);
										//console.log(players[key].nodeGames[i].info['opponent'] + ' ' + players[info[4]].nodeGames[j].info['opponent'])
									}
								}
							}
						}
					}
				} 
				myAxis.counter = 0;
				d+=1;
				if(d >= numDays)
					graph.drawEdges(group,5);
			}
		);
	}
}


//function to load players txt file into nodes for the graph
function loadPlayers()
{
	// load a resource
	graph.loadInformation('data.txt',
		// Function when resource is loaded
		function ( players_data ) {
			var myColor = new ColorNode(players_data.length);

			for (var i = 0; i < players_data.length; i++) {
				var color = myColor.getRGBColor(i, true);
				var name = players_data[i].split(' ');
				var p_temp = new Player(name[1],name[0], new THREE.Color( color ));
				var key = name[0]+'_'+name[1];
				players[key] = (p_temp);
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

	/*if(isDragX)
		group.rotation.y += ( targetRotation - group.rotation.y) * 0.05;
	if(isDragY)
		group.rotation.x += ( targetRotation - group.rotation.x) * 0.05;
	*/
	
	//var vector = new THREE.Vector3( mouse.x, mouse.y, - 1 ).unproject( camera );
	var direction = new THREE.Vector3( 0, 0, -1 ).transformDirection( camera.matrixWorld );
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( camera );

	raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
	var intersects = raycaster.intersectObjects( group.children );
	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED && INTERSECTED['name'] == 'node'){
				//INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
				INTERSECTED.material.opacity = INTERSECTED.currentopacity
				graph.findSame(INTERSECTED,INTERSECTED.currentopacity, 1);
				$('#players').html('Select a player');
			}

			INTERSECTED = intersects[ 0 ].object;
			if(INTERSECTED['name'] == 'node')
			{
				INTERSECTED.currentopacity = INTERSECTED.material.opacity;
				INTERSECTED.material.opacity = 1;
				//INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
				//INTERSECTED.material.emissive.setHex( 0xff0000 );
				pname = graph.findSame(INTERSECTED,1, 2 );
				name = pname.player.fullName();
				name += '<br/> <small id="text">Total Tweets: </small><small id="tt">' + (pname.info['total'] *10)     + '</small>';
				name += '<br/> <small id="text">Positive Tweets: <small id="pos">' + (pname.info['pos'] *10)          + '</small>';
				name += '<br/> <small id="text">Negative Tweets: </small><small id="neg">' + (pname.info['neg'] *10) + '</small>';
				$('#players').html(name);
			}

		}

	} else {

		if ( INTERSECTED && INTERSECTED['name'] == 'node'){
			//INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
			INTERSECTED.material.opacity = INTERSECTED.currentopacity
			graph.findSame(INTERSECTED,INTERSECTED.currentopacity, 1 );
			$('#players').html('Select a Player:');

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

function onDocumentKeyDown(event)
{
	var delta = 200;
	event = event || window.event;
	var keycode = event.keyCode;
	switch(keycode){
		case 37 : //left arrow
			group.position.x = group.position.x + delta;
		break;
		case 38 : // up arrow
			group.position.y = group.position.y - delta;
		break;
		case 39 : // right arrow 
			group.position.x = group.position.x - delta;
		break;
		case 40 : //down arrow
			group.position.y = group.position.y + delta;
		break;
	}
}
function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	if(isDragX )
	{
		mouseX = event.clientX - windowHalfX;
		targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;
	}
	if(isDragY)
	{
		mouseY = event.clientY - windowHalfY;
		targetRotation = targetRotationOnMouseDown + ( mouseY - mouseYOnMouseDown ) * 0.02;
	}
}


function onDocumentMouseDown( event ) {

	event.preventDefault();

	isDragX = true;
	if(event.button == 2){
		isDragY = true;
		isDragX = false;
	}

	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mouseout', onDocumentMouseOut, false );

	mouseXOnMouseDown = event.clientX - windowHalfX;
	mouseYOnMouseDown = event.clientY - windowHalfY;

	targetRotationOnMouseDown = targetRotation;

}

function onDocumentMouseUp( event ) {

	isDragX = false;
	isDragY = false;
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentMouseOut( event ) {

	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentTouchStart( event ) {
	if ( event.touches.length == 1 ) {
		event.preventDefault();
		mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
		mouseYOnMouseDown = event.touches[ 0 ].pageY - windowHalfY;
		targetRotationOnMouseDown = targetRotation;
	}
}

function onDocumentTouchMove( event ) {
	if ( event.touches.length == 1 ) {
		event.preventDefault();
		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;
	}
}