const express = require('express');
const router = express.Router();
const {Genre, validate} = require('../models/genre');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');

/**
 * @apiDefine Genres Genres endpoints
 */

/**
 * @apiDefine AuthParam
 * @apiParamExample {json} Header-Example:
 *     {
 *       "X-Auth-Token": "eyJhbGciOiJIUzI1NdwdiIsInR5cCI6IkpXVCJ9.eyJfaiOiI1ZDQ0M2M1ZWIzYTdhZTAwMTc5OGE2YmUiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNTY0NzUyOTkwfQ.G50YNshvw_QnQ4vMvYa5M7964134ChAesjUrzrmX_5M"
 *     }
 */

/**
 * @api {GET} /api/genres Get all genres
 * @apiGroup Genres
 */

router.get('/', async (req, res) => {
  const genres = await Genre.find().sort('name');
  res.send(genres);
});

/**
 * @apiDefine GenreParam
 * @apiParamExample {json} Request-Example:
 * {
 *	"name": "dedwd2we"
 * }
 */

/**
 * @api {POST} /api/genres Create a genre
 * @apiGroup Genres
 * @apiUse GenreParam
 * @apiUse AuthParam
 */
router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = new Genre({ name: req.body.name });
  await genre.save();

  res.send(genre);
});

/**
 * @api {PUT} /api/genres/:id Update a genre
 * @apiGroup Genres
 * @apiUse GenreParam
 * @apiUse AuthParam
 */
router.put('/:id', [auth,validateObjectId], async (req, res) => {

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
});
/**
 * @api {DELETE} /api/genres/:id Delete a genre
 * @apiGroup Genres
 * @apiUse AuthParam
 */
router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);

  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
});
/**
 * @api {GET} /api/genres/:id Get a genre
 * @apiGroup Genres
 */
router.get('/:id', validateObjectId, async (req, res) => {

  const genre = await Genre.findById(req.params.id);

  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
});


module.exports = router;