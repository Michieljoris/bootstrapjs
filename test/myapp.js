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
	    ],
    factory: function(a1f1, myappfoo, a1f1foo, data, mypathf1, myappstringfact)  {
      console.log(this,'executing myapp callback');
      describe("In myapp", function() {
      		 it("this is defined", function() {
      		      expect(this).toBeDefined();
      		    });
		 it("a1/f1 is exported by returning an object", function() {
		      expect(a1f1.name).toBe('a1f1');
		    });
		 it("loading of module in same file: myapp#foo is imported", function() {
		      expect(myappfoo.name).toBe("myappfoo");
		    });
		 it("loading of tagged module in other file: a1/f1#foo is imported", function() {
		      expect(a1f1foo.name).toBe('a1f1foo');
		    });
		 it("loading of data using xhr", function() {
		      expect(typeof data).toBe('string');
		    });
		 it("module.a1.f1foo is accessible through global namespace", function() {
		      expect(module.a1.f1foo.name).toEqual('a1f1foo');
		    });
		 it("use of paths to shorten object names", function() {
		      expect(mypathf1.name).toEqual('a1b1f1');
		    });
		 it("myappstringfact", function() {
		      expect(myappstringfact.name).toEqual('stringfactory');
		    });
		 // it("loading of javascript of the net (jquery)", function() {
		 //      expect($).toBeDefined();
		 //    });
	       });
      
      // console.log(data);
      this.name = 'myapp';
    }
  });

define(
  {
    tag: 'stringfactory',	    
    // load: ['data!http://code.jquery.com/jquery-1.8.1.min.js'],
    // inject: ['a1/f1', 'a1/f1#foo', 'a1/f3'],
    // inject: ['a1/f1'],
    factory: {
	name: 'stringfactory'
    }
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



