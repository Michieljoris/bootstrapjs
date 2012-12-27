console.log("------browser executing loader file");
this.nmodules = 1;
define(
  {
    load: ['ed1', 'ed2']
  });


describe("In loader.js", function() {
      	   it("This file is loaded from myapp.js. load.js has no factory or inject members, and it is loading ed1.js and ed2.js", function() {
      		expect(1).toEqual(1);
      	      });
	 });
