const express = require('express')
const bodyParser = require('body-parser')
const Leaders = require('../models/leaders')

const leaderRouter = express.Router()
const authenticate = require('../authenticate')
const cors = require('./cors')

leaderRouter.use(bodyParser.json())

leaderRouter
    .route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200)
    })
    .all((req, res, next) => {
        res.status = 200
        res.setHeader('Content-Type', 'text/plain')
        next()
    })
    .get(cors.cors, (req, res, next) => {
        Leaders.find({})
            .then(leader => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(leader)
            },
                err => next(err))
            .catch(err => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Leaders.create(req.body)
            .then(leader => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                console.log('Leader Created', leader)
                res.json(leader)

            },
                err => next(err))
            .catch(err => next(err))
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403
        res.end('PUT operation not supported on /leaders')
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Leaders.remove({})
            .then(response => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(response)
            },
                err => next(err))
            .catch(err => next(err))
    })

leaderRouter
    .route('/:leaderId')
    .get(cors.cors, (req, res, next) => {
        Leaders
            .findById(req.params.leaderId)
            .then(leader => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(leader)
            },
                err => next(err))
            .catch(err => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.end('POST operation not supported on /leaders/' + req.params.leaderId)
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Leaders.findByIdAndUpdate(req.params.leaderId,
            { $set: req.body }, { new: true })
            .then(leader => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(leader)
            },
                err => next(err))
            .catch(err => next(err))
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Leaders.findByIdAndDelete(req.params.leaderId)
            .then(response => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(response)
            },
                err => next(err))
            .catch(err => next(err))
    })


module.exports = leaderRouter