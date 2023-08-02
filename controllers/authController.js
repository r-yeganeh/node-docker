const User = require('../models/userModel');
const bcrypt = require('bcryptjs');


exports.signUp = async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.create({
            username: username,
            password: await bcrypt.hash(password, 12)
        });
        req.session.user = user;    // login user after sign up
        res.status(201).json({
            status: 'success',
            data: {
                user: user
            }
        })
    }
    catch (e) {
        console.error(e);
        res.status(400).json({
            status: 'fail',
        })
    }
}

exports.login = async (req, res) => {
    try {
        console.log('req.session: ', req.session);
        const {username, password} = req.body;
        const user = await User.findOne({username: username});
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'user not found!'
            })
        }
        if (await bcrypt.compare(password, user.password)) {
            req.session.user = user;
            res.status(200).json({
                status: 'success'
            })
        }
        else {
            res.status(400).json({
                status: 'fail',
                message: 'incorrect credentials!'
            })
        }
    }
    catch (e) {
        console.error(e);
        res.status(400).json({
            status: 'fail',
        })
    }
}