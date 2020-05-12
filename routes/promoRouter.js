const express = require('express')
const bodyParser = require('body-parser')
const Promotions = require('../models/promos')
const promoRouter = express.Router()

promoRouter.use(bodyParser.json())
promoRouter
    .route('/')
    .all((req, res, next) => {
        res.status = 200
        res.setHeader('Content-Type', 'text/plain')
        next()
    })
    .get((req, res, next) => {
        Promotions.find({}).exec()
            .then(promos => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(promos)
            },
                err => next(err))
            .catch(err => next(err))
    })
    .post((req, res, next) => {
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
    .put((req, res, next) => {
        res.statusCode = 403
        res.end('PUT operation not supported on /promos')
    })
    .delete((req, res, next) => {
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
    .get((req, res, next) => {
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
    .post((req, res, next) => {
        res.end('POST operation not supported on /promos/' + req.params.promoId)
    })
    .put((req, res, next) => {
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
    .delete((req, res, next) => {
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