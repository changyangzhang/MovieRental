const {Movie, validate} = require('../models/movie');
const {Genre} = require('../models/genre');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

/**
 * @apiDefine Movies Movies endpoints
 */

/**
 * @apiDefine AuthParam
 * @apiParamExample {json} Header-Example:
 *     {
 *       "X-Auth-Token": "eyJhbGciOiJIUzI1NdwdiIsInR5cCI6IkpXVCJ9.eyJfaiOiI1ZDQ0M2M1ZWIzYTdhZTAwMTc5OGE2YmUiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNTY0NzUyOTkwfQ.G50YNshvw_QnQ4vMvYa5M7964134ChAesjUrzrmX_5M"
 *     }
 */

/**
 * @api {GET} /api/movies Get all movies
 * @apiGroup Movies
 */

router.get('/', async (req, res) => {
    const movies = await Movie.find().sort('name');
    res.send(movies);
});

/**
 * @apiDefine MovieParam
 * @apiParamExample {json} Request-Example:
 * {
 *	"title": "dedwd2we",
 *	"genreId" : "5d386e653a89637a2419e4dc",
 *	"numberInStock": 10,
 *   "dailyRentalRate": 2
 * }
 */

/**
 * @api {POST} /api/movies Create a movie
 * @apiGroup Movies
 * @apiUse AuthParam
 * @apiUse MovieParam
 */

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send('Invalid genre.');

    const movie = new Movie({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });
    await movie.save();

    res.send(movie);
});

/**
 * @api {PUT} /api/movies/:id Update a movie
 * @apiGroup Movies
 * @apiUse AuthParam
 * @apiUse MovieParam
 */

router.put('/:id', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send('Invalid genre.');

    const movie = await Movie.findByIdAndUpdate(req.params.id,
        {
            title: req.body.title,
            genre: {
                _id: genre._id,
                name: genre.name
            },
            numberInStock: req.body.numberInStock,
            dailyRentalRate: req.body.dailyRentalRate
        }, { new: true });

    if (!movie) return res.status(404).send('The movie with the given ID was not found.');

    res.send(movie);
});

/**
 * @api {DELETE} /api/movies/:id Delete a movie
 * @apiGroup Movies
 * @apiUse AuthParam
 */

router.delete('/:id', [auth,admin], async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id);

    if (!movie) return res.status(404).send('The movie with the given ID was not found.');

    res.send(movie);
});

/**
 * @api {GET} /api/movies/:id Get a movie
 * @apiGroup Movies
 */

router.get('/:id', async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie) return res.status(404).send('The movie with the given ID was not found.');

    res.send(movie);
});

module.exports = router;