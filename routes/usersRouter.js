const express = require('express');
const bodyParser = require('body-parser')
const User = require('../models/user')
const passport = require('passport')
const usersRouter = express.Router();
const authenticate = require('../authenticate')
const cors = require('./cors')

usersRouter.use(bodyParser.json())
/* GET users listing. */
usersRouter.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find({})
        .then(leader => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/json')
            res.json(leader)
        },
            err => next(err))
        .catch(err => next(err))
})

usersRouter.post('/signup', cors.corsWithOptions, (req, res, next) => {
    User.register(new User({ username: req.body.username }),
        req.body.password,
        (err, user) => {
            if (err) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.json({ err: err })

            } else {
                if (req.body.firstname)
                    user.firstname = req.body.firstname
                if (req.body.lastname)
                    user.lastname = req.body.lastname

                user.save((err, user) => {
                    if (err) {
                        res.statusCode = 500
                        res.setHeader('Content-Type', 'application/json')
                        res.json({ err: err })
                    }
                    passport.authenticate('local')(req, res, () => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json')
                        res.json({ success: true, status: 'Registration Successful!' })
                    })
                })
            }
        }
    )
})

usersRouter.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id })
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json({ success: true, token, status: 'Login Successful!' })
})

usersRouter.get('/logout', cors.corsWithOptions, (req, res, next) => {
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

usersRouter.get('/facebookToken', passport.authenticate('facebook-token'), (req, res) => {
    if (req.user) {
        const token = authenticate.getToken({ _id: req.user._id })
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json({ success: true, token, status: 'Login Successful!' })
    }
})

module.exports = usersRouter;
