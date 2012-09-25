console.log("---------browser executing f2 file");

define(
  {
    // name: 'foo',	    
    // load: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js'], 
    inject: ['a1/f3'],
    factory: function(a1_f3) 
    {  console.log(this, "executing f2 callback");
      describe("In a1_f2", function() {
		 it("a1.f3 is imported", function() {
		      expect(a1_f3.name).toBe('f3');
		    });
		 // it("a1.f1#foo is imported", function() {
		 //      expect(f1_foo.name).toBe('f1#foo');
		 //    });
		 // it("a1.f3 is imported", function() {
		 //      expect(f3.name).toBe('f3');
		 //    });
	       });
       
       this.name = 'f2'; 
       // return 1; 
    } 
  });

