var path_subsitutions = {
  p1 : 'path/to/p1/',
  p2 : 'path/to/p2/'
};


function getResource(id) {
  var pathPrefix= 'pathprefix/';
  var res = {
    status : 'new' //requested, received_and_executed
  };
  var isUri = false;
  var lastHash = id .lastIndexOf('#');
  if (lastHash >-1) id = id.substring(0, lastHash);
  var splitId = id.split("!");
  if (splitId.length > 1 && 
      (splitId[0] === 'js' || splitId[0] === 'css' || splitId[0] === 'data')) {  
    res.plugin = splitId[0];
    id = id.substring(id.indexOf('!') + 1);
  }
  else {
    var lastDot = id.lastIndexOf('.');
    var lastSlash =  id.lastIndexOf('/');
    if (lastDot>lastSlash) res.plugin = id.substring(lastDot+1);
  }
  if (id.indexOf(':') > -1) isUri = true;
  var firstSlash = id.indexOf('/');
  if (firstSlash > -1) {
   var p = path_subsitutions[id.substring(0,firstSlash)];
    if (p) id = p + id.substring(firstSlash+1);
  }
  res.url = isUri ? id : pathPrefix + id;
  if (!res.plugin)  {
    if (!isUri) {
      res.plugin = 'js';
      res.url += '.js'; 
    }
    else {
      res.plugin = 'data';
    }
    
  }
  return res;
} 


function run () {
  function assert(s,p, a,b) {
    if (a !== b) {
      repl.print(s); 
      repl.print('  ' + p  + ' should be '  +  b + ' but is ' + a);
    }      
  }

  function test(a) {
    a.forEach(function(t) {
		var r = getResource(t[0]);
		assert(t[0] , "url" , r.url, t[1]);
		assert(t[0]  , 'plugin', r.plugin, t[2]);
	      }); 
  }
  test (
    [//test         url                          plugin
      ["basicjsfile", "pathprefix/basicjsfile.js", "js"],
      ["p1/basicjsfile", "pathprefix/path/to/p1/basicjsfile.js", "js"],
      ["p2/basicjsfile", "pathprefix/path/to/p2/basicjsfile.js", "js"],
      ["basicjsfile.js", "pathprefix/basicjsfile.js", "js"],
      ["basicjsfile#mytag", "pathprefix/basicjsfile.js", "js"],
      ["basicjsfile.js#mytag", "pathprefix/basicjsfile.js", "js"],
      ["bladfa/s.dfa/sd.fa/basicjsfile#mytag", "pathprefix/bladfa/s.dfa/sd.fa/basicjsfile.js", "js"],
      ["js!anyfile", "pathprefix/anyfile", "js"],
      ["js!anyfile.js", "pathprefix/anyfile.js", "js"],
      ["js!anyfile.any", "pathprefix/anyfile.any", "js"],
      ["css!anyfile", "pathprefix/anyfile", "css"],
      ["css!anyfile.css", "pathprefix/anyfile.css", "css"],
      ["anyfile.css", "pathprefix/anyfile.css", "css"],
      ["data!anyfile", "pathprefix/anyfile", "data"],
      
      ["uri:basicfile", "uri:basicfile", "data"],
      ["uri:p1/basicfile", "uri:p1/basicfile", "data"],
      ["uri:basicjsfile.js", "uri:basicjsfile.js", "js"],
      ["uri:basiccssfile.css", "uri:basiccssfile.css", "css"],
      ["uri:basicfile#mytag", "uri:basicfile", "data"],
      ["uri:basicjsfile.js#mytag", "uri:basicjsfile.js", "js"],
      ["uri:bladfa/s.dfa/sd.fa/basicfile#mytag", "uri:bladfa/s.dfa/sd.fa/basicfile", "data"],
      ["js!uri:anyfile", "uri:anyfile", "js"],
      ["uri:anyfile", "uri:anyfile", "data"],
      ["js!uri:anyfile.js", "uri:anyfile.js", "js"],
      ["js!uri:anyfile.any", "uri:anyfile.any", "js"],
      ["css!uri:anyfile", "uri:anyfile", "css"],
      ["css!uri:anyfile.css", "uri:anyfile.css", "css"],
      ["data!uri:anyfile", "uri:anyfile", "data"]
    ]

  ); 
  
}  


