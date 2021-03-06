/*
 * genomedrawer.js version 0.0.1
 *
 * Copyright (c) 2011 Bernat Gel
 * Licensed under the MIT license.
 */


/**
 * genomedrawer is a small track based feature drawer to create images similar to those on genome browsers such as Ensembl and UCSC Genome Browser.

      Main ideas: 
	  Based on tracks.
	  Completely independent tracks.
	  Per track configuration.
	  Pluggable and customizable drawers.
	  

	API:
		* Creator
		* config (get/set the main config)
		* addTrack
		* removeTrack
		* trackData (get/set track DATA)
		* trackConfig (get/set track Config)
		* redraw (redraw all tracks. Can set the range to draw).
	

	Questions: 
	    Who decides the trackheight? 
	    How about the order of the tracks? 





	genomedrawer Config Object:
	{
		width: Number. the width of the canvas (in pixels). Default 300.
		height: the height of the canvas (in pixels). Default 300.
		margin:  Number. The size of the margin to be left at each side of the drawing.
		multiline: true/false. True to draw each track on a different line, false to draw them all on tha same line. Default TRUE.
		interlineSpace: Number. The spaec between tracks (in pixels). Default 2.
		doubleStranded: true/false. True to draw the scale at the center with positive strand features on one side and negative on the other. Default TRUE.
		showSequenceLabel: true/false. True to show the label of the sequence along to the scale. Default TRUE.
		showTrackLabels: true/false. True to show the labels of the tracks. Default TRUE.
		sequences: Object. An Object (as in HashTable) of sequence config objects with the id of the sequence as key and for each sequence:
			{
				id: the identifier of the senquence (string),
				label: the label to be shown as identifier of the sequence
			}
		
	}


	TrackData
	Track data is an array of features. Each feature has a minimum set of parameters:
	  start,
	  end,
	  
	Optional parameters:
	  strand,
	  type,
	  score,
	  
	  
	And any other parameters needed for the desired drawer.
	  
	  




*/


