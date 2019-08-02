const express = require('express');
const router = express.Router();
const {Customer, validate} = require('../models/customer');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

/**
 * @apiDefine Customers Customers endpoints
 */

/**
 * @apiDefine AuthParam
 * @apiParamExample {json} Header-Example:
 *     {
 *       "X-Auth-Token": "eyJhbGciOiJIUzI1NdwdiIsInR5cCI6IkpXVCJ9.eyJfaiOiI1ZDQ0M2M1ZWIzYTdhZTAwMTc5OGE2YmUiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNTY0NzUyOTkwfQ.G50YNshvw_QnQ4vMvYa5M7964134ChAesjUrzrmX_5M"
 *     }
 */

/**
 * @api {GET} /api/customers Get all customers
 * @apiGroup Customers
 * @apiUse AuthParam
 */

router.get('/', async (req, res) => {
    const customers = await Customer.find().sort('name');
    res.send(customers);
});

/**
 * @apiDefine CustomerParam
 * @apiParamExample {json} Request-Example:
 * {
 *	"name": "dedwd2we",
 *	"isGold" : true,
 *	"phone": "12345"
 * }
 */

/**
 * @api {POST} /api/customers Create a customer
 * @apiGroup Customers
 * @apiUse AuthParam
 * @apiUse CustomerParam
 */

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = new Customer({
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone
    });
    await customer.save();

    res.send(customer);
});

/**
 * @api {PUT} /api/customers/:id Update a customer
 * @apiGroup Customers
 * @apiUse AuthParam
 * @apiUse CustomerParam
 */

router.put('/:id', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            isGold: req.body.isGold,
            phone: req.body.phone
        }, { new: true });

    if (!customer) return res.status(404).send('The customer with the given ID was not found.');

    res.send(customer);
});

/**
 * @api {DELETE} /api/customers/:id Delete a customer
 * @apiGroup Customers
 * @apiUse AuthParam
 */
router.delete('/:id', [auth, admin], async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);

    if (!customer) return res.status(404).send('The customer with the given ID was not found.');

    res.send(customer);
});
/**
 * @api {GET} /api/customers/:id Get a customer
 * @apiGroup Customers
 * @apiUse AuthParam
 */
router.get('/:id', async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) return res.status(404).send('The customer with the given ID was not found.');

    res.send(customer);
});
module.exports = router;