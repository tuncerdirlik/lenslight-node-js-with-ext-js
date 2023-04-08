import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "username is required"],
        lowercase: true,
        validate: [validator.isAlphanumeric, "only alpahnumeric characters allowed"]
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        validate: [validator.isEmail, "email is not valid"]
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [4, "password must be at least 4 characters"]
    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    followings: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }]
},
    {
        timestamps: true
    });


userSchema.pre("save", function (next) {
    const user = this;
    bcrypt.hash(user.password, 10, (err, hash) => {
        user.password = hash;
        next();
    });
});

const User = mongoose.model("User", userSchema);

export default User;