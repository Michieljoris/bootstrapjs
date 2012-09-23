console.log("-----browser executing d1 file");
define(
  {
    // name: 'foo',	    
    // load: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js'], 
    inject: ['doodads/d2'],
    factory: function() 
    {  console.log(this, "executing d1 callback");
       
       this.name = 'd1'; 
    } 
  });


define(
  {
    tag: 'foo',	    
    // load: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js'], 
    inject: ['doodads/d2'],
    factory: function() 
    {  console.log(this, "executing d1#foo callback");
       
       this.name = 'd1,foo'; 
    } 
  });


define(
  {
    tag: 'bar',	    
    // load: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js'], 
    inject: ['doodads/d2'],
    factory: function() 
    {  console.log(this, "executing d1#bar callback");
       
       this.name = 'd1,bar'; 
    } 
  });
