console.log("------browser executing myapp file");

define(
  {
    tag: 'foo',	    
    // load: ['data!http://code.jquery.com/jquery-1.8.1.min.js'],
    // inject: ['a1/f1', 'a1/f1#foo', 'a1/f3'],
    inject: ['a1/f1'],
    factory: function(f1, f1_foo, f3)  {
      console.log(this,'executing myapp callback');
      this.myapp = 'myapp';
      describe("In myapp", function() {
		 it("a1.f1#bar is imported", function() {
		      expect(f1.name).toBe('f1');
		    });
		 // it("a1.f1#foo is imported", function() {
		 //      expect(f1_foo.name).toBe('f1#foo');
		 //    });
		 // it("a1.f3 is imported", function() {
		 //      expect(f3.name).toBe('f3');
		 //    });
	       });
    }
  });
