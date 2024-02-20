require('../../../config.js')

function CheckForCode(request, response, next) {
  if (!request.query.code) {
    response.redirect(`https://discord.com/api/oauth2/authorize?client_id=1209270223593799800&response_type=code&redirect_uri=${config.EndpointUriEncoded}%2Fauth&scope=identify`)
    return;
  }
  request.session.redirectAfterAuth = request.headers.referer;
  next();
}
async function GetToken(request, response, next) {
  const code = request.query.code;

  const auth_request = new Request('https://discord.com/api/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: config.client_id,
      client_secret: config.client_secret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${config.Endpoint}/auth`,
      scope: 'identify',
    }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  await fetch(auth_request)
    .then(response => response.json())
    .then(data => response.locals.oauthData = data)
    .catch(error => response.status(401).render('public/error'));

  next()
}

async function GetUserData(request, response, next) {

  await fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `${response.locals.oauthData.token_type} ${response.locals.oauthData.access_token}`,
    },
  })
    .then(response => response.json())
    .then(data => request.session.user = data)
    .catch(error => response.status(401).render('public/error'));

  response.redirect(`${config.Endpoint}/`)
}

async function Logout(request, response, next) {

  if(!request.session.user){
    next();
    return;
  }

  const auth_request = new Request('https://discord.com/api/oauth2/token/revoke', {
    method: 'POST',
    body: new URLSearchParams({
      token: request.session.user.access_token,
      token_type_hint: 'access_token'
    }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  await fetch(auth_request)
    .then(() => request.session.destroy())
    .catch(error => response.status(401).render('public/error'));

  next()
}

module.exports = {CheckForCode, GetToken, GetUserData, Logout}