console.log(timestamp() + ": ------browser executing myapp file");

define(
  {
    name: 'foo',	    
    load: ['somelib'], 
   require: ['doodads/d1'],
    factory: function(blatest) 
    {
      log(blatest,  'executing myapp callback');
      // var b = 0;
      // var c = 0;
      // do {
      //   for (var i = 0; i < 100000; i++) {
      //     b = b + 1;
      //   }
      //   console.log("counting:" + c);
      //   c+=1;
      // } while (c < 100);
      // self.makePublic();
      console.log(this, "this");
      // console.log(d1, "d1");
      // console.log(d2, "d2" );
    }
  });



