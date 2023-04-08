import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Photo from '../models/photoModel.js';

const createUser = async (req, res) => {

    try {
        const user = await User.create(req.body);
        //res.redirect("/login");
        res.status(201).json(true);
    } catch (error) {

        let errors = {};

        if (error.code === 11000) {
            errors.email = "the email has alread registered";
        }

        if (error.name === "ValidationError") {
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
        }

        console.log(errors);

        res.status(400).json(errors);
    }

}

const loginUser = async (req, res) => {
    try {

        const { username, password } = req.body;
        const user = await User.findOne({ "username": username });
        let same = false;
        if (user) {
            same = await bcrypt.compare(password, user.password);
        }

        if (!user || !same) {
            return res.status(401).json({
                succeded: false,
                error: "there is no such user"
            });
        }

        const token = createToken(user._id);
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24
        });

        res.redirect("/users/dashboard");

    } catch (error) {
        res.status(500).json({
            succeded: false,
            error: error
        });
    }
}

const getAllUsers = async (req, res) => {

    try {

        const users = await User.find({ _id: { $ne: res.locals.user._id } });
        res.status(200).render("users",
            {
                users: users,
                link: "users"
            });

    } catch (error) {
        res.status(500).json({
            succeded: false,
            error: error
        })
    }

}

const getUser = async (req, res) => {

    try {
        const user = await User.findById({ _id: req.params.id });
        const photos = await Photo.find({ user: user._id });

        const isInFollowers = user.followers.some((item) => {
            return item.equals(res.locals.user._id);
        });

        res.status(200).render("user", {
            user: user,
            photos: photos,
            isInFollowers: isInFollowers,
            link: "users"
        });

    } catch (error) {
        res.status(500).json({
            succeded: false,
            error: error
        });
    }
}

const follow = async (req, res) => {
    try {
        let userToFollow = await User.findByIdAndUpdate(
            { _id: req.params.id },
            { $push: { followers: res.locals.user._id } },
            { new: true }
        );

        let currentUser = await User.findByIdAndUpdate(
            { _id: res.locals.user._id },
            { $push: { followings: req.params.id } },
            { new: true }
        );

        res.status(200).redirect(`/users/${req.params.id}`);

    } catch (error) {
        res.status(500).json({
            succeded: false,
            error: error
        });
    }
}

const unfollow = async (req, res) => {
    try {
        let userToUnFollow = await User.findByIdAndUpdate(
            { _id: req.params.id },
            { $pull: { followers: res.locals.user._id } },
            { new: true }
        );

        let currentUser = await User.findByIdAndUpdate(
            { _id: res.locals.user._id },
            { $pull: { followings: req.params.id } },
            { new: true }
        );

        res.status(200).redirect(`/users/${req.params.id}`);


    } catch (error) {
        res.status(500).json({
            succeded: false,
            error: error
        });
    }
}

const getDashboardPage = async (req, res) => {

    var photos = await Photo.find({ user: res.locals.user._id });
    const user = await User.findById({ _id: res.locals.user._id }).populate(["followings", "followers"]);

    res.render("dashboard", {
        photos: photos,
        user: user,
        link: "dashboard"
    });
}


const createToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    })
}

export { createUser, loginUser, getDashboardPage, getAllUsers, getUser, follow, unfollow }