const express = require('express')
const bodyParser = require('body-parser')
const Promotions = require('../models/promotions')
const promoRouter = express.Router()
const authenticate = require('../authenticate')
const cors = require('./cors')
promoRouter.use(bodyParser.json())
promoRouter
    .route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .all((req, res, next) => {
        res.status = 200
        res.setHeader('Content-Type', 'text/plain')
        next()
    })
    .get(cors.cors, (req, res, next) => {
        Promotions.find({}).exec()
            .then(promos => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(promos)
            },
                err => next(err))
            .catch(err => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promotions.create(req.body)
            .then(promo => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                console.log('Promotion Created', promo)
                res.json(promo)

            },
                err => next(err))
            .catch(err => next(err))
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403
        res.end('PUT operation not supported on /promos')
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promotions.remove({})
            .then(response => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(response)
            },
                err => next(err))
            .catch(err => next(err))
    })

promoRouter
    .route('/:promoId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, (req, res, next) => {
        Promotions
            .findById(req.params.promoId)
            .then(promo => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(promo)
            },
                err => next(err))
            .catch(err => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.end('POST operation not supported on /promos/' + req.params.promoId)
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promotions.findByIdAndUpdate(req.params.promoId,
            { $set: req.body }, { new: true })
            .then(promo => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(promo)
            },
                err => next(err))
            .catch(err => next(err))

        res.write('Updating the promo: ' + req.params.promoId + '\n')
        res.end('Will update  ' + req.body.name +
            ' with details : ' + req.body.description)
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promotions.findByIdAndDelete(req.params.promoId)
            .then(response => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(response)
            },
                err => next(err))
            .catch(err => next(err))
    })

module.exports = promoRouter