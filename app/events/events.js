const config = require("../config/config.js");
const express = require("express");
const fs = require("fs");
const authcheck = require("../auth/authCheck.js");

const EventsRouter = (module.exports = express.Router());

const events = JSON.parse(fs.readFileSync("./app/events/events.json")).sort((a, b) => {return a.timestamp - b.timestamp});

EventsRouter.get("/", authcheck, (request, response) => {
    response.render("events/events", { request, response, events });
});
