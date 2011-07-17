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


var Track = function(id, original_data, original_config) {

  //CONSTANTS
  //var 

  //Check parameters
  if(id === undefined) { //if no id has been given, nothing can be done
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
	    colorer: original_config.colorer,
	    featureDrawer: original_config.featureDrawer,
	    trackDrawer: original_config.trackDrawer,
	    bumping: original_config.bumping
      };
      return config;
  };

  //Private Methods
  var setData = function(new_data) {
      console.log("Should be setting data");
      data = new_data;
      computeRange(); //Update the range info //TODO: Could be done lazily?
  };
  
  var computeRange = function() {
     if(!data || data.length == 0) return undefined;
     var s = data[0].start,
	 e = data[0].end;
	 
     for(var i=1, l=data.length; i<l; ++i) {
	if(data[i].start<s) s= data[i].start;
	if(data[i].end>e) e= data[i].end;
     }
     range = 
	    {start: s,
	     end: e
     }; 
    
  }
  
//END Utility Methods  #################################################################################################
  
//INITIALIZATION #######################################################################################################
  //Apply the config object received on creation before setting up anything else
  var config = applyConfig(original_config);
   
  var data;
  var range;
  
  
  setData(original_data);
  //Private Attributes

  
  
  

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
   data: function(new_data) {
      if(new_data!== undefined) {
	setData(new_data);
      }
      return data;
   },
   //Returns the range of its data.
   //NOTE: data features with start/end at 0, are "non-positional" and not takien into account
   getRange: function() {
      return range;
   }
  };

  //initialization code

  
  console.log("Track Created");
    
  return self;
};


