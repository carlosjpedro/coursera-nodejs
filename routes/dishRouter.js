const express = require('express')
const bodyParser = require('body-parser')

const dishRouter = express.Router()
const moongoose = require('mongoose')

const Dishes = require('../models/dishes')

dishRouter.use(bodyParser.json())

dishRouter
    .route('/')
    .all((req, res, next) => {
        res.status = 200
        res.setHeader('Content-Type', 'text/plain')
        next()
    })
    .get((req, res, next) => {
        return Dishes.find({}).exec()
            .then(dishes => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(dishes)
            },
                err => next(err))
            .catch(err => next(err))
    })
    .post((req, res, next) => {
        return Dishes.create(req.body)
            .then(dish => {
                res.statusCode = 200
                console.log('Dish Created', dish)
                res.json(dish)

            },
                err => next(err))
            .catch(err => next(err))
    })
    .put((req, res, next) => {
        res.statusCode = 403
        res.end('PUT operation not supported on /dishes')
    })
    .delete((req, res, next) => {
        Dishes.revove({})
            .then(response => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(response)
            },
                err => next(err))
            .catch(err => next(err))
    })

dishRouter
    .route('/:dishId')
    .get((req, res, next) => {
        Dishes
            .findById(req.params.dishId)
            .then(dish => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(dish)
            },
                err => next(err))
            .catch(err => next(err))


        res.end('Will send details of dish: ' + req.params.dishId)
    })
    .post((req, res, next) => {
        res.end('POST operation not supported on /dishes/' + req.params.dishId)
    })
    .put((req, res, next) => {
        Dishes.findByIdAndUpdate(req.params.dishId,
            { $set: req.body }, { new: true })
            .then(dish => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(dish)
            },
                err => next(err))
            .catch(err => next(err))

        res.write('Updating the dish: ' + req.params.dishId + '\n')
        res.end('Will update  ' + req.body.name +
            ' with details : ' + req.body.description)
    })
    .delete((req, res, next) => {
        Dishes.findByIdAndDelete(req.params.dishId,
            { new: true })
            .then(response => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(response)
            },
                err => next(err))
            .catch(err => next(err))
    })


module.exports = dishRouter