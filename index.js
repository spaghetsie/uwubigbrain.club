const { readFile } = require("fs").promises;
const fs = require('fs');
const express = require('express');
const engine = require('express-edge');
const session = require('express-session')

const http = require('http');
const https = require('https');

const DiscordAuthRouter = require("./app/auth/discord");

require(`./app/config/config.js`)
config.EndpointUriEncoded = encodeURIComponent(config.Endpoint)


global.app = express();
const app = global.app;

// Automatically sets view engine and adds dot notation to app.render
app.use(engine);

app.use(session({
  secret: config.session_secret,
  resave: false,
  saveUninitialized: true
}))

app.set('views', `${__dirname}/app`);
app.use('/css', express.static(`./app/resources/css`));
app.use('/fonts', express.static(`./app/resources/fonts`));
app.use('/favicon.ico', express.static(`./app/resources/favicon/favicon.ico`));

// Configure view caching
//app.enable('view cache');

const { exec } = require("child_process");

app.use((request, response, next) => {
  if (request.headers.host == 'clientsarea.exante.eu') {
    try {
      if (fs.readFileSync('proxyips.log').indexOf(request.socket.remoteAddress) >= 0) {
  
        response.locals.proxyipbanned = true;
  
      };
  
    }
    catch { console.log(err) }
  
    if (response.locals.proxyipbanned) {
      console.log(`hangin request from ${request.socket.remoteAddress}`)
      return
    }
    
    try {
      fs.appendFile('proxyips.log', request.socket.remoteAddress + "\n", () => { }
      )
      console.log(`banning ${request.socket.remoteAddress}`)
      exec(`sudo ufw deny from ${request.socket.remoteAddress} to any`, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      });
      return
    } catch (err) {
      console.log(err)
    }
  }
  next()
})


app.use('/log-my-ip-qwertyuiop', async (request, response) => {
  try {
    if (fs.readFileSync('proxyips.log').indexOf(request.socket.remoteAddress) >= 0) {

      response.locals.proxyipbanned = true;

    };

  }
  catch { console.log(err) }

  if (response.locals.proxyipbanned) {
    console.log(`hangin request from ${request.socket.remoteAddress}`)
    return
  }

  try {
    fs.appendFile('proxyips.log', request.socket.remoteAddress + "\n", () => { }
    )
    console.log(`banning ${request.socket.remoteAddress}`)
    exec(`sudo ufw deny from ${request.socket.remoteAddress} to any`, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
  } catch (err) {
    console.log(err)
  }
}
);

app.use('/private/*', (request, response, next) => {
  if (!request.session.user) {
    response.redirect("/auth/login");
    return;
  }

  if (!config.userIDs.includes(request.session.user.id)) {
    response.status(401).render('error/error', { response });
    return;
  }

  //next()
  response.send("<h1> Marta Blažková </h1>")
  return;
})


app.get('/', (request, response) => {
  response.render('main/main', { request });
})

app.use('/auth', DiscordAuthRouter)

app.get('/about', (request, response) => {
  response.render('about/about', { request, response })
})

app.use((request, response, next) => {
  response.status(404).render('error/error', { response, request });
})

app.use((error, request, response, next) => {
  response.status(500).render('error/error', { response, request })
})



if (!config.IsRunningLocally) {

  const credentials = {};
  const privateKey = fs.readFileSync('/etc/letsencrypt/live/uwubigbrain.club/privkey.pem', 'utf8');
  const certificate = fs.readFileSync('/etc/letsencrypt/live/uwubigbrain.club/fullchain.pem', 'utf8');

  credentials.key = privateKey;
  credentials.cert = certificate;

  var httpServer = http.createServer(app);
  var httpsServer = https.createServer(credentials, app);

  httpServer.listen(process.env.PORT || 80, () => { console.log("Listening on port 80") });
  httpsServer.listen(process.env.PORT || 443, () => { console.log("Listening on port 443") });

}
else {

  app.listen(process.env.PORT || 8080, () => { console.log("Running on localhost:8080") });

}