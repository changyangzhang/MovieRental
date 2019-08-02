const _ = require('lodash');
const express = require('express');
const router = express.Router();
const {User, validate} = require('../models/user');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

/**
 * @apiDefine Auth Auth endpoints
 */

/**
 * @apiDefine CreateUserParam
 * @apiParamExample {json} Request-Example:
 * {
 *	"name": "dedwd2we",
 *	"email" : "defef2@cc.com",
 *	"password": "12345"
 * }
 */

/**
 * @api {POST} /api/users Register a new user
 * @apiGroup Auth
 * @apiUse CreateUserParam
 * @apiSuccessExample {json} Success-Header-Example:
 *     {
 *       "X-Auth-Token": "eyJhbGciOiJIUzI1NdwdiIsInR5cCI6IkpXVCJ9.eyJfaiOiI1ZDQ0M2M1ZWIzYTdhZTAwMTc5OGE2YmUiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNTY0NzUyOTkwfQ.G50YNshvw_QnQ4vMvYa5M7964134ChAesjUrzrmX_5M"
 *     }
 */
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email });
    if (user) return  res.status(400).send('User already registered.');

    user = new User(_.pick(req.body, ['name','email','password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user,['_id', 'name', 'email']));
});

/**
 * @api {GET} /api/users/me Get my info
 * @apiGroup Auth
 */

router.get('/me', auth, async (req, res)=>{
    const user = await User.findById(req.user._id).select('-password');
    res.send(user)
});



module.exports = router;