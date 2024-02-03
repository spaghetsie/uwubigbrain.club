const { readFile } = require("fs").promises;
const express = require('express');

var http = require('http');
var https = require('https');
var privateKey  = await fs.readFileSync('ssl/serlfsigned.key', 'utf8');
var certificate = await fs.readFileSync('ssl/serlfsigned.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

const app = express();

console.log()

app.get("/", async (requrest, response) => {
    
    response.send(await readFile('./src/main.html', 'utf-8'));
})

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(process.env.PORT || 80, () => {console.log("tvoje máma 80kg")})
httpsServer.listen(process.env.PORT || 443, () => {console.log("tvoje máma 443kg")})