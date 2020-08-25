const mongoose = require("mongoose")

const friendsSchema = new mongoose.Schema({
    username: String,
    requests: [String],
    friends: [String],
    searched_friends: String
})

const Friends = new mongoose.model("Friends", friendsSchema)

module.exports = {Friends};