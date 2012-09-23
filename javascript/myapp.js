console.log("------browser executing myapp file");

define(
  {
    tag: 'foo',	    
    // load: ['somelib|'], 
    // inject: ['data!http://code.jquery.com/jquery-1.8.1.min.js'],
    inject: ['doodads/d1', 'doodads/d1#foo', 'doodads/d3'],
    factory: function(d1, d2)  {
      console.log(this,'executing myapp callback');
      console.log('d1', d1.name);
      console.log('d2', d2.name);
    }
  });
