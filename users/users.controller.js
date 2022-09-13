const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const db = require('_helpers/db');
const User = db.User;

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
// router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);
router.get('/audit/auditor', getAll);

module.exports = router;

async function authenticate(req, res, next) {
    ipAddress = req.headers.host.toString()
    loginTime = Date.now()
    const update = {
        "loginTime": loginTime,
        "ipAddress": ipAddress
    }
    console.log(req.params.id)
    try {
        await User.update({ "username": req.body.username }, update)
    } catch (error) {
        console.log(error)
    }

    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

async function getAll(req, res, next) {
    console.log(req.user.sub)
    try {
        const data = await userService.getById(req.user.sub)
        console.log(data)
        if (data.role == 'auditor') {
            try {
                const out = await User.find()
                console.log(out)
                return res.status(200).json({ data: out, message: "all data" })
            } catch (error) {
                return error
            }


        } else {
            return res.status(401).json({ "message": "not having auditor role" })
        }
    } catch (error) {
        console.log(error)
    }



    // try {
    //     const data = await User.find()
    //     console.log(data)
    // } catch (error) {
    //     console.log(error)
    // }

    //     userService.getAll()
    //         .then(users => res.json(users))
    //         .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}