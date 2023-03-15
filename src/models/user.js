const mongoose = require('mongoose');

const postsSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true
        },
        createdBy: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            required: true
        },
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    }
)

const userSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        Username: {
            type: String,
            required: true,
            unique: true
        },
        Password: {
            type: String,
            required: true,
            minLength: 8
        },
        posts: [postsSchema]

    }
)
const userModel = mongoose.model('user', userSchema);
const postsModel = mongoose.model('posts',postsSchema);
module.exports ={userModel,postsModel};