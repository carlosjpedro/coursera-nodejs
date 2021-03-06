var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')
const session = require('express-session')
const fileStore = require('session-file-store')(session)
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/usersRouter');
const dishRouter = require('./routes/dishRouter')
const leaderRouter = require('./routes/leaderRouter')
const promoRouter = require('./routes/promoRouter')
const uploadRouter = require('./routes/uploadRouter')
const favouritesRouter = require('./routes/favouritesRouter')
const Dishes = require('./models/dishes')
const passport = require('passport')
const authenticate = require('./authenticate')
const config = require('./config')
const url = config.mongoUrl
const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

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


app.use(passport.initialize())

app.all('*', (req, res, next) => {

    if (req.secure) {
        return next()
    }

    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url)
})
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(express.static(path.join(__dirname, 'public')));


app.use('/dishes', dishRouter);
app.use('/leaders', leaderRouter);
app.use('/promos', promoRouter);
app.use('/imageUpload', uploadRouter)
app.use('/favourites', favouritesRouter)
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.statusCode = (err.status || 500);
    res.render('error');
});

module.exports = app;
