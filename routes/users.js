const express = require('express');
const bodyParser = require('body-parser')
const User = require('../models/user')
const router = express.Router();


router.use(bodyParser.json())
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
})

router.post('/signup', (req, res, next) => {
    User.findOne({ username: req.body.username })
        .then(user => {
            if (user != null) {
                var err = new Error('User ' + req.body.username + ' already exists.')
                err.status = 403
                next(err)
                return
            }
            return User.create(req.body).then(user => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json({ status: 'Registration Successful!', user: user })
            }, err => next(err))
        })
        .catch(next)
})

rouster.post('/login', (req, res, next) => {
    if (!req.session.user) {
        let authHeader = req.headers.authorization
        if (authHeader != null) {
            let [user, pass] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')

            if (user === 'user' && pass === 'password') {
                req.session.user = 'admin'
                next()
                return
            }

        }
        let err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        next(err);
    } else if (req.session.user === 'admin') {
        next()
    } else {
        let err = new Error('You are not authenticated!');
        err.status = 401;
        next(err);
    }
})

module.exports = router;
