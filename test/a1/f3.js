console.log("---------browser executing f3 file");

define(
  {
    // name: 'foo',	    
    // load: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js'], 
    inject: ['a1/f1#bar'],
    factory: function(f1bar) 
    {  console.log(this, "executing f3 callback");
       describe("In a1.f3", function() {
		  it("f1bar is imported", function() {
		       expect(f1bar.name).toBe('f1#bar');
		     });
		  // it("f1#foo is imported", function() {
		  //      expect(f1_foo.name).toBe('f1#foo');
		  //    });
		  // it("f3 is imported", function() {
		  //      expect(f3.name).toBe('f3');
		  //    })
		});
       
       this.name = 'f3'; 
       // return 1; 
    } 
  });


define(
  {
    tag: 'hello',
    // name: 'foo',	    
    // load: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js'], 
    // inject: ['a1/f1#bar'],
    factory: function() 
    {  console.log(this, "executing f3hello callback");
       describe("In a1.f3hello", function() {
		  // it("f1bar is imported", function() {
		  //      expect(f1bar.name).toBe('f1#bar');
		  //    });
		  // // it("f1#foo is imported", function() {
		  //      expect(f1_foo.name).toBe('f1#foo');
		  //    });
		  // it("f3 is imported", function() {
		  //      expect(f3.name).toBe('f3');
		  //    })
		});
       
       this.name = 'f3hello'; 
       // return 1; 
    } 
  });
