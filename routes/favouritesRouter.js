const express = require('express')
const bodyParser = require('body-parser')
const authenticate = require('../authenticate')
const Favourites = require('../models/favourites')
const Dishes = require('../models/dishes')
const cors = require('./cors')

const favouritesRouter = express.Router()
favouritesRouter.use(bodyParser.json())

favouritesRouter
    .route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .all((req, res, next) => {
        res.status = 200
        res.setHeader('Content-Type', 'text/plain')
        next()
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({ user: req.user._id })
            .populate('user').populate('dishes').then(fav => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(fav)
            }, err => next(err))

    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        if (!req.body || req.body.length === 0) {
            const err = new Error('No dishes provided in request.')
            err.status = 403
            return next(err)
        }

        Favourites.findOne({ user: req.user._id }).then(fav => {
            if (fav === null) {
                Favourites.create({
                    user: req.user._id,
                    dishes: req.body.map(x => x._id)
                }).then(fav => Favourites.findOne({ _id: fav._id })
                    .populate('user').populate('dishes'))
                    .then(fav => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'text/json')
                        res.json(fav)
                    });
            }
            else {
                req.body.forEach(dish => {
                    if (fav.dishes.indexOf(dish._id) >= 0) {
                        const err = new Error('Dish ' + dish._id + ' already a favourite!')
                        err.status = 403
                        return next(err)
                    } else {
                        fav.dishes.push(dish._id)
                    }
                    fav.save().then(fav => Favourites.findOne({ _id: fav._id })
                        .populate('user').populate('dishes'))
                        .then(fav => {
                            res.statusCode = 200
                            res.setHeader('Content-Type', 'text/json')
                            res.json(fav)
                        });
                })
            }
        })
    })


    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.findOneAndDelete({ user: req.user._id }).then(fav => {
            if (fav === null) {
                const err = new Error('User ' + req.user._id + ' does not have favourites!')
                err.status = 403
                next(err)
            } else {
                res.json(fav)
            }
        })
    })

favouritesRouter
    .route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .all((req, res, next) => {
        res.status = 200
        res.setHeader('Content-Type', 'text/plain')
        next()
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Dishes.findOne({ _id: req.params.dishId }).then(dish => {
            if (dish === null) {
                const err = new Error('Dish ' + req.params.dishId + ' not found')
                err.status = 404
                next(err)
            }
            else {
                Favourites.findOne({ user: req.user._id })
                    .then(fav => {
                        if (fav === null) {
                            Favourites.create({ user: req.user._id, dishes: [dish._id] })
                                .then(fav => Favourites.findOne({ _id: fav._id })
                                    .populate('user').populate('dishes'))
                                .then(fav => {
                                    res.statusCode = 200
                                    res.setHeader('Content-Type', 'text/json')
                                    res.json(fav)
                                })
                        }
                        else {
                            if (fav.dishes.indexOf(dish._id) < 0) {
                                fav.dishes.push(dish._id)
                                fav.save()
                                    .then(fav => Favourites.findOne({ _id: fav._id })
                                        .populate('user').populate('dishes'))
                                    .then(fav => {
                                        res.statusCode = 200
                                        res.setHeader('Content-Type', 'text/json')
                                        res.json(fav)
                                    })
                            } else {
                                const err = new Error('Dish ' + dish._id + ' already a favourite!')
                                err.status = 403
                                next(err)
                            }
                        }
                    }).catch(err => next(err))
            }
        })
    })

module.exports = favouritesRouter