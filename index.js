const { readFile } = require("fs").promises;
const fs = require('fs');
const express = require('express');
const engine = require('express-edge');

const http = require('http');
const https = require('https');

require(`${__dirname}/config.js`)
config.EndpointUriEncoded = encodeURIComponent(config.Endpoint)

const credentials = {key: "privateKey", cert: "certificate"};

if (!config.IsRunningLocally){

    const privateKey  = fs.readFileSync('/etc/letsencrypt/live/uwubigbrain.club/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/uwubigbrain.club/fullchain.pem', 'utf8');

    credentials.key = privateKey;
    credentials.cert = certificate;

}


global.app = express();
const app = global.app;

// Automatically sets view engine and adds dot notation to app.render
app.use(engine);
app.set('views', `${__dirname}/views`);
app.use('/css', express.static(`${__dirname}/src/css`));
app.use('/fonts', express.static(`${__dirname}/src/fonts`));
app.use('/favicon.ico', express.static(`${__dirname}/src/favicon/favicon.ico`));

// Configure view caching
//app.enable('view cache');

app.get('/', (request, response) => {
    response.render('public/main', { request });
  }
)

app.get('/epiclegacy', async (request, response) => {
    response.send(await readFile("./public/main.html", "utf-8"))
  }
)

app.get("/auth", async (request, response, next) => {
  
  if(!request.query.code){
    await response.redirect(`https://discord.com/api/oauth2/authorize?client_id=1209270223593799800&response_type=code&redirect_uri=${config.EndpointUriEncoded}%2Fauth&scope=identify`)
    return;
  }

  const code = request.query.code;

  const auth_request = new Request('https://discord.com/api/oauth2/token', {
				method: 'POST',
				body: new URLSearchParams({
					client_id: config.client_id,
					client_secret: config.client_secret,
					code,
					grant_type: 'authorization_code',
					redirect_uri: `${config.Endpoint}/auth`,
					scope: 'identify',
				}).toString(),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

  let oauthData;
  await fetch(auth_request)
  .then(response => response.json())
  .then(data => oauthData = data)
  .catch(error => response.status(401).render('public/error'));
  
  let userdata;
  await fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `${oauthData.token_type} ${oauthData.access_token}`,
    },
  })
  .then(response => response.json())
  .then(data => userdata = data)
  .catch(error => response.status(401).render('public/error'));

  response.render('public/main', userdata)
  
})

app.use(( req, res, next) => {
    res.status(404).render('public/error',  res );
  }
)

if (!config.IsRunningLocally) {

  var httpServer = http.createServer(app);
  var httpsServer = https.createServer(credentials, app);

  httpServer.listen(process.env.PORT || 80, () => {console.log("Listening on port 80")})
  httpsServer.listen(process.env.PORT || 443, () => {console.log("Listening on port 443")})

}
else {

  app.listen(process.env.PORT || 8080, () => {console.log("Running on localhost:8080")})

}

