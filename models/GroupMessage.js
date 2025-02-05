const mongoose = require('mongoose')

const GroupMessageSchema = new mongoose.Schema({
    from_user: {
        type: String,
        trim: true,
        required: [true, 'User is required']
    },
    room: {
        type: String,
        trim: true,
        required: [true, 'Room is required']
    },
    message: {
        type: String,
        required: [true, 'Message can not be blanked']
    },
    date_sent: {
        type: Date,
        default: Date.now(),
    }
})

const GroupMessage = mongoose.model("GroupMessage", GroupMessageSchema)
module.exports = GroupMessage