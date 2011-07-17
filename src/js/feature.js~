/*
 * genomedrawer.js version 0.0.1
 *
 * Copyright (c) 2011 Bernat Gel
 * Licensed under the MIT license.
 */

//REQUIREMENT: This library requires Raphael.js to be loaded



/**PUBLIC API
	API:
		* Creator
		* config (get/set the track config)
		* data (get/set track DATA)

	

*/


/**Factory returning Track objects. 
@param id the identificator for the track
@param data the data object for the track
@param config the config object for the track
*/


var Feature = function(config) {

  //CONSTANTS
  //var 

  //Check parameters
  if(config === undefined || typeof config !== "object") { 
	return undefined;
  }
  
  //Utility Methods  #################################################################################################
  var definedOrDefault = function(value, default_value) {
	return (value !== undefined)?value:default_value;
  };

  var applyConfig = function(conf) {

       var config = {
	    start: definedOrDefault(conf.start,0),
	    end: definedOrDefault(conf.end,0),
	    strand: definedOrDefault(conf.strand, true),
	    multiline: definedOrDefault(conf.multiline, true),
	    doubleStranded: definedOrDefault(conf.doubleStranded, true),
	    drawScale:  definedOrDefault(conf.drawScale,true),
	    showSequenceLabel: definedOrDefault(conf.showSequenceLabel, true),
	    showTrackLabels: definedOrDefault(conf.showTrackLabels, true),
	    sequences: definedOrDefault(conf.sequences, {}),
	    interlineSpace: definedOrDefault(conf.interlineSpace, DEFAULT_INTERLINE_SPACE)*/
      };
      return config;
  };

//END Utility Methods  #################################################################################################
  
//INITIALIZATION #######################################################################################################
  //Apply the config object received on creation before setting up anything else
  var config = applyConfig(original_config);
  
  var data = setData(original_data);
  
  //Private Attributes

  
  //Private Methods
  var setData = function(data) {
      console.log("Should be setting data");
  };
  

  //Public Interface
  var self = {
   /**Get/Set the config object.
   */
   config: function(conf) {
      if(conf !== undefined && typeof conf == "object") {
	  config = applyConfig(conf);
      }
      return config;
   },
   /**Get/Set the data of a track. This is the ONLY method to modify the track data
   */
   data: function(data) {
      if(data!== "undefined") {
	setData(data);
      }
      return data;
   }
  };

  //initialization code

  
  console.log("Track Created");
    
  return self;
};


