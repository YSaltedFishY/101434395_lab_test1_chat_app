const mongoose = require('mongoose')

const PrivateMessageSchema = new mongoose.Schema({
    from_user: {
        type: String,
        trim: true,
        required: [true, 'Sender is required']
    },
    to_user: {
        type: String,
        trim: true,
        required: [true, 'Receiver is required']
    },
    message: {
        type: String,
        required: [true, 'Message can not be blanked']
    },
    date_sent: {
        type: Date,
        default: Date.now,
    }
})

const PrivateMessage = mongoose.model("PrivateMessage", PrivateMessageSchema)
module.exports = PrivateMessage