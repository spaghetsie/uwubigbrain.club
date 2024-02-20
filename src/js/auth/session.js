function SaveUserData2Session(request, response, next) {
    request.session.user = request.locals.userdata
    next()
}

