const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash');
require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const auth = require('./authenticate/auth');
const checkoutRouter = require('./routes/checkout');
const receiptRouter = require('./routes/receipt')

const { handlebars } = require('hbs');
const hbs = require('express-handlebars');

hbs.create({}).handlebars.registerHelper('starCmt', function(n, block) {
  let ulBlock = '<ul  class="p_rating">';
  for(let i = 0; i < n; ++i){
    ulBlock += block.fn(i);    
  }
  return (ulBlock + "</ul>");
});
hbs.create({}).handlebars.registerHelper('SingularOrPlural', function(number, block) {
  let converter = block.fn(this);

  if(number == 1){
    converter = number + converter.substring(0, converter.length - 1);
  }
  else {
    converter = number + converter;
  }

  return converter;
});
hbs.create({}).handlebars.registerHelper('MiniImgSlider', function(nameImg, block) {
  console.log("-------------> " + nameImg.length);
  let converter = null;
  if(nameImg !== undefined && nameImg.length > 0){
    converter = block.fn(this);
  }

  return converter;
});
hbs.create({}).handlebars.registerHelper('IsNextPageCmt', function(countPage, block) {
  let converter = null;
  if(countPage > 1){
    converter = block.fn(this);
  }

  return converter;
});
hbs.create({}).handlebars.registerHelper('PageCmtInfo', function(totalPages, currentPage, block) {
  let converter = `<ul class="pagination" id="paginationID">`;
  if(currentPage > 1){
    converter = converter + `<li class="page-item pagination-cmt prev-page"><a class="page-link"><i class="fa fa-angle-left" aria-hidden="true"></i></a></li>`;
  }
  if(currentPage > 2){
    converter = converter + `<li class="page-item pagination-cmt"><a class="page-link">` + (currentPage - 2) + `</a></li>`
  }
  if(currentPage > 1){
    converter = converter + `<li class="page-item pagination-cmt"><a class="page-link">` + (currentPage - 1) + `</a></li>`
  }
  converter = converter + `<li class="page-item pagination-cmt next"><a class="page-link">` + (currentPage) + `</a></li>`  
  if(currentPage + 1 <= totalPages){
    converter = converter + `<li class="page-item pagination-cmt"><a class="page-link">` + (currentPage + 1) + `</a></li>`
  }
  if(currentPage + 2 <= totalPages){
    converter = converter + `<li class="page-item pagination-cmt"><a class="page-link">` + (currentPage + 2) + `</a></li>`
  }
  if(currentPage < totalPages){
    converter = converter + `<li class="page-item pagination-cmt next-page"><a class="page-link"><i class="fa fa-angle-right" aria-hidden="true"></i></a></li>`;
  }

  converter = converter +  ` </ul>`;

  return converter;
});

const app = express();

app.engine( 'hbs', hbs( {
  extname: 'hbs',
  defaultView: 'index',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials/',
  helpers: {
    minus: function(a, b) {
      return a - b;
    }
  }
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
      secure: false,
      maxAge: 3600000 //1 hour
  }
})
);

//Remember me tokens
app.locals.tokens = {}

auth(app);
app.use(flash());

//global user info on header bar
app.use((req, res, next) => {
  let userInfo =
    {
      isLogin: req.isAuthenticated(),
      info: req.user
    }

  res.locals.userInfo = userInfo;

  let message = {
    info: req.flash('message-info'),
    warning: req.flash('message-warning'),
    danger: req.flash('message-danger'),
    error: req.flash('error'),
  }
  //console.log(message);
  res.locals.message = message;
  next();
});

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/products', productsRouter);
app.use('/cart', checkoutRouter);
app.use('/receipt', receiptRouter);

app.use('/contact', (req, res, next) =>
{
  res.render('contact');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('error404');
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
