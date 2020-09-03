const app = require('express')();
const proxy = require('express-http-proxy');
const paths = require('./paths.json');


 function addAuth(proxyReqOpts) {
	proxyReqOpts.headers['Authorization'] = 'Bearer ' + process.env.API_KEY;
	proxyReqOpts.headers['Content-Type'] = 'application/json';
	return proxyReqOpts;
}

function pathFixer(expressEndpoint, airtableEndpoint){
 	return function(req){
	  let [path, queryString] = req.url.split('?');
	  return `/v0/${process.env.APP_ID}/${airtableEndpoint}` + path.replace(expressEndpoint,'') + (queryString ? '?' + queryString : '');
  }
}


if(!process.env.AIR_TABLE_URL || !process.env.API_KEY || !process.env.APP_ID){
	console.error("Either AIR_TABLE_URL, API_KEY, or API_ID not set");
}else{
	for(path in paths ){
		if(paths.hasOwnProperty(path)){
			app.use(path,proxy(process.env.AIR_TABLE_URL, {
				https: true,
				proxyReqPathResolver: pathFixer(path, paths[path]),
				proxyReqOptDecorator: addAuth
			}))
		}
	}
	app.listen(80, ()=>console.log("Running proxy app"));
}
