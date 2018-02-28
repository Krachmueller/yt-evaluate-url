
var request = require('request');
var Promise = require('es6-promise').Promise;

// compute url to evaluate by given request.
// -> possible return-value: //localhost:8000/evalurl?url=/fleet&redirect=/destinations
// redirect-query is only used in the fake-api to easily test redirects
function computeEvalUrl(req){

	var fakeRiotURL = "http://" + req.headers.host; // e.g. //localhost:8000
	// test 'evalurl'-endpoint with response containing a redirect
	var fakeRedirectQuery = !!req.query && req.query.redirect ?  '&redirect=' + req.query.redirect : ''; // e.g. &redirect=/fleet

	console.log("\tNODE-app.js -> getEvalURL(path=%s, fakeRiotUrl=%s, redirectQuery=%s)", req.path, fakeRiotURL, fakeRedirectQuery);
	return fakeRiotURL + "/evalurl/?url=" + req.path + fakeRedirectQuery;

}


// sends a request to the fake-evalurl-api and receives an object containing
// the status code and optionally the redirect url ( and a message for debugging purposes ).
// Testing:
// 	- 200 OK -> /fleet ( valid json-file in /json-folder, f.e. '/json/fleet.json' )
//	- 404 Not Found -> /asdf ( no json-file in /json-folder, f.e. '/json/asdf.json' is non-existent )
//	- 301 Redirect -> /asdf?redirect=http://www.tuicruises.com/flotte ( returns json with redirect url )
//
function evaluateUrl(targetURL){

	return new Promise(function(resolve, reject) {
		console.log("\tNODE-app.js -> evaluateUrl: ", targetURL);
		request(targetURL, function (error, response, body) {

			var result = {};

			// handle error with backend-request
			if (error) {
				console.log('Server-ERROR: \tNODE-app.js -> evaluateUrl()',error);
				result.status = 500;
				result.message = 'Server-ERROR: \tNODE-app.js -> evaluateUrl()' + error.toString();
				resolve(result);
			} else {
				if (response) {
					// save status code of response
					if (!!response.statusCode) {
						result.status = response.statusCode;
					}
					try {
						var data = JSON.parse(response.body);
						if(!!data.redirect) {
							result.redirect = data.redirect;
						}
						if (!!data.message) {
							result.message = data.message;
						}
					} catch (e) {
						console.log('Server-ERROR: \tNODE-app.js -> evaluateUrl(): cannot parse response.body as json.',e);
					}
					resolve(result);
				} else {
					resolve( { status: 500,  message: "Server-ERROR - 500: \tNODE-app.js -> evaluateUrl(): no response."} );
				}
			}
		});
	});
}

module.exports = {

	computeEvalUrl: computeEvalUrl,

	get: function (url) {
		return evaluateUrl(url);
	}
};
