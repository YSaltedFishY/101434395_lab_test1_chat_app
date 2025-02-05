const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        lowercase: true,
        unique: true
    },
    firstname: {
        type: String,
        require: [true, 'Firstname is required'],
        trim: true,
    },
    lastname:{
        type: String,
        require: [true, 'Firstname is required'],
        trim: true,
    },
    password:{
        type: String,
        required: [true, 'password is required'],
        trim: true
    },
    creation: {
        type: Date,
        default: Date.now,
    }
})

const User = mongoose.model("User", UserSchema)
module.exports = User