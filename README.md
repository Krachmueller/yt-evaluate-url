# yt-evaluate-url


Solves the problem of SPA's to not have the correct http-status-code at the inital request.
Uses the give path to call a api-function of the RIOT and receive a Promise with a data-object, which is the backend-response.
This response contains at least the http-status-code and optionally a redirect url.
If a redirect-url is given the node-app redirects to that path. This is to be able to manage redirects in the RIOT and not only via htaccess.

### Example `data`- Object ( Promise-Parameter )

```
{
	status: 301,
	redirect: https://www.xy.com/my-redirect-url
}
```


### Example of usage in the node-app on the server used for routing


```


if (!isFile) {

			//	GET STATUS CODE FROM BACKEND ( and optionally the redirect url)
			var url = riotUrl + '/evalurl?url=' +  req.path;

			evalurl.get(url)
				.then( (data) => {
					// console.log("\tapp-riot.js -> route(*) & url=%s: evalurl-result=",req.path,data);

			    	if (!!data) {
						if (data.redirect) {
							res.redirect(parseInt(data.status),data.redirect);
							return;
						} else {
							res.status( data.status );
							res.render( 'index', {});
							return;
						}
					}
				})
				.catch((err)=>{
					res.render( 'index', {});
					// console.log("ERROR \tapp-riot.js -> route(*):",err);
					return;
				});
		} else {
			res.render( 'index', {});
			return;
		}
```

