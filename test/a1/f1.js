console.log("-----browser executing f1 file");


define(
  {
    tag: 'bar',	    
    // load: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js'], 
    // inject: ['a1/f3#hello', 'a1/f1'],
    inject: ['myapp'],
    factory: function(a1f1) 
    {  console.log(this, "executing f1#bar callback");
      describe("In a1.f1#bar", function() {
      		 it("a1.f1 is imported", function() {
      		      expect(a1f1.name ).toBe('myapp');
      		    });
		 // it("a1/f1 is imported", function() {
		 //      expect(a1f1.name).toBe('f1');
		 //    });
		 // it("f3 is imported", function() {
		 //      expect(f3.name).toBe('f3');
		 //    });
	       });
       
       this.name = 'f1#bar'; 
    } 
  });

define(
  {
    // name: 'foo',	    
    // load: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js'], 
    // inject: ['a1/f2'],
    factory: function(myapp) 
    {  console.log(this, "executing f1 callback");
      describe("In a1.f1#", function() {
		 it("myapp is imported", function() {
		      expect(myapp.name).toBe('myapp');
		    });
		 // it("f1#foo is imported", function() {
		 //      expect(f1_foo.name).toBe('f1#foo');
		 //    });
		 // it("f3 is imported", function() {
		 //      expect(f3.name).toBe('f3');
		 //    });
	       });
       
       this.name = 'f1'; 
    } 
  });


define(
  {
    tag: 'foo',	    
    // load: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js'], 
    // inject: ['a1/f2'],
    factory: function(f2) 
    {  console.log(this, "executing d1#foo callback");
       
      describe("In a1.f1#foo", function() {
		 // it("a1.f2 is imported", function() {
		 //      expect(f2.name).toBe('f2');
		 //    });
		 // it("f1#foo is imported", function() {
		 //      expect(f1_foo.name).toBe('f1#foo');
		 //    });
		 // it("f3 is imported", function() {
		 //      expect(f3.name).toBe('f3');
		 //    });
	       });
       
       this.name = 'f1#foo'; 
    } 
  });




