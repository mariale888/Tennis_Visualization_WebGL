/**
  @author Maria Alejandra Montenegro

  Implementation of a player class structure.
  Consists of info necessary for graph visualization.
**/

// players info
function Player(firstName, pcolor)
{
	this.name = name;
	this.pcolor = pcolor;
	this.nodeGames = {};
}


function Graph()
{
	this.nodeSet = {};
	this.nodes = [];
	this.edges = [];
}

function Node(id, player, position)
{
	this.id = id;
	this.player = player;
	this.isSet  = false;
	this.weight = 0;
	this.nodesTo   = [];
	this.nodesFrom = [];
	this.position  = position;
	this.data = {};
}

//-----
//Add new node to graph
Graph.prototype.addNode = function(node) 
{
	if(this.nodeSet[node.id] == undefined)
	{
		this.nodeSet[node.id] = node;
    	this.nodes.push(node);
		return true;
	}

	return false;
};

Graph.prototype.getNode = function(node_id) 
{
  return this.nodeSet[node_id];
};

//-----
//Add dynamically to the already defined object a new getter
Graph.prototype.loadInformation = function(url, callback)
{

	var xhr = new XMLHttpRequest();
	var length = 0;

	xhr.onreadystatechange = function () {
		if ( xhr.readyState === xhr.DONE ) {

			if ( xhr.status === 200 || xhr.status === 0 ) {

				if ( xhr.responseText ) {

					var json = JSON.parse( xhr.responseText );

					if ( json.metadata !== undefined && json.metadata.type === 'scene' ) {

						console.error( 'THREE.JSONLoader: "' + url + '" seems to be a Scene. Use THREE.SceneLoader instead.' );
						return;
					}
					callback( json );

				} else {
					console.error( 'THREE.JSONLoader: "' + url + '" seems to be unreachable or the file is empty.' );
				}
			} else {
				console.error( 'THREE.JSONLoader: Couldn\'t load "' + url + '" (' + xhr.status + ')' );
			}
		} 
	};

	xhr.open( 'GET', url, true );
	xhr.withCredentials = this.withCredentials;
	xhr.send( null );
};

Node.prototype.draw = function(scene, nodes)
{

	var width = 20;
	var geometry = new THREE.BoxGeometry( width, width, width );
	var material =  new THREE.MeshLambertMaterial( { color: this.player.pcolor });
	//	var material = new THREE.MeshBasicMaterial( { color: this.player.pcolor, opacity: 0.7  } );

    var draw_obj = new THREE.Mesh( geometry, material );
	
	draw_obj.position.x = this.position.x;
	draw_obj.position.y = this.position.y;
	draw_obj.position.z = this.position.z;

	
	var textOpt = ["20pt", "", ""];
	
	if(this.player.name === undefined)
	{
		var label = new THREE.Label("temp label", textOpt);	
	}
	else{
		var label = new THREE.Label(this.player.name, textOpt);	
	}
	
	label.position.x = draw_obj.position.x;
  	label.position.y = draw_obj.position.y +( width);
	label.position.z = draw_obj.position.z;
		
	this.data.label_object = label;
	scene.add( this.data.label_object );
	
	draw_obj.name = this.data.name;
	draw_obj.id   = this.id;
	this.data.draw_obj  = draw_obj;
	this.position       = draw_obj.position;
	
	//nodes.push(this.data.draw_obj);
	scene.add(this.data.draw_obj) ;
	
};