/**Factory returning genomedrawer objects. 
@param el the element to transform into the drawing canvas
@param config the initial config of the returned genomedrawer
*/
var GenomeDrawer = function(el, original_config) {

  //CONSTANTS
  var DEFAULT_CANVAS_WIDTH = 600,
      DEFAULT_CANVAS_HEIGHT = 150,
      DEFAULT_MARGIN = 10,
      DEFAULT_INTERLINE_SPACE = 4,
      SCALE_HEIGHT = 40;


  //Check parameters
  if(el === undefined) { //if no element was given to the constructor, nothing can be made.
	return undefined;
  }
  
//Utility Methods  #################################################################################################
  var definedOrDefault = function(value, default_value) {
	return (value !== undefined)?value:default_value;
  };


  var applyConfig = function(conf) {

      if(conf === undefined || typeof conf !== "object") {
	conf={};
      }

      var config = {
	    canvasWidth: definedOrDefault(conf.canvasWidth,DEFAULT_CANVAS_WIDTH),
	    canvasHeight: definedOrDefault(conf.canvasHeight,DEFAULT_CANVAS_HEIGHT),
	    margin: definedOrDefault(conf.margin, DEFAULT_MARGIN),
	    multiline: definedOrDefault(conf.multiline, true),
	    doubleStranded: definedOrDefault(conf.doubleStranded, true),
	    drawScale:  definedOrDefault(conf.drawScale,true),
	    showSequenceLabel: definedOrDefault(conf.showSequenceLabel, true),
	    showTrackLabels: definedOrDefault(conf.showTrackLabels, true),
	    sequences: definedOrDefault(conf.sequences, {}),
	    interlineSpace: definedOrDefault(conf.interlineSpace, DEFAULT_INTERLINE_SPACE)
      }
      //TODO: restart any caching based on config (line_pos, etc...)
      return config;
  };

//END Utility Methods  #################################################################################################
  
//INITIALIZATION #######################################################################################################
  //Apply the config object received on creation before setting up anything else
  var config = applyConfig(original_config);

  //Private Attributes

  var	current_range = "auto",
	tracks = []; //an array of track objects //TODO: If track ha methods, make it a module
	

  //INITIALIZE the Raphael canvas object
  //references
  //check if its a jquery object and retrieve its underlying DOM element
  if(typeof el.addClass == "function") el = el.get()[0];
  var element = el;
  
  var paper = Raphael(element, config.canvasWidth, config.canvasHeight);  //The canvas, as returned by raphael 
  

    //Attributes used only when drawing
    var bpp,
	first_base,
	last_base;

  
  
  //Private Methods 

  //Return the line height for each track line.
  //TODO: Per les tracks que tinguin una height forçada, fer servir aquesta. La resta d'espai, repartir-lo entre la resta de línies.
  //O bé permetre línies amb mida i posició absoluta. que no contin en els calculs. més control per part de l'usuari.
  var lineHeight = function() { 
	//if(config.doubleStranded) {
	  
		return (config.canvasHeight - 2*config.margin - ((config.drawScale)?SCALE_HEIGHT:0))/((numLines()!==0)?numLines():1);
	//} else {
	//	return (config.canvasHeight - 2*config.margin - SCALE_HEIGHT)/(numLines()-1);
	//}
  }

  var numLines = function() {
	var nt = (config.multiline)?numTracks():1;
	return ((config.doubleStranded)?nt*2:nt);
  }

  var numTracks = function() {
	return tracks.length;
  }

  /**Returns the bottom height of line num_line. if positive, on top of the scale, if no positive, below.
	if num_line = 0, it returns the bottom for the scale space. 
	The scale is drawn on line 0 and the data lines start at +/-1
  */
  //TODO: Add caching so the linePosition is not computed every time its needed.
  var linePosition = function(num_line, positive) {
	if(positive == "undefined") positive = true;
	var line_height = lineHeight();
	if(config.multiline) {
	    if(config.doubleStranded) {
		    if(num_line===0) return (config.canvasHeight + SCALE_HEIGHT)/2;

		    var middle = config.canvasHeight/2;

		    if(positive) {
		      return middle-SCALE_HEIGHT/2-(line_height+config.interlineSpace)*(num_line-1);
		    } else {
		      return middle+SCALE_HEIGHT/2+(line_height+config.interlineSpace)*(num_line-1)+line_height; //The last line heigh is because we are returning the position of the bottom of the track
		    }
	    } else { //if its one stranded
		    var bottom = config.canvasHeight - config.margin;
		    if(num_line === 0) return bottom;
		    else return bottom-SCALE_HEIGHT-(line_height+config.interlineSpace)*(num_line-1);	
	    }
	} else { //if it's not multiline
	    if(config.doubleStranded) {
		if(num_line===0) return (config.canvasHeight + SCALE_HEIGHT)/2;
		var middle = config.canvasHeight/2;
		 if(positive) {
		      return middle-SCALE_HEIGHT/2;
		 } else {
		      return middle+SCALE_HEIGHT/2+line_height; //The last line heigh is because we are returning the position of the bottom of the track
		 }
	    } else {
		 var bottom = config.canvasHeight-config.margin;
		 if(num_line === 0) return bottom;
		 else return bottom-SCALE_HEIGHT;
	    }
	}
  }

  var setRange = function(range) {
     console.log("setting range: "+range);
     if(range !== "undefined") {
	if(typeof range == "string" && range == "auto") {
	  current_range = "auto";
	} else if(typeof range == "object" 
		  && range.start !== "undefined" && typeof range.start == "number"
		  && range.end !== "undefined" && typeof range.end == "number") {
	  current_range = range;
	}; //else, leave it as it was.
     }
     if(current_range == "undefined") {//if afterall, the current range is undefined, set it to auto.
	current_range = "auto";
     }
     console.log("current rage set to: "+current_range);
  };

  /**Computes the range needed to show all the features in the drawer.
  */
  var computeAutoRange = function() {
      if(tracks.length==0) {
	first_base = 1;
	last_base = 1000;
      } 
      //TODO: Could return undefined if no data!!!
      var range = tracks[0].getRange();
      var min = range.start,
	  max = range.end;
	  
      for(var i=1; i<tracks.length; ++i) {
	  var r = tracks[i].getRange();
	  if(r!=undefined) {
	    if(r.start < min) min = r.start;
	    if(r.end > max) max = r.end;	
	  }
      }
      
      first_base = min;
      last_base = max;
  
  };

  var updateBpp = function() {
    bpp = (last_base - first_base+1)/(config.canvasWidth-2*config.margin);
  };


    //DRAWING
    /**Redraws all the tracks to paper, showing the current_range

    */
    var redrawAllTracks = function() {
	paper.clear();
	//Get first_base and last_base
	if(current_range === "auto") {
	    computeAutoRange();
	} else {
	    first_base = current_range.start;
	    last_base = current_range.end;
	}
	console.log("Range is: "+first_base+" - "+last_base);
	//Compute bpp
	updateBpp();
	
	
	if(config.drawScale) {
	  drawScale();
	}

	//Draw decorations: are sequence name, etc... needed?
    
	//For every track
	
	for(var ntrack = 0; ntrack < tracks.length; ntrack++) {
	  var track = tracks[ntrack];
	  //get it's drawer.
	  //track.config.drawer...
	  //var drawer = "standard"; //get it from the track config!
	  var drawer = (track.config().trackDrawer != undefined)?track.config().trackDrawer:"standard";
	  
	  //draw the track
	  if(drawer ==="standard") {
	      //drawTrackIndependentFeatures(tracks[ntrack], linePosition(ntrack+1, true), linePosition(ntrack+1, false), self);  
	      Drawers.geneDrawer(ntrack+1, track, self);
	  } else {
	      drawer(ntrack+1, track, self);
	      
	  }
	  
	}
	
    };
    
    
    
    var drawScale = function() {
      console.log("Drawing Scale");
      var r = last_base - first_base+1;
    
      var tick = Math.pow(10,Math.floor(log10((r/5.0))));
      if(r/tick>10) tick = Math.pow(10,Math.floor(log10((r/2.0))));
      var smallTick = tick/5.0;

      var firstTick = Math.ceil(first_base/smallTick)*smallTick;
      
      var m = linePosition(0)-SCALE_HEIGHT/2;
      var start = config.margin;
      var stop = config.canvasWidth-config.margin;
      var line_height = lineHeight();
      //var btu = m-line_height/2.0, btd=m+line_height/2.0;
      //var stu = m-line_height/4.0, std=m+line_height/4.0;
      var btu = m-SCALE_HEIGHT/8.0, btd=m+SCALE_HEIGHT/8.0;
      var stu = m-SCALE_HEIGHT/12.0, std=m+SCALE_HEIGHT/12.0;

      if(false) { //seq_label) {
	  var lab = paper.text(start-5, m, seq_label);
	  lab.attr({'text-anchor': 'end'});
	  lab.translate(0, -lab.getBBox().height); //vertically center the text
	  
      }


      var l = paper.path("M"+start+" "+m+"L"+stop+" "+m);

      var b = firstTick;
      while(b<last_base) {
	var p = b2p(b);
	if(b%tick == 0) {
	  var l = paper.path("M"+p+" "+btu+"L"+p+" "+btd);
	  var t = paper.text(p, btd-5, b);
	  t.attr({'text-anchor': 'middle'});
	} else {
	  var l = paper.path("M"+p+" "+stu+"L"+p+" "+std);
	}
	b += smallTick;
      }    


   }
    
    


//////////FI EDITAT

//   var styles = {
//       'feature': {shape: 'rectangle', bg: '#CCCCCC', brd: '#666666'}
//   };
 
  
  /**Definition of a plain boring colorer to fall back to*/
  var default_colorer =  {
	  foreground: function(f) {
			  return "#444444";
	  },
	  background: function(f) {
			  return "#DDDDDD";
	  }
    };

  //Private Methods
  /**Standard track drawer that draws each feature independently
   * 
   */
  var drawTrackIndependentFeatures = function(nline, track) {
   var pos_line = linePosition(nline, true);
   var neg_line = linePosition(nline, false); //Could be the same if not doubleStranded
    
    var tconf = track.config();
    
    //TODO: Get the feature drawer function
    var featureDrawer = drawSquaredFeature;
    

    var featureColorer = (track.config().colorer != undefined)?track.config().colorer:default_colorer;
    
    //Drawers.sequentialColorer();
    

    
    var d = track.data();
    
    var line_height = lineHeight();
    
    for(var i = 0, l=d.length; i<l; ++i) {
	var f = d[i];
	var lpos = (f.strand != undefined && !f.strand)?neg_line:pos_line;
	
	featureDrawer(f, lpos, line_height, featureColorer);
    }
    
  }
  
  
  var drawSquaredFeature = function(f, line_position, line_height, colorer) {
      var x = b2p(f.start)
      var y=  line_position - line_height; //line_position is the bottom of the track and we need y to be the top
      if(f.end<f.start) {var a=f.end; f.end=f.start;f.start=a;} //TODO: Do we want to draw features with inverted ends?
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
          

  };
/*
var drawFeature = function(f, style) {
      var str = (f.strand==1)?'p':'n';
      var x = b2p(f.start)
      var y=  lines[str+f.line];
      var w =  b2p(f.end)-b2p(f.start);
      var h = line_height;
      var c = paper.rect(x, y, w, h); //TODO: Afegir els drawers no rectangles
      c.attr({fill: style.bg, stroke: style.brd, title: f.label})
      if(f.link) {
	c.attr({cursor: 'pointer'});
	c.click(function() {
	  var newWindow = window.open(f.link, '_blank');
	});
      }
          

  };
*/

//   var getRange = function(drw_data) {
//       if(auto_range) {
// 	  if(drw_data.length==0) return {start: 0, end: 0};
// 	  var min = drw_data[0].start, max = drw_data[0].end;
// 	  for(var i=1, l=drw_data.length; i<l; i++) {
// 	      if(drw_data[i].start<min) min = drw_data[i].start;
// 	      if(drw_data[i].end>max) max = drw_data[i].end;
// 	  }
// 	  return {start: 1000*Math.round(min/1000.0), end: 1000*Math.ceil(max/1000.0)};
//       } else {
// 	  return range;
//       }      
//   }


  var b2p = function(b) {
      return config.margin+((b-first_base)/bpp);
  }

  var log10 = function(arg) {
    return Math.log(arg)/Math.LN10;
  }










  //Public Interface
  var self = {
   /**Get/Set the main config object. It contains the config options afecting the whole drawer, not the individual tracks
   */
   config: function(conf) {
      if(conf !== undefined && typeof conf == "object") {
	  config = applyConfig(conf);
      }
      return config;
   },
   /**Add a track to the drawer. A track has an id, an optional data array, and an optional config object

   */
   addTrack: function(id, data, config) {
//       if(tracks[id]!=undefined) {
// 	console.log("Adding a duplicated track");
// 	return undefined;
//       }
      //TODO: Check if the track id is unique
      console.log("Adding track "+id);
      if(config == undefined) {
	config = {}; //TODO  getDefaultTrackConfig();
      }
      var track = Track(id, data, config);
      tracks.push(track);
      
      
      //redrawAllTracks();??
   },
   /**Given the id of a previously addded track, it is removed and all it's data deleted.
   */
   removeTrack: function(id) {
     alert("SHOULD BE REMOVING A TRACK"); 
   },
   /**Get/Set the data of a track. This is the ONLY method to modify the track data
   */
   trackData: function(id, data) {
      alert("SHOULD BE SETTING TRACK DATA");
   },
   /**Get/Set the config object of a given track.
   */
   trackConfig: function(id, conf) {
      alert("SHOULD BE CHANGING THE TRACK CONFIG");
   },
   /**Get the range to be drawn.
   */
   getRange: function(rng) {
      return current_range;
   },
   /**Triggers a redraw action of the drawer. If there is no range object, it will show the same range.
  
   */
   redraw: function(range) {
      console.log("call to redraw");
      setRange(range);
      console.log("range set");
      redrawAllTracks();
      console.log("tracks redrawn");
   },
   //TODO: Add the possibility to redraw a single track? Possible problems with changing config with deferred redrawing.

   getPaper: function() {
     return paper;
   },
   /*A little submodule exposing small utility functions*/
   Utils: {
      base2pixel: b2p,
      linePosition: linePosition,
      lineHeight: lineHeight
   }

   
  };

  //initialization code

  
  console.log("genomedrawer initialized");
    
  return self;
};


