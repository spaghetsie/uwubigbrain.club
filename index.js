const { readFile } = require("fs").promises;
const fs = require("fs");
const express = require("express");
const engine = require("express-edge");
const session = require("express-session");
const hostValidation = require("host-validation");

const http = require("http");
const https = require("https");

const DiscordAuthRouter = require("./app/auth/discord.js");
const EventsRouter = require("./app/events/events.js");

config = require(`./app/config/config.js`);
config.server.EndpointUriEncoded = encodeURIComponent(config.server.Endpoint);

global.app = express();
const app = global.app;

// Automatically sets view engine and adds dot notation to app.render
app.use(engine);

app.use(
    session({
        secret: config.server.session_secret,
        resave: false,
        saveUninitialized: true,
    })
);

app.use(
    hostValidation({
        hosts: ["34.159.41.47", "localhost:8080", "uwubigbrain.club"],
    })
);

app.set("views", `${__dirname}/app`);
app.use("/css", express.static(`./app/resources/css`));
app.use("/fonts", express.static(`./app/resources/fonts`));
app.use("/favicon.ico", express.static(`./app/resources/favicon/favicon.ico`));

// Configure view caching
//app.enable('view cache');

//const { exec } = require("child_process");

app.get("/", (request, response) => {
    response.render("main/main", { request });
});

app.use("/auth", DiscordAuthRouter);

app.use("/events", EventsRouter)

app.get("/about", (request, response) => {
    response.render("about/about", { request, response });
});

app.use((request, response, next) => {
    response.status(404).render("error/error", { response, request });
});

app.use((error, request, response, next) => {
    response.status(500).render("error/error", { response, request });
});

if (!config.server.IsRunningLocally) {
    const credentials = {};
    const privateKey = fs.readFileSync(
        "/etc/letsencrypt/live/uwubigbrain.club/privkey.pem",
        "utf8"
    );
    const certificate = fs.readFileSync(
        "/etc/letsencrypt/live/uwubigbrain.club/fullchain.pem",
        "utf8"
    );

    credentials.key = privateKey;
    credentials.cert = certificate;

    var httpServer = http.createServer(app);
    var httpsServer = https.createServer(credentials, app);

    httpServer.listen(process.env.PORT || 80, () => {
        console.log("Listening on port 80");
    });
    httpsServer.listen(process.env.PORT || 443, () => {
        console.log("Listening on port 443");
    });
} else {
    app.listen(process.env.PORT || 8080, () => {
        console.log("Running on localhost:8080");
    });
}
