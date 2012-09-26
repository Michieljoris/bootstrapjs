console.log("------browser executing myapp file");
this.nmodules = 2;
define(
  {
    // tag: 'foo',	    
    // load: ['test.css'],
    // inject: ['a1/f1', 'a1/f1#foo', 'a1/f3'],
    inject: ['a1/f1', 'myapp#foo', 'a1/f1#foo'],
    // inject: ['myapp#foo'],
    factory: function(a1f1, myappfoo, a1f1foo)  {
      console.log(this,'executing myapp callback');
      describe("In myapp", function() {
      		 it("this is defined", function() {
      		      expect(this).toBeDefined();
      		    });
		 it("a1/f1 is imported", function() {
		      expect(a1f1.name).toBe('a1f1');
		    });
		 it("loading of module in same file: myapp#foo is imported", function() {
		      expect(myappfoo.name).toBe("myappfoo");
		    });
		 it("loading of tagged module in other file: a1/f1#foo is imported", function() {
		      expect(a1f1foo.name).toBe('a1f1foo');
		    });
	       });
      console.log(myappfoo.name);
      this.name = 'myapp';
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
      this.name = 'myappfoo';
    }
  });


