const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    first: String,
    last: String,
    email: String,
    password: String,
    socketid: String,
    chats: [String]
})

const User = new mongoose.model("User", userSchema)


function newSocket(username, id) {
    
    User.findOne( {username: username}, function(err, foundUser) {
        if (err) { 
            console.log(err);
        } else {
            foundUser.socketid =  id
            foundUser.save()
        }
    } )
}



module.exports = { 
    User,
    newSocket
}
