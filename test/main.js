console.log("------browser executing main file");
this.nmodules = 1;
define(
  {
    // tag: 'foo',	    
    // load: ['test.css'
    // 	   //,'http://code.jquery.com/jquery-1.8.1.min.js'
    // 	  ],
    inject: ['main' 
    	     // ,'myapp#foo' 
    	     // ,'a1/f1#foo'
    	     // ,'data!test.css'
    	    ],
    factory: function(me)  {
      console.log(this,'executing myapp callback');
      var This = this;
      describe("In main", function() {
      		 it("this is defined", function() {
      		      expect(this).toBeDefined();
      		    });
		 it("this to equal to me", function() {
		      expect(This).toEqual(me);
		    });
		 it("module.main to equal to me", function() {
		      expect(module.main).toEqual(me);
		    });
		 // it("loading of module in same file: myapp#foo is imported", function() {
		 //      expect(myappfoo.name).toBe("myappfoo");
		 //    });
		 // it("loading of tagged module in other file: a1/f1#foo is imported", function() {
		 //      expect(a1f1foo.name).toBe('a1f1foo');
		 //    });
		 // it("loading of data using xhr", function() {
		 //      expect(typeof data).toBe('string');
		 //    });
		 // it("loading of javascript of the net (jquery)", function() {
		 //      expect($).toBeDefined();
		 //    });
	       });
      
      
      console.log(me);
      console.log(this);
      this.name = 'main';
    }
  });


