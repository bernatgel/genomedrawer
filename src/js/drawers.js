/*
 * genomedrawer.js version 0.0.1
 *
 * Copyright (c) 2011 Bernat Gel
 * Licensed under the MIT license.
 */

/**Drawers and colorers collection for GenDraw
@param el the element to transform into the drawing canvas
@param config the initial config of the returned GenDraw
*/
var Drawers = (function() {

  //CONSTANTS
  var PAL_QUAL1 = [ //Qualitative palette from color brewer
    "#8DD3C7",
    "#FFFFB3",
    "#BEBADA",
    "#FB8072",
    "#80B1D3",
    "#FDB462",
    "#B3DE69",
    "#FCCDE5",
    "#D9D9D9",
    "#BC80BD",
    "#CCEBC5",
    "#FFED6F"
    ];
   var PAL_SEQ_ORNG = [ //Sequential orange palette from color brewer
    "#FFFFE5",
    "#FFF7BC",
    "#FEE391",
    "#FEC44F",
    "#FE9929",
    "#EC7014",
    "#CC4C02",
    "#8C2D04"
    ];


      
  //Private methods
  function d2h(d) {return d.toString(16);}
  function h2d(h) {return parseInt(h,16);} 
  
  var dark = function(c) {
    c =h2d(c)-h2d(66);
    if(c<0) c=0;
    c = d2h(c);    
    if(c.length==1) c= "0"+c;
    return c;
  }
  
  /**Receives a color in hex and returns a darker color*/
  var darker = function(color) { 
    var r = dark(color.substr(1,2));
    var g = dark(color.substr(3,2));
    var b = dark(color.substr(5,2));
    return "#"+r+g+b;
  }
  
  
  /**Compute Bumping. Computes the feature bumping so no pair of features on the same track will overlap.
   */
  var computeBumping = function(data) {
      var channels = [[]];
      var bumping = {
	  channels: [],
	  nchannels: 1
      }
      
      var colision = function(f, nchan) {
	var d = channels[nchan];
	for(var i=0, l=d.length; i<l; ++i) {
	  var f2=d[i];
	  if(f2.start<f.end && f2.end>f.start) return true;
	}
	return false;	
      }
      
      for(var i=0, l=data.length; i<l; ++i) {
	var nchan = 0;
	while(colision(data[i], nchan)) {
	  nchan++;
	  if(!channels[nchan]) channels[nchan] = [];
	}
	channels[nchan].push(data[i]);
	bumping.channels.push(nchan);
      }
      bumping.nchannels = channels.length;
      return bumping;
  }

  //Public Interface
  var self = {
    //Colorer
      getConstantColorer: function(color) {
	  return {
	      foreground: function() {return color;},
	      background: function() {return color;}
	  };
      },
      typeColorer: function(config) { 
        var palette = (config && config.palette)?config.palette:PAL_QUAL1; //What if the palette is just a name?
	var colors = (config && config.colors)?config.colors:{};
	var lastColor = -1;
	var getNextColor = function() {
	    lastColor++;
	    if(lastColor>=palette.length) lastColor=0;
	    return palette[lastColor];
	}
	
	var getColor = function(f) {
	    if(!f || !f.type) {
		return "#CCCCCC"; //if there's no type info, return a boring gray
	    }
	    if(!colors[f.type]) {
		colors[f.type]=getNextColor();
	    }
	    return colors[f.type];
	}
	
	return {
	    background: getColor,
	    foreground: function(f) { return "#000000";}
	}
      },
      sequentialColorer: function() {
	  var palette = PAL_QUAL1; //TODO: Specify on params
	  var lastColor = -1;
	  
	  var getNextColor = function() {
	    lastColor++;
	    if(lastColor>=palette.length) lastColor=0;
	    return palette[lastColor];
	  }
	  return {
	    background: getNextColor,
	    foreground: function(f) { return darker(palette[lastColor]);}
	}
      },
      /**geneColorer
       * returns "empty" if the feature is an UTR
       */
      geneColorer: function(config) {
	  var color = (config && config.color)?config.color:"#AA44AA";
	  
	  return {
	    background: function(f) {
		  if(f.type && (f.type=="utr"||f.type=="UTR")) {
		    return "none";
		  } else {
		    return color;
		  }
	    },
	    foreground: function(f) {return "#000000";}
	}
      },
      
      
      /**FeatureDrawers
       * All FeatureDrawers must have the same interface: 
       * function(feature, line_position, line_height, colorer, gendraw)
       * 
      */
      /**Draws squared features. This is actually a copy of the default feature drawer on genDraw.js
       *        
       */
      squaredFeature: function(f, line_position, line_height, colorer, gendraw) {
	var b2p = gendraw.Utils.base2pixel;
	var paper = gendraw.getPaper();
	var x = b2p(f.start)
	var y=  line_position - line_height; //line_position is the bottom of the track and we need y to be the top
	if(f.end<f.start) {var a=f.end; f.end=f.start;f.start=a;} 
	var w =  b2p(f.end)-b2p(f.start);
	if(w<1) w=1;
	var h = line_height;
	var bg = colorer.background(f);
	var fg = colorer.foreground(f);
	var label = (f.label!=undefined)?f.label:((f.id!=undefined)?f.id:undefined);
	
	    
	var c = paper.rect(x, y, w, h);      
	c.attr({fill: bg, stroke: fg})
	if(label) {
	    c.attr({title: "test"});
	}
	if(f.link) {
	  c.attr({cursor: 'pointer'});
	  c.click(function() {
	    var newWindow = window.open(f.link, '_blank');
	  });
	}
      },
      
      /**GeneFeature
       * 
       * Draws features in a gene form. With thick exons, thin introns and empty UTRs
       * 
       */
       geneFeature: function(f, line_position, line_height, colorer, gendraw) {
	  var b2p = gendraw.Utils.base2pixel;
	  var paper = gendraw.getPaper();
	  var x = b2p(f.start)
	  var y = (f.type && f.type=="intron")?
		      line_position - line_height/2.0:
		      line_position - line_height; //line_position is the bottom of the track and we need y to be the top
	  var w =  b2p(f.end)-b2p(f.start);
	  if(w<1) w=1;
	  var h = line_height; //line_position is the bottom of the track and we need y to be the top
	  var bg = colorer.background(f);
	  var fg = colorer.foreground(f);
	  var label = (f.label!=undefined)?f.label:((f.id!=undefined)?f.id:undefined);
	  
	  var c;
	  if(f.type && f.type=="intron") { //draw an intron
	    c=paper.path("M"+x+" "+y+"l"+w/2.0+" -"+line_height/4.0+"l"+w/2.0+" "+line_height/4.0);
	  } else { //draw anything else
	    c = paper.rect(x, y, w, h);      
	    c.attr({fill: bg, stroke: fg})
	  }
	  if(label) {
	    c.attr({title: label});
	  }
	  if(f.link) {
	    c.attr({cursor: 'pointer'});
	    c.click(function() {
	      var newWindow = window.open(f.link, '_blank');
	    });
	  }
	  
       },
      
      
      //TrackDrawers
      /**This track drawer draws the genes as expected (exons, introns, etc...)
       * This drawer expects a track with elements of three different types: exons, introns and UTR
       */
      geneDrawer: function(nline, track, genedraw) {
	var pos_line = genedraw.Utils.linePosition(nline, true);
	var neg_line = genedraw.Utils.linePosition(nline, false); //Could be the same if not doubleStranded
	var line_height = genedraw.Utils.lineHeight();
	
	var tconf = track.config();
    
	var featureDrawer = self.geneFeature;
        var featureColorer = (track.config().colorer != undefined)?track.config().colorer:self.geneColorer();
    
	var d = track.data();
    
	for(var i = 0, l=d.length; i<l; ++i) {
	  var f = d[i];
	  var lpos = (f.strand != undefined && !f.strand)?neg_line:pos_line;
	  
	  featureDrawer(f, lpos, line_height, featureColorer, genedraw);
	}
      },
      
      /**This trackDrawer draws the features as standard independent features using the track defined drawer and colorer.
       * It implements bumping.
       */
      independentFeatureDrawer: function(nline, track, genedraw) {
	var pos_line = genedraw.Utils.linePosition(nline, true);
	var neg_line = genedraw.Utils.linePosition(nline, false); //Could be the same if not doubleStranded
	var line_height = genedraw.Utils.lineHeight();
	
	var tconf = track.config();
    
	var featureDrawer = (tconf.featureDrawer != undefined)?tconf.featureDrawer:self.squaredFeature;
        var featureColorer = (tconf.colorer != undefined)?tconf.colorer:self.geneColorer();
    
	var d = track.data();
	
	var bumping;
	
	if(tconf.bumping) {
	  var bumping = computeBumping(d);
	  
	} else {
	  bumping.nchannels = 1;
	  bumping.channels = [];
	  for(var i=0, l=d.length; i<l; ++i) bumping.channels.push(0);
	}
    
	var channel_height = line_height/bumping.nchannels;
    
	for(var i = 0, l=d.length; i<l; ++i) {
	  var f = d[i];
	  var vert_pos;
	  if(f.strand != undefined && !f.strand) {
	    vert_pos = neg_line-line_height+bumping.channels[i]*channel_height;
	  } else {
	    vert_pos = pos_line-bumping.channels[i]*channel_height;
	  }
	  
	  
	  
	  featureDrawer(f, vert_pos, channel_height*0.95, featureColorer, genedraw);
	}
      }
   
  };

  //initialization code

     
  return self;
}());


