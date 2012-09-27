console.log("------browser executing main file");
this.nmodules = 1;
define(
  {
    // tag: 'foo',	    
    // load: ['test.css'
    // 	   //,'http://code.jquery.com/jquery-1.8.1.min.js'
    // 	  ],
    inject: [
      'main#foo'
      // 'data!test.js'
      // ,'runtest.js' 
    	    ],
    factory: function(mainfoo)  {
      console.log(this,'executing main callback');
      describe("In main", function() {
      		 it("this is defined", function() {
      		      expect(this).toBeDefined();
      		    });
      		 it("main#foo to be in module.main.foo", function() {
      		      expect(mainfoo).toEqual(module.main.foo);
      		    });
		 // it("data!test.js loads as data", function() {
		 //      expect(jsdata).toEqual("console.log('hello');\n");
		 //    });
		 // it("data!test.js is stored in module['test.js']", function() {
		 //      expect(jsdata).toEqual(module['test.js']);
		 //    });
		 // it("loading js files with .js extension runs them and does not define new modules", function() {
		 //      expect(jsdata2).toBeUndefined();
		 //    });
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
      
      
      // console.log(jsdata);
      // console.log(jsdata2);
      // console.log(jsdata2.charCodeAt(jsdata2.length-1));
      this.name = 'main';
    }
  });



define(
  {
   tag: 'foo',	    
    // load: ['test.css'
    // 	   //,'http://code.jquery.com/jquery-1.8.1.min.js'
    // 	  ],
    // inject: [
    //   // 'data!test.js'
    //   // ,'runtest.js' 
    // 	    ],
    factory: function()  { 

      describe("In main", function() {
      		 it("this is defined", function() {
      		      expect(this).toBeDefined();
      		    });
	       });
	       return {
		 name:'main#foo'
	       };}
    });
