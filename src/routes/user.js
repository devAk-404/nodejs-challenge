const express = require('express');
const bcrypt = require('bcrypt');
const {userModel,postsModel} = require('../models/user');
const { default: mongoose } = require('mongoose');
const user = require('../models/user');
const jwt = require('jsonwebtoken');

//Task 2: login and sign up using brcypt and jwt library
const userRouter = express.Router();

userRouter.post('/signup', (req, res, next) => {
    console.log(req.body.Username);
    bcrypt.hash(req.body.Password, 10, (err, hashed) => {
        if (err) {
            return res.status(401).json({ error: err })
        }
        else {
            const user = new userModel({
                _id: new mongoose.Types.ObjectId(),
                Username: req.body.Username,
                Password: hashed
            })

            user.save()
                .then(result => {
                    res.status(201).json({
                        message: 'User Created Sucessfully',
                        result: result
                    })
                })
                .catch(err => {
                    res.status(409).json({ error: err })
                })

        }
    })

})

userRouter.post('/login', (req, res, next) => {
    userModel.findOne({ Username: req.body.Username })
        .exec()
        .then(user => {
            if (!user)
                return res.status(401).json({ message: 'Username or Password incorrect!!' });
            else
                bcrypt.compare(req.body.Password, user.Password, (err, result) => {
                    console.log(err)
                    if (err) {
                        console.log(err)
                        return res.status(401).json({ message: 'Username or Password incorrect!!' })
                    }
                    if (result) {
                        const token = jwt.sign
                            ({
                                username: user.Username,
                                userId: user._id
                             }
                            , process.env.JWT_KEY,
                            {
                              expiresIn: "1h"
                            })
                        console.log(user.Password);
                        return res.status(200).json(
                            {
                                message: 'User authenticated!',
                                token: token
                            });
                    }

                    return res.status(401).json({ message: 'Username or Password incorrect!!' })
                })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        })
})

module.exports = userRouter;