const { readFile } = require("fs").promises;
const fs = require('fs');
const express = require('express');
const engine = require('express-edge');
const session = require('express-session')

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

app.use(session({
  secret: config.session_secret,
  resave: false,
  saveUninitialized: true
}))

app.set('views', `${__dirname}/views`);
app.use('/css', express.static(`${__dirname}/src/css`));
app.use('/fonts', express.static(`${__dirname}/src/fonts`));
app.use('/favicon.ico', express.static(`${__dirname}/src/favicon/favicon.ico`));

// Configure view caching
//app.enable('view cache');

app.use('/private/*', (request, response, next) => {
  if(!request.session.user) {
    response.redirect("/auth");
    return;
  }

  if(!config.userIDs.includes(request.session.user.id)) {
    response.status(401).render('public/error', {response});
    return;
  }

  //next()
  response.send("<h1> Marta Blažková </h1>")
  return;
})


app.get('/', (request, response) => {
  response.render('public/main', { request });
}
)

app.get('/epiclegacy', async (request, response) => {
  response.send(await readFile("./public/main.html", "utf-8"));
}
)

app.get("/auth",
  auth.CheckForCode,
  auth.GetToken,
  auth.GetUserData
)

app.get('/logout', auth.Logout, (request, response) => {
  response.redirect(`${config.Endpoint}/`)
})

app.use((request, response, next) => {
  response.status(404).render('public/error', {response});
}
)

if (!config.IsRunningLocally) {

  var httpServer = http.createServer(app);
  var httpsServer = https.createServer(credentials, app);

  httpServer.listen(process.env.PORT || 80, () => { console.log("Listening on port 80") });
  httpsServer.listen(process.env.PORT || 443, () => { console.log("Listening on port 443") });

}
else {

  app.listen(process.env.PORT || 8080, () => { console.log("Running on localhost:8080") });

}