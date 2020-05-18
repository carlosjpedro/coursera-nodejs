const express = require('express')
const bodyParser = require('body-parser')

const dishRouter = express.Router()
const moongoose = require('mongoose')
const authenticate = require('../authenticate')
const cors = require('./cors')

const Dishes = require('../models/dishes')

dishRouter.use(bodyParser.json())

/// Dishes

dishRouter
    .route('/')
    .options(cors.corsWithOptions,(req, res) =>{
        res.sendStatus(200)
    })
    .all((req, res, next) => {
        res.status = 200
        res.setHeader('Content-Type', 'text/plain')
        next()
    })
    .get(cors.cors, (req, res, next) => {
        Dishes.find({}).populate('comments.author')
            .then(dishes => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(dishes)
            },
                err => next(err))
            .catch(err => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.create(req.body)
            .then(dish => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                console.log('Dish Created', dish)
                res.json(dish)

            },
                err => next(err))
            .catch(err => next(err))
    })
    .put( cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403
        res.end('PUT operation not supported on /dishes')
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
        Dishes.remove({})
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
    .options(cors.corsWithOptions,(req, res) =>{
        res.sendStatus(200)
    })
    .get(cors.cors,(req, res, next) => {
        Dishes
            .findById(req.params.dishId)
            .populate('comments.author')
            .then(dish => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(dish)
            },
                err => next(err))
            .catch(err => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
        res.end('POST operation not supported on /dishes/' + req.params.dishId)
    })
    .put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
        Dishes.findByIdAndUpdate(req.params.dishId,
            { $set: req.body }, { new: true })
            .then(dish => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(dish)
            },
                err => next(err))
            .catch(err => next(err))
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findByIdAndDelete(req.params.dishId)
            .then(response => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(response)
            },
                err => next(err))
            .catch(err => next(err))
    })


/// Comments

dishRouter
    .route('/:dishId/comments')
    .options(cors.corsWithOptions,(req, res) =>{
        res.sendStatus(200)
    })
    .all((req, res, next) => {
        res.status = 200
        res.setHeader('Content-Type', 'text/plain')
        next()
    })
    .get(cors.cors,(req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then(dish => {
                if (dish != null) {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'text/json')
                    res.json(dish.comments)
                } else {
                    const err = new Error('Dish ' + req.params.dishId + ' not found')
                    err.status = 404
                    return next(err)
                }
            }, err => next(err))
            .catch(err => next(err))
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId).then(dish => {
            if (dish != null) {
                req.body.author = req.user._id
                dish.comments.push(req.body)
                dish.save()
                    .then(dish => Dishes.findById(dish._id).populate('comments.author').then(dish => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'text/json')
                        res.json(dish)
                    }, err => next(err)))
            } else {
                const err = new Error('Dish ' + req.params.dishId + ' not found')
                err.status = 40
                return next(err)
            }
        }, err => next(err))
            .catch(err => next(err))
    })
    .put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403
        res.end('PUT operation not supported on /dishes'
            + req.params.dishId
            + 'comments')
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId).then(dish => {
            if (dish !== null) {
                for (let i = dish.comments.length - 1; i >= 0; i--) {
                    dish.comments.id(dish.comments[i]._id).remove()
                }

                dish.save()
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/json')
                res.json(dish)
            } else {
                const err = new Error('Dish ' + req.params.dishId + ' not found')
                err.status = 404
                return next(err)
            }
        }, err => next(err))
            .catch(err => next(err))
    })

dishRouter
    .route('/:dishId/comments/:commentId')
    .get(cors.cors,(req, res, next) => {
        Dishes
            .findById(req.params.dishId)
            .populate('comments.author')
            .then(dish => {
                if (dish != null && dish.comments.id(req.params.commentId) != null) {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'text/json')
                    res.json(dish.comments.id(dish.comments.id(req.params.commentId)))
                }
                else if (dish != null) {
                    const err = new Error('Dish ' + req.params.dishId + ' not found')
                    err.status = 404
                    return next(err)
                } else {
                    const err = new Error('Comment ' + req.params.commentId + ' not found')
                    err.status = 404
                    return next(err)
                }
            }, err => next(err))
            .catch(err => next(err))
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        res.end('POST operation not supported on /dishes/'
            + req.params.dishId + '/comments/'
            + req.params.commentId)
    })
    .put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then(dish => {
                if (dish != null && dish.comments.id(req.params.commentId) != null) {
                    let comment = dish.comments.id(req.params.commentId);

                    if(!comment.author.equals(req.user._id))
                    {
                        const err = new Error('Can only edit your comments')
                        err.status = 403
                        return next(err)
                    }
                    if (req.body.rating) {
                        comment.rating = req.body.rating
                    }
                    if (req.body.comment) {
                        comment.comment = req.body.comment
                    }
                    dish.save()
                        .then(dish => {
                            Dishes.findById(dish._id)
                                .populate('comments.author')
                                .then(dish => {
                                    res.statusCode = 200
                                    res.setHeader('Content-Type', 'text/json')
                                    res.json(dish.comments.id(req.params.commentId))
                                })
                        })
                }
                else if (dish != null) {
                    const err = new Error('Dish ' + req.params.dishId + ' not found')
                    err.status = 404
                    return next(err)
                } else {
                    const err = new Error('Comment ' + req.params.commentId + ' not found')
                    err.status = 404
                    return next(err)
                }
            }, err => next(err))
            .catch(err => next(err))
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId).then(dish => {
            if (dish != null && dish.comments.id(req.params.commentId) != null) {

                let comment =dish.comments.id(req.params.commentId) 
                if(!comment.author.equals(req.user._id))
                {
                    const err = new Error('Can only delete your comments')
                    err.status = 403
                    return next(err)
                }

                dish.comments.id(req.params.commentId).remove()
                dish.save().then(dish => {
                    Dishes.findById(dish._id)
                    .populate('comments.author').then(dish => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'text/json')
                        res.json(dish)
                    })
                })
            } else if (dish != null) {
                const err = new Error('Dish ' + req.params.dishId + ' not found')
                err.status = 404
                return next(err)
            } else {
                const err = new Error('Comment ' + req.params.commentId + ' not found')
                err.status = 404
                return next(err)
            }
        }, err => next(err))
            .catch(err => next(err))
    })

module.exports = dishRouter