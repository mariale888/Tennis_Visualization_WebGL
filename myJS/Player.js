/**
  @author Maria Alejandra Montenegro

  Implementation of a player class structure.
  Consists of info necessary for graph visualization.
**/

HOVER_C = new THREE.Color("rgb(0,223,252)");
WIN_C = new THREE.Color("#088A08");
LOSE_C  = new THREE.Color("#610B0B");
POS_W_C = new THREE.Color('#FFBF00');
NEG_W_C =new THREE.Color("#5858FA");

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

function Node(id, player, info, position, isCircle, pcolor)
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
	this.info['total'] = info[0] + 18;
	if(this.info['total'] < 35)this.info['total'] +=10;
	this.info['pos'] = info[1] + 15;
	this.info['neg'] = info[2] + 15;
	this.info['stat'] = info[3];
	this.info['opponent'] = info[4];

	this.isCircle = isCircle;
	this.pcolor = pcolor;
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
Graph.prototype.getNode_byName = function(node_name, key) 
{
	node_name = node_name.replace('_', ' ');
	
  	for(var i = 0; i < this.nodes.length; i++) {
  		if(this.nodes[i].player.fullName() == node_name && this.nodes[i].info['opponent'] == key)
  			return this.nodes[i];
  	}
  	return null;
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
	var name = null;
	for(var i = 0; i < this.nodes.length; i++)
	{
		if(this.nodes[i].data.draw_obj == obj){
			name = this.nodes[i];
			this.nodes[i].update(scale,c);
			break;
		}
	}
	
	for(var i = 0;i< this.edges.length;i++)
	{
		if(this.edges[i].source.player.fullName() == name.player.fullName() && this.edges[i].target.player.fullName() == name.player.fullName())
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
	if(scale > 1){
		label_scale = 1;
		label_opacity = 1;
		this.data.draw_obj.material.materials[0].color = HOVER_C;
		if(this.isCircle)
		{
			this.data.draw_obj.material.materials[3].color = POS_W_C;
			this.data.draw_obj.material.materials[4].color = NEG_W_C;
		}
	}
	else {
		if(this.isCircle){
			this.data.draw_obj.material.materials[0].color = this.pcolor;
			this.data.draw_obj.material.materials[3].color = this.pcolor;
			this.data.draw_obj.material.materials[4].color = this.pcolor;
		}
		else	
			this.data.draw_obj.material.materials[0].color = this.player.pcolor
	}
	this.data.draw_obj.material.opacity = opacity;
	this.data.draw_obj.scale.set( scale,scale, scale);
	this.data.label_object.material.opacity = label_opacity;
	this.data.label_object.scale.set( label_scale,label_scale,label_scale );
	
};
Node.prototype.draw = function(scene, nodes){
	if(this.isCircle)
		this.drawCircle(scene, nodes);
	else
		this.drawCube(scene, nodes);
}
Node.prototype.drawCircle = function(scene, nodes)
{
	var geometry = new THREE.Geometry();
	var materials =[];
	materials.push(new THREE.MeshBasicMaterial( { color: this.pcolor, transparent:true, opacity:0.7 } ) );
	materials.push(new THREE.MeshBasicMaterial( { color: this.pcolor , transparent:true, opacity:0.7 } ) );
	materials.push(new THREE.MeshBasicMaterial( { color: this.pcolor , transparent:true, opacity:0.7 } ) );
	materials.push(new THREE.MeshBasicMaterial( { color: this.pcolor , transparent:true, opacity:0.7 } ) );
	materials.push(new THREE.MeshBasicMaterial( { color: this.pcolor , transparent:true, opacity:0.7 } ) );

	//-----------
	//Geometry:
	/*
materials.push(new THREE.MeshBasicMaterial( { color: this.pcolor, transparent:true, opacity:0.7 } ) );
	materials.push(new THREE.MeshBasicMaterial( { color: WIN_C , transparent:true, opacity:0.7 } ) );
	materials.push(new THREE.MeshBasicMaterial( { color: LOSE_C , transparent:true, opacity:0.7 } ) );
	materials.push(new THREE.MeshBasicMaterial( { color: POS_W_C , transparent:true, opacity:0.7 } ) );
	materials.push(new THREE.MeshBasicMaterial( { color: NEG_W_C , transparent:true, opacity:0.7 } ) );


	*/
	//-----------
	var main_min = 12;
	var pos_e = this.info['pos'] - main_min;
	var neg_e = this.info['neg'] - main_min;
	var stats_max = main_min;//Math.max(this.info['pos'], main_min);
	
	if(this.info['pos'] == 0 && this.info["neg"] == 0)
		stats_max = this.info['total'] - main_min;
	
	// pos greater
	else if(this.info['pos'] > this.info['neg'])
	{
		neg_e = this.info['neg'] - main_min;
		pos_e = this.info['pos'] - this.info['neg'];
		stats_max = this.info['total'] - this.info['pos'];	
	} //neg
	else if(this.info['pos'] < this.info['neg'])
	{
		pos_e = this.info['pos'] - main_min;
		neg_e = this.info['neg'] - this.info['pos'];
		stats_max = this.info['total'] - this.info['neg'] ;
	} //equal
	else
		stats_max = this.info['total'] - this.info['pos']; 
	
	// when stats are to close, overlap of mesh covers them so tweek
	if(stats_max < 15 )
	{
		if(this.info["total"] > 40 && this.info["total"] < 100){
			stats_max = 25;
			this.info["total"] = this.info["total"] + 25;
		}
		else if(this.info["total"] > 100)
		{
			stats_max += 80;
			this.info["total"] = this.info["total"] + 80;
		}
	}
	else if(stats_max > 30) stats_max -= 15;
	else if(stats_max > 15) stats_max -= 5;

	// main player
	var object1   = new THREE.Mesh( new THREE.TorusGeometry( this.info['total'],  stats_max, 20,20));
	geometry.merge(object1.geometry, object1.matrix);
	
	// win/ lose
	var w_l = 1;
	if(this.info['stat'] == 'l') w_l = 2;
	var object2   = new THREE.Mesh( new THREE.TorusGeometry( main_min, main_min,5,5));
	for ( var face in object2.geometry.faces ) 
  		object2.geometry.faces[ face ].materialIndex = w_l;
	geometry.merge(object2.geometry, object2.matrix);
	
	// pos words:
	if(this.info['pos'] != 0 && pos_e !=0){
		var object3   = new THREE.Mesh( new THREE.TorusGeometry(this.info['pos'] , pos_e, 12,12));
		for ( var face in object3.geometry.faces ) 
	  		object3.geometry.faces[ face ].materialIndex = 3;
		geometry.merge(object3.geometry, object3.matrix);
	}
	// neg words:
	if(this.info['neg'] != 0 && neg_e !=0){
		var object4   = new THREE.Mesh( new THREE.TorusGeometry(this.info['neg'] , neg_e, 12, 12));
		for ( var face in object4.geometry.faces ) 
	  		object4.geometry.faces[ face ].materialIndex = 4;
		geometry.merge(object4.geometry, object4.matrix);
	}

	//------
	// creating final mesh
    var draw_obj = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
	draw_obj.position.x = this.position.x;
	draw_obj.position.y = this.position.y;
	draw_obj.position.z = this.position.z;

	
	var textOpt = ["30pt", "", ""];
	if(this.player.lastName === undefined)
	{
		var label = new THREE.Label("temp label", textOpt);	
	}
	else{
		var label = new THREE.Label(this.player.fullName(), textOpt);	
	}
	
	label.position.x = draw_obj.position.x;
  	label.position.y = draw_obj.position.y + 40;
	label.position.z = draw_obj.position.z - 10;
		
	this.data.label_object = label;
	this.data.label_object.scale.set(0.1,0.1,0.1);
	this.data.label_object.material.opacity = 0;
	this.data.label_object.name = 'label';
	//scene.add( this.data.label_object );
	
	draw_obj.name = 'node';
	draw_obj.id   = this.id;
	this.data.draw_obj  = draw_obj;
	this.position       = draw_obj.position;
	
	//nodes.push(this.data.draw_obj);
	scene.add(this.data.draw_obj) ;
}
Node.prototype.drawCube = function(scene, nodes)
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
  	label.position.y = draw_obj.position.y + 40;
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
	var thick = 1.2;
	if(this.isSame)
		thick = 1.1;
	material = new THREE.LineBasicMaterial({ color: this.data.color, transparent:true, opacity:0.7, linewidth: thick });
	var geometry = new THREE.Geometry();
	geometry.vertices.push(this.source.position);
	geometry.vertices.push(this.target.position);

	line = new THREE.Line( geometry, material, THREE.LinePieces );
	line.scale.x = line.scale.y = line.scale.z = 1;
	line.originalScale = 1;
	//geometries.push(line);
	this.data.draw_obj = line;
	if(!this.isSame)
		parent.add( line );
};

Edge.prototype.update = function(scale,c)
{
	if(scale.x > 1)scale.x += 1.5;
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

	var thick = 1.3;
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