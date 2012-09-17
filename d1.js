console.log("executing d1 file");
load(function(self) {
  console.log("executing d1 callback");
  // var obj1 = thing('com.phaedo.obj1');
  
  // var obj2 = thing('com.phaedo.obj2');

  // self.hello = 'hello';
  // self.export2 = 'export2';
  //or:
  var exports = {
    exp1: "Hello",
    exp2: "Export2"
  };

  // self.publicize(exports); //or self.assign(..); or self.publicize(..);
  // return exports;
});
// 
// r;
