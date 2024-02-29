require("../config/config.js");

module.exports = function authcheck(request, response, next) {
    if (!request.session.user) {
        response.redirect("/auth/login");
        return;
    }

    if (!config.discord.userIDs.includes(request.session.user.id)) {
        response.status(401).render("error/error", { response });
        return;
    }

    next();
};

