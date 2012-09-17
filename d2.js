console.log("executing d2 file");
define(
  {
    // name: 'foo',	    
    // load: ['somelib'], 
    require: ['doodads/d1'],
    factory: function(blatest) 
    {
      console.log("executing d2 callback");
    }
  });
