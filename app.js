const app = require('express')();
const proxy = require('express-http-proxy');
const paths = require('./paths.json');

const PORT = process.env.PORT || 3000;
 function addAuth(proxyReqOpts) {
	proxyReqOpts.headers['Authorization'] = 'Bearer ' + process.env.API_KEY;
	proxyReqOpts.headers['Content-Type'] = 'application/json';
	return proxyReqOpts;
}

function pathFixer(expressEndpoint, airtableEndpoint){
 	return function(req){
	  const queryString = req.url.split('?')[1];
 		const id = req.params.id ? '/' + req.params.id : ''
	  const query = (queryString ? '?' + queryString : '')
	  return `/v0/${process.env.APP_ID}/${airtableEndpoint}${id}${query}`;
  }
}


if(!process.env.AIR_TABLE_URL || !process.env.API_KEY || !process.env.APP_ID){
	console.error("Either AIR_TABLE_URL, API_KEY, or API_ID not set");
}else{
	for(path in paths ){
		if(paths.hasOwnProperty(path)){
			app.use(path + '/:id?',proxy(process.env.AIR_TABLE_URL, {
				https: true,
				proxyReqPathResolver: pathFixer(path, paths[path]),
				proxyReqOptDecorator: addAuth
			}))
		}
	}
	app.listen(PORT, ()=>console.log("Running proxy app"));
}
