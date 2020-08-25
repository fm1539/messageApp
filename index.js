const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const ejs = require("ejs")
const http = require('http');
var session = require("express-session")
// const { v4: uuidv4 } = require('uuid');
var session = require('client-sessions');
const socketio = require("socket.io")
const moment = require('moment')
const { User, newSocket } = require("./utils/users.js")
const Friends = require('./utils/friends.js')
const URI = "mongodb+srv://isfar:testing321@cluster0.jrwic.mongodb.net/data?retryWrites=true&w=majority"

const app = express()
const server = http.createServer(app)
const io = socketio(server);

app.use(express.static("public"))
app.use('/views', express.static(__dirname + '/views'))
app.use(bodyParser.urlencoded({extended: true}))
// app.use(cookieParser())   //happened to be here
// app.use(session({
//     genid: function(req) {
//       return uuidv4() // use UUIDs for session IDs
//     },
//     secret: 'keyboard cat'
//   }))


app.use(session({
    cookieName: 'session',
    secret: 'random_string_goes_here',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
  }));

// app.use((req, res, next) => {
//     if (req.cookies.user_sid && !req.session.user) {
//         res.clearCookie('user_sid');        
//     }
//     next();
// });

// var sessionChecker = (req, res, next) => {
//     if (req.session.user && req.cookies.user_sid) {
//         res.redirect('/dashboard');
//     } else {
//         next();
//     }    
// };

app.set('view engine', 'ejs')

const connectDB = async() => {
    await mongoose.connect(URI, {useUnifiedTopology: true, useNewUrlParser: true})
    console.log("db connected!")
}

connectDB()



const logSchema = new mongoose.Schema({
    email: String
})

// const User = new mongoose.model("User", userSchema)
const Log = new mongoose.model("Log", logSchema)


io.on('connection', socket => {
    // Broadcast when user connects
    // socket.broadcast.emit('message',  req.session.user.username + ' has joined the chat'));

    // // Broadcast when user disconnects
    // socket.on('disconnect', function() {
    //     io.emit('message', req.session.user.username + ' has left the chat');
    // });

    //Listen for chatMessage
    socket.on("join", ({ ID }) => {
        newSocket(ID, socket.id)
        console.log(ID);
    })

    socket.on('chatMessage', function(msg) {

        User.findOne( {socketid: socket.id}, function(err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                const message_info = {
                    username: foundUser.username,
                    text: msg,
                    time: moment().format('h:mm a')
                }
                io.emit("chatMessage", message_info)
            }
        })
    } )
})


app.get('/', function(req, res){
    res.render("index")
})

app.get("/register", function(req, res){
    res.render("register")
})

app.get("/login", function(req, res){
    res.render("login")
})

app.get('/messages', function(req, res){
    res.render("messages")
})

app.get('/userinfo', function(req,res){
    const email = req.query.ID
    console.log(email);
    res.render("messages")
})

app.get('/friends', function(req,res){
    const currentUsername = req.session.user.username
    Friends.findOne({username: currentUsername}, function(err, foundUser) {
        if (err) {
            console.log(err);

        }else {
            res.render("friends", { status: "", str: "", requests: foundUser.requests, friends: foundUser.friends, searched_friend: foundUser.searched_friends})
        }
    })
})

app.get("/settings", function(req,res){
    console.log(req.session.user);
    User.findOne({email: req.session.user.email}, function(err, foundUser){
        if (err){
            console.log(err);
        }
        else{
            // console.log(foundUser)
            res.render("settings", {user: foundUser });  
        }
        
    })
    
})

app.post("/login", function(req,res){
    const email = req.body.email
    const password = req.body.password
    // req.session.id = req.session.id || uuidv4()
    User.findOne({email: email}, function(err, foundUser){
        if (err){
            console.log(err);
        }
        else{
            if (foundUser){
                if (foundUser.password === password)
                {
                    req.session.user = foundUser;
                    // req.session.user = email
                    res.redirect("/messages")
                
                }
                else{
                    res.send("ERROR: Email or Password is incorrect")
                }
            }
            else{
                res.send("Doesn't look like a user with this email address exists! Please create an account")
            }
        }
    })
})

