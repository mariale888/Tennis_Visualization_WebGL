/**
  @author Maria Alejandra Montenegro

  Implementation of the main canvas
  This consists of the axis and its labels.
  It also ioncludes the different colors of each node
**/

function ColorNode(total)
{
	this.total = total;
	this.frequency = 2*Math.PI/this.total;
	this.frequency_hsv = 360/ (this.total - 1);

	this.center = 128;
	this.width = 127;
}

ColorNode.prototype.map = function ( num, in_min , in_max , out_min , out_max ) {
  return ( num - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
}
ColorNode.prototype.getColorChroma = function(i, color1, color2)
{
	var index = this.map(i, 0,this.total *0.25,0,1);
	//console.log(index);
	var color = chroma.interpolate(color1, color2,index).css();
	return color;
}
// Function to get a unique random color from total batch
ColorNode.prototype.getRGBColor = function(i, isHSV)
{
	var red   = Math.ceil(Math.sin(this.frequency * i + 0) * this.width + this.center);
	var green = Math.ceil(Math.sin(this.frequency * i + 2) * this.width + this.center);
	var blue  = Math.ceil(Math.sin(this.frequency * i + 4) * this.width + this.center);
	var color = "rgb(" + red + "," + green + "," + blue+")";
	if(isHSV == true) {
		color = this.hsvToRgb(i * this.frequency_hsv, Math.random()*150 + 50, Math.random()*50 + 50);
		color = "rgb(" + color[0] +","+color[1] +"," + color[2]+")";
	}
	return color;
}

// Function that converts from hsv to rgb
ColorNode.prototype.hsvToRgb = function (h, s, v) {
	var r, g, b;
	var i;
	var f, p, q, t;
 
	// Make sure our arguments stay in-range
	h = Math.max(0, Math.min(360, h));
	s = Math.max(0, Math.min(100, s));
	v = Math.max(0, Math.min(100, v));
 
	// We accept saturation and value arguments from 0 to 100 because that's
	// how Photoshop represents those values. Internally, however, the
	// saturation and value are calculated from a range of 0 to 1. We make
	// That conversion here.
	s /= 100;
	v /= 100;
 
	if(s == 0) {
		// Achromatic (grey)
		r = g = b = v;
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
 
	h /= 60; // sector 0 to 5
	i = Math.floor(h);
	f = h - i; // factorial part of h
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));
 
	switch(i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
 
		case 1:
			r = q;
			g = v;
			b = p;
			break;
 
		case 2:
			r = p;
			g = v;
			b = t;
			break;
 
		case 3:
			r = p;
			g = q;
			b = v;
			break;
 
		case 4:
			r = t;
			g = p;
			b = v;
			break;
 
		default: // case 5:
			r = v;
			g = p;
			b = q;
	}
 
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/*----------------------------------
-----------------------------------*/

function CanvasAxis(numEvents, initX, initY, initZ, isCircle)
{
	this.numEvents = numEvents;
	this.initX = initX;
	this.initY = initY;
	this.initZ = initZ;
	this.eventPos = [];
	this.isCircle = isCircle;
	this.counter = 0;
}

//Function that makes all axes
CanvasAxis.prototype.buildAxes= function( length, dates ) {
   var axes = new THREE.Object3D();

   // main coordinate axis
    axes.add( this.buildAxis( new THREE.Vector3( this.initX, this.initY, this.initZ ), new THREE.Vector3( length, this.initY, this.initZ ), 0x000000, false ) ); // +X
    axes.add( this.buildAxis( new THREE.Vector3( this.initX, this.initY, this.initZ ), new THREE.Vector3( -length, this.initY, this.initZ ), 0x000000, true) ); // -X
    axes.add( this.buildAxis( new THREE.Vector3( this.initX, this.initY, this.initZ ), new THREE.Vector3( this.initX, length, this.initZ ), 0x000000, false ) ); // +Y
    axes.add( this.buildAxis( new THREE.Vector3( this.initX, this.initY, this.initZ ), new THREE.Vector3( this.initX, -length, this.initZ ), 0x000000, true ) ); // -Y
    axes.add( this.buildAxis( new THREE.Vector3( this.initX, this.initY, this.initZ ), new THREE.Vector3( this.initX, this.initY, length ), 0x000000, false ) ); // +Z
    axes.add( this.buildAxis( new THREE.Vector3( this.initX, this.initY, this.initZ ), new THREE.Vector3( this.initX, this.initY, -length ), 0x000000, true ) ); // -Z

    //-------------
    // Event axis and labels
    //--------------

    //X-Axis 
    var len = 250;
    if(this.isCircle) 
    	len = 700;

    var init = this.initX;
    var j=1;
    var past = init;
    for(var i = 1; i <= this.numEvents;i++)
    {
    	if(!this.isCircle) {
	    	if(i ==2)
	    	{
	    		init = init + len*(j-1);
	    		len = 230;
	    		j = 1;
	    	}
	    	if(i == 4)
	    	{
	    		init = init + len*(j-1);
	    		len = 150;
	    		j = 1;
	    	}
	    	if(i == 7)
	    	{
	    		init = init + len*(j-1);
	    		len = 95;
	    		j = 1;
	    	}
	    }
	    else {
	    	//the FINAL
	    	if(i == 13)
	    	{
	    		init = init + len*(j-1);
	    		len = 1200;
	    		j = 1;
	    	}
	    }
    	var x = init + len*j;
    	// X Label Axis
    	var textOpt = ["30ox","",""];
    	var delta = 95;
    	if(this.isCircle) {
	    	textOpt = ["80pt", "", ""];
	    	delta = 200;
	    }
	    var label = new THREE.Label(dates[i-1], textOpt);	
	    label.position.x =  past +  Math.abs(x - past)/2;
		label.position.y = this.initY - delta;
		label.position.z = this.initZ;
		label.rotation.z = 0.5;
		past = x;
		axes.add(label);
		
		//-----

   		axes.add( this.buildAxis( new THREE.Vector3( x, this.initY, this.initZ ), new THREE.Vector3( x, 580, this.initZ ), 0x000000, true ) ); // +X
    	this.eventPos.push( new THREE.Vector3( x, this.initY, this.initZ ));
    	j++;
    }

    // Y Label Axis
    if(!this.isCircle) {
	    var num = 15;
	    var len = 60;
	    for(var i = 1; i <= 100;i++)
	    {	
	    	var y = this.initY + len * i;
	    	// label
	    	
		    var textOpt = ["30pt", "", ""];
		    var label = new THREE.Label(num, textOpt);	
		    label.position.x =  this.initX - 100;
			label.position.y = y;
			label.position.z = this.initZ;
			past = x;
			axes.add(label);
			num = num + 15;
			len = 80;
			
			//-----
	   		axes.add( this.buildAxis( new THREE.Vector3( this.initX, y, this.initZ ), new THREE.Vector3( this.initX - 100, y, this.initZ ), 0x000000, true ) ); // +X
	    	this.eventPos.push( new THREE.Vector3( this.initX, y, this.initZ ));
	    }
	}

    return axes;
}

//Function to draw created axiss
CanvasAxis.prototype.buildAxis = function( src, dst, colorHex, dashed ) {
    var geom = new THREE.Geometry(),
    mat; 

    if(dashed) {
            mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
    } else {
            mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
    }

    geom.vertices.push( src.clone() );
    geom.vertices.push( dst.clone() );
    geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

    var axis = new THREE.Line( geom, mat, THREE.LinePieces );

    return axis;

}
function randomIntFromInterval(min,max)
{
	console.log(min + " "+ max);
    return Math.floor(Math.random()*(max-min+1)+min);
}
// Function that returns a position depending on info of match
// index: cur day // cur: cur game // total: total games that day // info:info game
CanvasAxis.prototype.getPos = function(index, cur, total, info, y_player)
{
	var pos = new THREE.Vector3();
	var min = this.initX;
	var max = this.eventPos[index].x;
	if(index > 0)
		min = this.eventPos[index-1].x;
	var totalDis = Math.abs(max - min);

	//old vis with lines
	if(!this.isCircle) {
		pos.x = min + (totalDis/total)*cur;
		pos.y = this.eventPos[index].y + 80 +  info[0]*9;
		
		pos.z = this.eventPos[index].z + 200;
		if(info[3] == 'l')
			pos.z = this.eventPos[index].z -100;
	}
	//new vis
	else {
		var delta = -150;
		if(index == 12) delta = -350;   // the FINAL
		if(info[3] == 'w'){
			delta *= -1;
		}
		this.counter +=1;
		pos.x = (min + max) * 0.5 + delta;

		delta = 110;
		if(index > 2)delta = 150;

		if(this.counter%2 == 0)
			pos.y = 60 + (this.counter) * delta;
		else
			pos.y = 60 - (this.counter) * delta;
		//pos.y = this.eventPos[index].y + (total - cur) * 15;
		if(y_player != null)
			pos.y = y_player;
	
	}
	return pos;
}
