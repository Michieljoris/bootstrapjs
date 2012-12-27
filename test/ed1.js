console.log("------browser executing ed1 file");
this.nmodules = 1;
define(
    {
        inject: ['ed1'] ,
        factory: function(ed1) {
            console.log('hello from ed1');
            var This = this;
            describe("In ed1.js", function() {
      	        it("injected identity should be equal to 'this'", function() {
      		    expect(This).toEqual(ed1);
      	        });
	    });
        }
      
    });



describe("In ed1.js", function() {
      	   it("This file is loaded via the load.js. load.js has no factory or inject members", function() {
      		expect(1).toEqual(1);
      	      });
	 });
