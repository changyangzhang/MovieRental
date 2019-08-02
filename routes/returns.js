const express = require('express');
const router = express.Router();
const {Rental} = require('../models/rental');
const {Movie} = require("../models/movie");
const auth = require('../middleware/auth');
const Joi = require('joi');
const validate = require('../middleware/validate');

/**
 * @apiDefine AuthParam
 * @apiParamExample {json} Header-Example:
 *     {
 *       "X-Auth-Token": "eyJhbGciOiJIUzI1NdwdiIsInR5cCI6IkpXVCJ9.eyJfaiOiI1ZDQ0M2M1ZWIzYTdhZTAwMTc5OGE2YmUiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNTY0NzUyOTkwfQ.G50YNshvw_QnQ4vMvYa5M7964134ChAesjUrzrmX_5M"
 *     }
 */

/**
 * @apiDefine ReturnParam
 * @apiParamExample {json} Request-Example:
 * {
 *	"customerId": "5d386e653a89637a2419e4dc",
 *	"movieId" : "5d386e653a89637a2419e4dc",
 * }
 */

/**
 * @api {POST} /api/returns Return a rental
 * @apiGroup Rentals
 * @apiUse AuthParam
 * @apiUse ReturnParam
 */

router.post('/', [auth, validate(validateReturn)], async (req, res) => {
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);
    if(!rental) return res.status(404).send('rental not found');

    if(rental.dateReturned) return res.status(400).send('Return already processed');

    await Movie.update({_id: rental.movie._id}, {
        $inc: { numberInStock : 1}
    });

    rental.return();

    await rental.save();

    res.send(rental)
});


function validateReturn(req) {
    const schema = {
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    };

    return Joi.validate(req, schema);
}


module.exports = router;