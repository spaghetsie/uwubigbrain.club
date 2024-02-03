const { readFile } = require("fs").promises;
const fs = require('fs');
const express = require('express');

const http = require('http');
const https = require('https');
const islocal = fs.existsSync("./localhost");

const credentials = {key: "privateKey", cert: "certificate"};

if (!islocal){

    const privateKey  = fs.readFileSync('/etc/letsencrypt/live/uwubigbrain.club/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/uwubigbrain.club/fullchain.pem', 'utf8');

    credentials.key = privateKey;
    credentials.cert = certificate;

}


const app = express();


app.get("/", async (request, response) => {

    console.log("Ladies and gents we got ourselfs a visitorrr")

    response.send(await readFile('./src/main.html', 'utf-8'));

})

if (!islocal) {

    var httpServer = http.createServer(app);
    var httpsServer = https.createServer(credentials, app);

    httpServer.listen(process.env.PORT || 80, () => {console.log("tvoje máma 80kg")})
    httpsServer.listen(process.env.PORT || 443, () => {console.log("tvoje máma 443kg")})

}
else {

    app.listen(process.env.PORT || 8080, () => {console.log("tvoje lokální máma")})

}

