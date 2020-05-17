const express = require('express');
const bodyParser = require('body-parser')
const User = require('../models/user')
const passport = require('passport')
const usersRouter = express.Router();
const authenticate = require('../authenticate')

usersRouter.use(bodyParser.json())
/* GET users listing. */
usersRouter.get('/', (req, res, next) => res.send('respond with a resource'))

usersRouter.post('/signup', (req, res, next) => {
    User.register(new User({ username: req.body.username }),
        req.body.password,
        (err, user) => {
            if (err) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.json({ err: err })

            } else {
                passport.authenticate('local')(req, res, () => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json({ success: true, status: 'Registration Successful!' })
                })
            }
        }
    )
})

usersRouter.post('/login', passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id })
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json({ success: true, token, status: 'Login Successful!' })
})

usersRouter.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy()
        res.clearCookie('session-id')
        res.redirect('/')
    } else {
        let err = new Error('You are not logged in!')
        err.status = 403
        next(err)
    }
})

module.exports = usersRouter;
