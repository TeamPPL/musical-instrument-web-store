const passport = require('passport');

module.exports = (req, res, next) => {
  //console.log(req.isAuthenticated);
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect("/user/login");
}