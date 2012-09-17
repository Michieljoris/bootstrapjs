console.log("---------browser executing d2 file");
define(['plugins/css'], function(d3) {
	 console.log(this,"executing d2 callback");
	   console.log(d3, "d3 in d2");
	   
	   // log("d1 = " + d1.name);
	   this.name = 'd2'; 
	   // return 1;
     });
