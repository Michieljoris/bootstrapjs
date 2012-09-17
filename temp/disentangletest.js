var path_subsitutions = {
  p1 : 'path/to/p1/',
  p2 : 'path/to/p2/'
};
var resources = {
};

var pathPrefix = 'pathprefix/';
function parseDependencyId(id) {
  // var dep = { tag: "" };
  //res
  var blocks = false, url, loader,
  tag = "", resource, bla;
  
  
  var isUri = false;
  
  if (id[id.length-1] === '|') {
    blocks  = true;
    id = id.substring(0, id.length-1);
  }
  var lastHash = id.lastIndexOf('#');
  if (lastHash > -1) { 
    tag = id.substring(lastHash+1);
    id = id.substring(0, lastHash);
    
  }
  var splitId = id.split("!");
  if (splitId.length > 1 && 
      (splitId[0] === 'js' || splitId[0] === 'css' || splitId[0] === 'data')) {  
    loader = splitId[0];
    id = id.substring(id.indexOf('!') + 1);
  }
  else { var lastDot = id.lastIndexOf('.');
	 var lastSlash =  id.lastIndexOf('/');
	 if (lastDot>lastSlash) loader = id.substring(lastDot+1);
       }
  if (id.indexOf(':') > -1) isUri = true;
  var firstSlash = id.indexOf('/');
  if (firstSlash > -1) {
    var p = path_subsitutions[id.substring(0,firstSlash)];
    if (p) id = p + id.substring(firstSlash+1);
  }
  url = isUri ? id : pathPrefix + id;
  if (!loader)  {
    if (!isUri) { loader = 'js';
		  url += '.js'; 
		}
    else loader = 'data';
  }
  if (!resources[loader + url]) {
    resource = {
      url: url,
      loader: loader,
      status: 'new',
      blocks: blocks
    };
    resources[loader + url] = resource;
  }
 else {
    resource = resources[loader + url];
    resource.blocks = blocks;
  }
  // repl.print(dep.resource);
  // return dep;
  return {
    resource: resource,
    tag: tag
    
  };
} 




function run () {
  resources = {};
  function assert(s,p, a,b) {
    if (a !== b) {
      repl.print(s); 
      repl.print('  ' + p  + ' should be '  +  b + ' but is ' + a);
    }      
  }

  function test(a) {
    a.forEach(function(t) {
		if (typeof t[4] === 'undefined') t[4] = false;
		var dep = parseDependencyId(t[0]);
		assert(t[0] , "url" , dep.resource.url, t[1]);
		assert(t[0]  , 'loader', dep.resource.loader, t[3]);
		assert(t[0]  , 'tag', dep.tag, t[2]);
		assert(t[0]  , 'blocks', dep.resource.blocks, t[4]);
	      }); 
  }
  test (
    [//test         url             tag             loader blocks
      ["basicjsfile|", "pathprefix/basicjsfile.js","", "js", true],
      ["p1/basicjsfile", "pathprefix/path/to/p1/basicjsfile.js","", "js"],
      ["p2/basicjsfile", "pathprefix/path/to/p2/basicjsfile.js","", "js"],
      ["basicjsfile.js", "pathprefix/basicjsfile.js","", "js"],
      ["basicjsfile#mytag", "pathprefix/basicjsfile.js","mytag", "js"],
      ["basicjsfile.js#mytag", "pathprefix/basicjsfile.js","mytag", "js"],
      ["bladfa/s.dfa/sd.fa/basicjsfile#mytag", "pathprefix/bladfa/s.dfa/sd.fa/basicjsfile.js","mytag", "js"],
      ["js!anyfile", "pathprefix/anyfile","", "js"],
      ["js!anyfile.js", "pathprefix/anyfile.js","", "js"],
      ["js!anyfile.any", "pathprefix/anyfile.any","",  "js"],
      ["css!anyfile", "pathprefix/anyfile","", "css"],
      ["css!anyfile.css", "pathprefix/anyfile.css","", "css"],
      ["anyfile.css", "pathprefix/anyfile.css","", "css"],
      ["data!anyfile", "pathprefix/anyfile","", "data"],
      
      ["uri:basicfile", "uri:basicfile","", "data"],
      ["uri:p1/basicfile|", "uri:p1/basicfile","", "data", true],
      ["uri:basicjsfile.js", "uri:basicjsfile.js","",  "js"],
      ["uri:basiccssfile.css", "uri:basiccssfile.css","", "css"],
      ["uri:basicfile#mytag", "uri:basicfile","mytag", "data"],
      ["uri:basicjsfile.js#mytag", "uri:basicjsfile.js","mytag", "js"],
      ["uri:bladfa/s.dfa/sd.fa/basicfile#mytag", "uri:bladfa/s.dfa/sd.fa/basicfile","mytag", "data"],
      ["js!uri:anyfile", "uri:anyfile","", "js"],
      ["uri:anyfile", "uri:anyfile","", "data"],
      ["js!uri:anyfile.js", "uri:anyfile.js","", "js"],
      ["js!uri:anyfile.any", "uri:anyfile.any","", "js"],
      ["css!uri:anyfile", "uri:anyfile","", "css"],
      ["css!uri:anyfile.css", "uri:anyfile.css","", "css"],
      ["data!uri:anyfile", "uri:anyfile","", "data"]
    ]

  ); 
  
}  


