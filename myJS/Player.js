/**
  @author Maria Alejandra Montenegro

  Implementation of a player class structure.
  Consists of info necessary for graph visualization.
**/

// players info
function Player(firstName,lastName, pcolor)
{
	this.firstName = firstName;
	this.lastName = lastName;

	this.pcolor = pcolor;
	this.nodeGames = [];

	this.fullName = function()
	{
		return this.lastName + ' ' + this.firstName;
	}
}

function Graph()
{
	this.nodeSet = {};
	this.nodes = [];
	this.edges = [];
	this.curve = false;
}

function Node(id, player, info, position)
{
	this.id = id;
	this.player = player;
	this.isSet  = false;
	this.weight = 0;
	this.nodesTo   = [];
	this.nodesFrom = [];
	this.position  = position;
	this.data = {};
	this.info = {};
	this.info['total'] = info[0];
	this.info['pos'] = info[1];
	this.info['neg'] = info[2];
	this.info['stat'] = info[3];
	this.info['opponent'] = info[4];


}
function Edge(source, target,isSame)
{
  this.source = source;
  this.target = target;
  this.data = {};
  this.isSame = isSame;
  if(this.isSame)
  	this.data.color = this.source.player.pcolor;
  else 
  	this.data.color = 0x000033;
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
Graph.prototype.addEdge = function(source, target, isSame)
{
  if(source.addConnectedTo(target) === true) 
  {
	target.addConnectedFrom(source);
    var edge = new Edge(source, target,isSame);
    this.edges.push(edge);
    if(isSame == false)
    {
    	source.isSet = true;
    	target.isSet = true;
    }
    return edge;
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

Graph.prototype.findSame = function(obj, c,scale)
{
	var name = 'nothing';
	for(var i = 0; i < this.nodes.length; i++)
	{
		if(this.nodes[i].data.draw_obj == obj){
			name = this.nodes[i].player.fullName();
			this.nodes[i].update(scale,c);
			break;
		}
	}
	
	for(var i = 0;i< this.edges.length;i++)
	{
		if(this.edges[i].source.player.fullName() == name && this.edges[i].target.player.fullName() == name)
		{
			this.edges[i].source.update(scale,c);
			this.edges[i].target.update(scale,c);
			this.edges[i].update(scale,c);
		}
	}

	return name;
}

Graph.prototype.drawEdges = function(scene,rad)
{
	//drawing edges as curve
	for(var i = 0; i < this.edges.length; i++)
	{
		var e = this.edges[i];
		if(this.curve)
			e.drawCurve(scene,rad);
		else
			e.drawLine(scene);
	}	
};

Node.prototype.update = function(scale, opacity)
{
	var label_scale = 0.1;
	var label_opacity = 0;
	if(scale.x > 1){
		label_scale = 1;
		label_opacity = 1;
	}
	this.data.draw_obj.material.opacity = opacity;
	this.data.draw_obj.scale.set( scale.x,scale.y,scale.z );
	this.data.label_object.material.opacity = label_opacity;
	this.data.label_object.scale.set( label_scale,label_scale,label_scale );

};
Node.prototype.draw = function(scene, nodes)
{

	var width = 15;
	var geometry = new THREE.BoxGeometry( width, width, width );
	//var material =  new THREE.MeshLambertMaterial( { color: this.player.pcolor });
		var material = new THREE.MeshBasicMaterial( { color: this.player.pcolor, transparent:true, opacity:0.7 } );

    var draw_obj = new THREE.Mesh( geometry, material );
	
	draw_obj.position.x = this.position.x;
	draw_obj.position.y = this.position.y;
	draw_obj.position.z = this.position.z;

	
	var textOpt = ["40pt", "", ""];
	
	if(this.player.lastName === undefined)
	{
		var label = new THREE.Label("temp label", textOpt);	
	}
	else{
		var label = new THREE.Label(this.player.fullName(), textOpt);	
	}
	
	label.position.x = draw_obj.position.x;
  	label.position.y = draw_obj.position.y +40;
	label.position.z = draw_obj.position.z - 10;
		
	this.data.label_object = label;
	this.data.label_object.scale.set(0.1,0.1,0.1);
	this.data.label_object.material.opacity = 0;
	this.data.label_object.name = 'label';
	scene.add( this.data.label_object );
	
	draw_obj.name = 'node';
	draw_obj.id   = this.id;
	this.data.draw_obj  = draw_obj;
	this.position       = draw_obj.position;
	
	//nodes.push(this.data.draw_obj);
	scene.add(this.data.draw_obj) ;
	
};
Node.prototype.addConnectedTo = function(node)
{
  if(this.connectedTo(node) === false)  //doenst already exist
  {
    this.nodesTo.push(node);
    return true;
  }
  return false;
};

Node.prototype.connectedTo = function(node)
{
  for(var i=0; i < this.nodesTo.length; i++) {
    var connectedNode = this.nodesTo[i];
    if(connectedNode.id == node.id) {
      return true;
    }
  }
  return false;
};
Node.prototype.addConnectedFrom = function(node)
{
  if(this.connectedFrom(node) === false)  //doenst already exist
  {
    this.nodesFrom.push(node);
    return true;
  }
  return false;
};

Node.prototype.connectedFrom = function(node)
{
  for(var i=0; i < this.nodesFrom.length; i++) {
    var connectedNode = this.nodesFrom[i];
    if(connectedNode.id == node.id) {
      return true;
    }
  }
  return false;
};


//Edge functions
Edge.prototype.drawLine = function(parent)
{
	var parameters = parameters || {};
	var thick = 1.4;
	if(this.isSame)
		thick = 1.8;
	material = new THREE.LineBasicMaterial({ color: this.data.color, transparent:true, opacity:0.7, linewidth: thick });
	var geometry = new THREE.Geometry();
	geometry.vertices.push(this.source.position);
	geometry.vertices.push(this.target.position);

	line = new THREE.Line( geometry, material, THREE.LinePieces );
	line.scale.x = line.scale.y = line.scale.z = 1;
	line.originalScale = 1;
	//geometries.push(line);
	this.data.draw_obj = line;
	parent.add( line );
};

Edge.prototype.update = function(scale,c)
{
	this.data.draw_obj.material.opacity = c;
	this.data.draw_obj.material.linewidth =  scale.x + 0.5;
};
Edge.prototype.drawCurve = function(parent, curveRad)
{
	var parameters = parameters || {};
	var SUBDIVISIONS = 60;
	if(curveRad == null) 
		curveRad = 0;//-0.1;
	
	var mid = new THREE.Vector3();
	mid.x = (this.target.position.x + this.source.position.x )/2 * curveRad;
	mid.y = (this.target.position.y + this.source.position.y )/2 * curveRad;
	mid.z = (this.target.position.z + this.source.position.z )/2 * curveRad;

	var thick = 1.1;
	if(this.isSame)
		thick = 1.8;
	material  = new THREE.LineBasicMaterial({ color: this.data.color, opacity: 1, linewidth: thick });
	var curve = new THREE.QuadraticBezierCurve3();
	curve.v0 = new THREE.Vector3(this.source.position.x, this.source.position.y, this.source.position.z);
	curve.v1 = mid;
	curve.v2 = new THREE.Vector3(this.target.position.x, this.target.position.y, this.target.position.z);
	
	var cp = new THREE.CurvePath();
    cp.add(curve);	
	line = new THREE.Line(cp.createPointsGeometry(SUBDIVISIONS), material);
	//geometries.add(line);
	parent.add(line);
};