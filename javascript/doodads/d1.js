console.log("-----browser executing d1 file");
define(
  {
    // name: 'foo',	    
    // load: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js'], 
    // require: ['doodads/d2'],
    factory: function(blatest) 
    {  console.log(this, "executing d1 callback");
       // console.log(d2, "d2 in d1");
       // // console.log(d3, "d3 in d1");
       // log(d2.name);
       // self.hello = 'hello';
       // self.self2 = 'self2';
       // com.phaedo.doodads.d1.hello = "hello";
       // self.d1=1;
       //other options to export are
       // self.xport({ a: 1, b: 2});  not implemented 
       // return self; not implemented
       
       this.name = 'd1'; 
       // return 1; 
    } 
  });
