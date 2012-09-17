console.log("executing myapp file");

module(
    ['doodads/d2', 'doodads/d1'], 
    function(self, d1 ) 
    {
	log('executing myapp callback');
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
	log('what is d1?');
	// pp(com.phaedo.doodads.d1);   
	   self.a = 1; 
       });

