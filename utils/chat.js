const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({
    chatname: String,    
    usernames: [String],
    messages: [[String, String]]
})

const Chat = new mongoose.model("Chat", chatSchema)

module.exports = {Chat};