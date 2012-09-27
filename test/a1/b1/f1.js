console.log("-----browser executing a1/b1/f1 file");
this.nmodules += 1;
define(
  {
    // inject: ['a1/f1#bar'],
    // inject: ['myapp#foo'], 
    factory: function(a1f1bar) 
    {  console.log(this, "executing a1/b1/f1 callback");
      describe("In a1/b1/f1", function() {
      		 it("this is defined", function() {
      		      expect(this).toBeDefined();
      		    });
      		 // it("a1/f1#bar is imported", function() {
      		 //      expect(a1f1bar.name).toBe('a1f1bar');
      		 //    });
      	       });
       
       this.name = 'a1b1f1'; 
    } 
  });