console.log("-----browser executing a1/f1 file");
this.nmodules += 3;
define(
  {
    inject: ['a1/f1#foo'],
    factory: function(a1f1foo) 
    {  console.log(this, "executing a1/f1 callback");
      describe("In a1/f1" , function() {
      		 it("this is defined", function() {
      		      expect(this).toBeDefined();
      		    });
      		 it("a1f1foo is imported", function() {
      		      expect(a1f1foo.name).toBe('a1f1foo');
      		    });
      	       });
       this.name = 'a1f1';
       console.log(module.a1.f1.name);
       // return {
       // 	 name: 'a1f1'
       // };
    } 
  });

define(
  {
    tag: 'foo',	    
    // load: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js'], 
    inject: ['a1/f1#foo'],
    factory: function(me) 
    {  console.log(this, "executing f1/foo callback");
       var This = this;
      describe("In a1/f1#foo", function() {
      		 it("this is defined", function() {
      		      expect(this).toBeDefined(); });
		 it("module.a1.f1.foo to equal to me", function() {
		      expect(module.a1.f1.foo).toEqual(me);
		    });
      		 it("this is equal to injected identity", function() {
      		      expect(This).toEqual(me);
      		    });
      	       });
       // this.test = "testing";
       this.name = 'a1f1foo'; 
      console.log(module.a1.f1.foo); 
      console.log(me); 
      console.log(This);
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




