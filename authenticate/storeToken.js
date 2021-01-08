const utils = require('./utils');

exports.consumeRememberMeToken = (app, token, fn) => {
  let uid = app.locals.tokens[token];
  delete app.locals.tokens[token];
  return fn(null, uid);
}

function saveRememberMeToken(app, token, uid, fn) {
  app.locals.tokens[token] = uid;
  return fn();
}

exports.saveRememberMeToken = saveRememberMeToken;

exports.issueToken = (app, user, done) => {
  let token = utils.randomString(64);
  saveRememberMeToken(app, token, user._id, function(err) {
    if (err) { return done(err); }
    return done(null, token);
  });
}