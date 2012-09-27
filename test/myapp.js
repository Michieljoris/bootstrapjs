console.log("------browser executing myapp file");
this.nmodules = 2;
define(
  {
    // tag: 'foo',	    
    load: ['test.css'
	   //,'http://code.jquery.com/jquery-1.8.1.min.js'
	  ],
    inject: ['a1/f1' 
	     ,'myapp#foo' 
	     ,'a1/f1#foo'
	     ,'data!test.css'
	     ,'mypath/f1'
	     ,'myapp#stringfactory'
	     ,'myapp#numberfactory'
	     ,'myapp#objectfactory'
	     ,'myapp#booleanfactory'
	     ,'data!test.js'
	     ,'runtest.js'
	    ],
    factory: function(a1f1, myappfoo, a1f1foo, data, mypathf1, 
		      myappstringfact, myappnumberfact, myappobjectfact, myappbooleanfact
		      ,jsdata, jsdata2
		     )  {
		       console.log(this,'executing myapp callback');
		       describe("In myapp", function() {
      				  it("this is defined", function() {
      				       expect(this).toBeDefined();
      				     });
				  it("a1/f1 is exported by returning an object", function() {
				       expect(a1f1.name).toBe('a1f1');
				     });
				  it("loading of module in same file", function() {
				       expect(myappfoo.name).toBe("myappfoo");
				     });
				  it("loading of tagged module in other file", function() {
				       expect(a1f1foo.name).toBe('a1f1foo');
				     });
				  it("loading of data using xhr", function() {
				       expect(typeof data).toBe('string');
				     });
				  it("module.a1.f1.foo is accessible through global namespace", function() {
				       expect(module.a1.f1.foo.name).toEqual('a1f1foo');
				     });
				  it("use of paths to shorten object names", function() {
				       expect(mypathf1.name).toEqual('a1b1f1');
				     });
				  it("loading of factory (string)", function() {
				       expect(myappstringfact).toEqual('stringfactory');
				     });
				  it("loading of factory (number)", function() {
				       expect(myappnumberfact).toEqual(1234);
				     });
				  it("loading of factory (object literal)", function() {
				       expect(myappobjectfact.name).toEqual('objectfactory');
				     });
				  it("loading of factory (boolean)", function() {
				       expect(myappbooleanfact).toEqual(true);
				     });
				  it("data!test.js loads as data", function() {
				       expect(jsdata).toEqual("console.log('hello');\n");
				     });
				  it("data!test.js is stored in module['test.js']", function() {
				       expect(jsdata).toEqual(module['test.js']);
				     });
				  // it("loading js files with .js extension runs them and does not define new modules", function() {
				  //      expect(jsdata2).toBeUndefined();
				  //    });
				  
				  
				  // it("loading of javascript of the net (jquery)", function() {
				  //      expect($).toBeDefined();
				  //    });
				});
		       
		       console.log('global', module.a1.f1.foo);
   		       console.log(this);
		       
		       this.name = 'myapp';
		     }
  });

define(
  {
    
    tag: 'stringfactory',	    
    // inject: ['myapp'], 
    factory: "stringfactory"
  });

define(
  {
    tag: 'numberfactory',	    
    factory: 1234
  });

define(
  {
    tag: 'objectfactory',	    
    factory: {
      name: 'objectfactory'
    }
  });


define(
  {
    tag: 'booleanfactory',	    
    factory: true
  });

define(
  {
    tag: 'foo',	    
    // load: ['data!http://code.jquery.com/jquery-1.8.1.min.js'],
    // inject: ['a1/f1', 'a1/f1#foo', 'a1/f3'],
    // inject: ['a1/f1'],
    factory: function()  {
      console.log(this,'executing myappfoo callback');
      describe("In myappfoo", function() {
      		 it("this is defined", function() {
      		      expect(this).toBeDefined();
      		    });
		 // it("a1.f1#bar is imported", function() {
		 //      expect(f1.name).toBe('f1');
		 //    });
		 // it("a1.f1#foo is imported", function() {
		 //      expect(f1_foo.name).toBe('f1#foo');
		 //    });
		 // it("a1.f3 is imported", function() {
		 //      expect(f3.name).toBe('f3');
		 //    });
	       });
      return {
	name: 'myappfoo'
      };
    }
  });