app.post("/register", function(req, res){
    var pass = req.body.password
    var reppass = req.body.repeatPass
    User.findOne({username: req.body.username}, function(err, foundUser){
        if (err){
            console.log(err);
        }
        else{
            if (foundUser){
                res.send("username already exists. Choose another one")
                
            }
            else{
                User.findOne({email: req.body.email}, function(err, foundUser){
                    if (err){
                        console.log(err);
                    }
                    else{
                        if (foundUser){
                            res.send("Email already used. Login or choose different email>")
                        }
                        else{
                            if (pass === reppass){
                                const newUser = new User({
                                    username: req.body.username,
                                    first: req.body.first,
                                    last: req.body.last,
                                    email: req.body.email,
                                    password: req.body.password,
                                    socketid: ""
                                })
                                const newFriends = new Friends({
                                    username: req.body.username,
                                    requests: [],                                    
                                    friends: [],
                                    searched_friends: ''
                                })
                                newFriends.save(function(err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                })
                                newUser.save(function(err){
                                    if(err){
                                        console.log(err);
                                    }
                                    else{
                                        res.render("login")
                                    }
                                })
                                
                            }
                        }
                    }
                })
                
            }
        }
    })
    
})

app.post("/settings", function(req,res){
    var user = req.session.user
    console.log(user);
    var which = [
        req.body.username,
        req.body.email,
        req.body.firstName,
        req.body.lastName
    ]

    for (var i = 0; i < which.length; i++){
        if (which[i] !== undefined){
            var focus = which[i]
            var focusIndex = i
            console.log(focus);
            console.log(focusIndex);
        }
    }

    if(focusIndex == 0){
        var id = req.session.user._id
        User.updateOne({_id: id},{username: focus}, function(err, result){

            if(err){
                console.log(err);
            }
            else{
                User.findOne({_id: id}, function(err, user) {
                    res.render("settings", {user: user});
                })
                
            }
    
        })
    } 
    else if (focusIndex == 1){
        var id = req.session.user._id
        User.updateOne({_id: id},{email: focus}, function(err, result){

            if(err){
                console.log(err);
            }
            else{
                User.findOne({_id: id}, function(err, user) {
                    res.render("settings", {user: user});
                })
                
            }
    
        })
    }
    else if (focusIndex == 2){
        var id = req.session.user._id
        User.updateOne({_id: id},{first: focus}, function(err, result){

            if(err){
                console.log(err);
            }
            else{
                User.findOne({_id: id}, function(err, user) {
                    res.render("settings", {user: user});
                })
                
            }

        })
    }
    else if (focusIndex == 3){
        var id = req.session.user._id
        User.updateOne({_id: id},{last: focus}, function(err, result){

            if(err){
                console.log(err);
            }
            else{
                User.findOne({_id: id}, function(err, user) {
                    res.render("settings", {user: user});
                })
                
            }
    
        })
    } 
    
    
})

// app.post("/search", function(req, res){
//     User.findOne({username: req.body.searched_username}, function(err, foundUser){
//         if (err) {
//             console.log(err);
//         } 
//         else {
//             if (foundUser){
//                 if (foundUser.username == req.session.user.username){
//                     res.render("friends", { status: "That's your own username!", str: "", requests: [], friends: []})
//                 }
//                 else{
//                     Friends.updateOne({username: req.session.user.username},{searched_friends: req.body.searched_username}, function(err, result){

//                         if(err){
//                             console.log(err);
//                         }
                
//                     })
//                     res.render("friends", { status: req.body.searched_username, str: "", requests: [], friends: []})
//                 }
//             }
//             else{
//                 var none = "No user with this username"
//                 res.render("friends", { status: none, str: "", requests: [], friends: []})
//             }
//         }
//     })
// })s
app.get("/search", function(req, res){
    const user_name = req.query.ID
    User.findOne({username: user_name}, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser){
                if (foundUser.username == req.session.user.username){
                    //this is your own username. Use flash 
                }
                else{
                    Friends.updateOne({username: req.session.user.username},{searched_friends: user_name}, function(err, result){
                
                        if(err){
                            console.log(err);
                         }
                                
                    })
                                }
                            }
            res.redirect("/friends")
        }
    })
})


