const { readFile } = require("fs").promises;
const fs = require('fs');
const express = require('express');
const engine = require('express-edge');

const http = require('http');
const https = require('https');

const auth = require("./src/js/auth/discord")

require(`${__dirname}/config.js`)
config.EndpointUriEncoded = encodeURIComponent(config.Endpoint)

const credentials = { key: "privateKey", cert: "certificate" };

if (!config.IsRunningLocally) {

  const privateKey = fs.readFileSync('/etc/letsencrypt/live/uwubigbrain.club/privkey.pem', 'utf8');
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

app.get("/auth",
  auth.CheckForCode,
  auth.GetToken,
  auth.GetUserData
)

app.use((req, res, next) => {
  res.status(404).render('public/error', res);
}
)

if (!config.IsRunningLocally) {

  var httpServer = http.createServer(app);
  var httpsServer = https.createServer(credentials, app);

  httpServer.listen(process.env.PORT || 80, () => { console.log("Listening on port 80") })
  httpsServer.listen(process.env.PORT || 443, () => { console.log("Listening on port 443") })

}
else {

  app.listen(process.env.PORT || 8080, () => { console.log("Running on localhost:8080") })

}

