console.log("-----browser executing a1/f1 file");
this.nmodules += 3;
define(
  {
    // load: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js'], 
    // inject: [],
    inject: ['a1/b1/f1'],
    factory: function(a1b1f1) 
    {  console.log(this, "executing a1/f1 callback");
      describe("In a1/f1" , function() {
      		 it("this is defined", function() {
      		      expect(this).toBeDefined();
      		    });
      		 // it("loaded and executed javascript of the net (jquery)", function() {
      		 //      expect($).toBeDefined();
      		 //    });
      		 it("a1b1f1 is imported", function() {
      		      expect(a1b1f1.name).toBe('a1b1f1');
      		    });
      	       });
       this.name = 'a1f1'; 
    } 
  });

define(
  {
    tag: 'foo',	    
    // load: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js'], 
    // inject: ['a1/f2'],
    factory: function() 
    {  console.log(this, "executing f1 callback");
      describe("In a1/f1#foo", function() {
      		 it("this is defined", function() {
      		      expect(this).toBeDefined(); });
      		 // it("f1#foo is imported", function() {
      		 //      expect(f1_foo.name).toBe('f1#foo');
      		 //    });
      		 // it("f3 is imported", function() {
      		 //      expect(f3.name).toBe('f3');
      		 //    });
      	       });
       
       this.name = 'a1f1foo'; 
    } 
  });


define(
  {
    tag: 'bar',	    
    // load: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js'], 
    // inject: ['a1/f2'],
    factory: function() 
    {  console.log(this, "executing a1/f1#bar callback");
      // describe("In a1/f1#bar", function() {
      // 		 it("this is defined", function() {
      // 		      expect(this).toBeDefined(); });
      // 		 // it("a1.f2 is imported", function() {
      // 		 //      expect(f2.name).toBe('f2');
      // 		 //    });
      // 		 // it("f1#foo is imported", function() {
      // 		 //      expect(f1_foo.name).toBe('f1#foo');
      // 		 //    });
      // 		 // it("f3 is imported", function() {
      // 		 //      expect(f3.name).toBe('f3');
      // 		 //    });
      // 	       });
       
       this.name = 'a1f1bar'; 
    } 
  });




