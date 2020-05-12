var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishRouter')
const leaderRouter = require('./routes/leaderRouter')
const promoRouter = require('./routes/promoRouter')
const Dishes = require('./models/dishes')


const url = 'mongodb://localhost:27017/conFusion'
const connect = mongoose.connect(url)
connect
    .then(db => console.log('Connected to server'))
    .catch((err) => console.log(err))


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const auth = (req, res, next) => {
    let authHeader = req.headers.authorization
    if (authHeader != null) {
        let [user, pass]  = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')
    
        if (user === 'user' && pass === 'password') {
            next()
            return
        }

    }

    let err = new Error('You are not authenticated!');
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    next(err);

}

app.use(auth)

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/leaders', leaderRouter);
app.use('/promos', promoRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status = (err.status || 500);
    res.render('error');
});

module.exports = app;