// app.post("/add", function(req, res){
//     Friends.findOne({username: req.session.user.username}, function(err, sender){
//         if (err) {
//             console.log(err);
//         } else {
//             Friends.findOne({username: sender.searched_friends}, function(err, receiver){
//                 if (err){
//                     console.log(err);
//                 }
//                 else{
//                     if (sender.requests.includes(receiver.username)) {
//                         res.render("friends", {status : "", str: "This user has already sent you a request.", requests: [], friends: [], searched_friend: ""})
//                     }
//                     else if (receiver.requests.includes(sender.username)){
//                         res.render("friends", {status : "", str: "You have already sent this user a request.", requests: [], friends: [],  searched_friend: ""})
//                     }

//                     else if (receiver.friends.includes(sender.username)) {
//                         res.render("friends", {status : "", str: "You are already friends.", requests: [], friends: [],  searched_friend: ""})
//                     }
//                     else {
//                     receiver.requests.push(sender.username)
//                     receiver.save()
//                     res.render("friends", {status : "", str: "", requests: [], friends: [],  searched_friend: foundUser.searched_friends})
//                     }
//                 }
//             })
            
//         }
//     })
// })

app.get("/add", function(req, res){
    constusername = req.query.ID
    Friends.findOne({username: req.session.user.username}, function(err, sender){
        if (err) {
            console.log(err);
        } else {
            Friends.findOne({username: sender.searched_friends}, function(err, receiver){
                if (err){
                    console.log(err);
                }
                else{
                    if (sender.requests.includes(receiver.username)) {
                        //"This user has already sent you a request." use flash
                    }
                    else if (receiver.requests.includes(sender.username)){
                        //"You have already sent this user a request.", use flash
                    }

                    else if (receiver.friends.includes(sender.username)) {
                    // "You are already friends.", 
                    }
                    else {
                    receiver.requests.push(sender.username)
                    receiver.save()
                    sender.searched_friends = ""
                    sender.save()
                    res.redirect("/friends")
                }
                }
            })
            
        }
    })
})

app.get("/remove_search", function(req,res){
    Friends.findOne({username: req.session.user.username}, function(err,foundUser){
        if (err){
            console.log(err);
        }
        else{
            foundUser.searched_friends = ""
            foundUser.save()
            res.redirect('/friends')
        }
    })
})

app.get('/accept', function(req, res){
    // const q = url.parse("http://localhost:3000/views/friend.ejs")
    // console.log(q);
    const req_index = req.query.ID
    Friends.findOne({username: req.session.user.username}, function(err, foundReceiver) {
        if (err) {
            console.log(err);
        } else {
            foundReceiver.friends.push(foundReceiver.requests[req_index])
            Friends.findOne({username: foundReceiver.requests[req_index]}, function(err, foundSender){
                if (err) {
                    console.log(err);
                } else{
                    foundSender.friends.push(req.session.user.username) 
                    foundSender.save()
                }
            })
            foundReceiver.requests.splice(req_index, req_index+1)
            foundReceiver.save()
            
        }
    })
    
    res.redirect('/friends')
})

app.get('/decline', function (req, res) {
    const req_index = req.query.ID
    Friends.findOne({username: req.session.user.username}, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else{
            foundUser.requests.splice(req_index, req_index+1)
            foundUser.save()
        }
    })
    res.redirect('/friends')
})

app.get('/remove', function (req, res) {
    const friend_index = req.query.ID
    Friends.findOne({username: req.session.user.username}, function(err, remover){
        if (err){
            console.log(err);
        }
        else {
            
            Friends.findOne({username: remover.friends[friend_index]}, function(err, constant) {
                if (err) {
                    console.log(err);
                }
                else{
                    var found = false
                    var i = 0
                    while (!found && i < found.length) {
                        if (constant.friends[i] == req.session.user.username){
                            found = true
                        }
                        else {
                            i++
                        }
                    }
                    console.log(i-1);
                    constant.friends.splice(i, i+1)
                    constant.save()
                }
            })
            remover.friends.splice(friend_index, friend_index+1)
            remover.save()
        }
    })
   res.redirect('/friends')
})

server.listen(3000 || process.env.Port, function(){
    console.log("server on 3000");
})