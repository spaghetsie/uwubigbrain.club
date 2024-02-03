const { readFile } = require("fs").promises;
const express = require('express');

const app = express();

console.log()

app.get("/", async (requrest, response) => {
    
    response.send(await readFile('./src/main.html', 'utf-8'));
})

app.listen(process.env.PORT || 443, () => {console.log("tvoje máma frč9")})