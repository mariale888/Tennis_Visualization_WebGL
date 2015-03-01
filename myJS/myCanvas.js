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

// Function to get a unique random color from total batch
ColorNode.prototype.getRGBColor = function(i, isHSV)
{
	var red   = Math.ceil(Math.sin(this.frequency * i + 0) * this.width + this.center);
	var green = Math.ceil(Math.sin(this.frequency * i + 2) * this.width + this.center);
	var blue  = Math.ceil(Math.sin(this.frequency * i + 4) * this.width + this.center);
	var color = "rgb(" + red + "," + green + "," + blue+")";
	if(isHSV == true) {
		color = this.hsvToRgb(i * this.frequency_hsv, Math.random()*100 + 50, Math.random()*100 + 50);
		color = "rgb(" + color[0] +","+color[1] +"," + color[2]+")";
	}
	console.log(color);		
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