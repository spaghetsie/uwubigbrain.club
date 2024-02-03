const { readFile } = require("fs").promises;
const fs = require('fs');
const express = require('express');

const http = require('http');
const https = require('https');
const privateKey  = fs.readFileSync('./ssl/selfsigned.key', 'utf8');
const certificate = fs.readFileSync('./ssl/selfsigned.crt', 'utf8');

const credentials = {key: privateKey, cert: certificate};

const app = express();

console.log()

app.get("/", async (requrest, response) => {
    
    response.send(await readFile('./src/main.html', 'utf-8'));
})

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(process.env.PORT || 80, () => {console.log("tvoje máma 80kg")})
httpsServer.listen(process.env.PORT || 443, () => {console.log("tvoje máma 443kg")})