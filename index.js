const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const ejs = require("ejs")
const cookieParser = require("cookie-parser")
var session = require("express-session")
// const { v4: uuidv4 } = require('uuid');
var session = require('client-sessions');
const HTMLParser = require('node-html-parser')

const URI = "mongodb+srv://isfar:testing321@cluster0.jrwic.mongodb.net/data?retryWrites=true&w=majority"

const app = express()

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())   //happened to be here
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

const userSchema = new mongoose.Schema({
    username: String,
    first: String,
    last: String,
    email: String,
    password: String
})

const friendsSchema = new mongoose.Schema({
    username: String,
    requests: [String],
    friends: [String],
    searched_friends: String
})


const logSchema = new mongoose.Schema({
    email: String
})

const User = new mongoose.model("User", userSchema)
const Log = new mongoose.model("Log", logSchema)
const Friends = new mongoose.model("Friends", friendsSchema)

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

app.get('/friends', function(req,res){
    const currentUsername = req.session.user.username
    Friends.findOne({username: currentUsername}, function(err, foundUser) {
        if (err) {
            console.log(err);

        }else {
            res.render("friends", { status: "", str: "", requests: foundUser.requests})
        }
    })
    
})

app.get("/settings", function(req,res){
    // console.log(req.session.user.email);
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
                                    password: req.body.password
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

app.post("/search", function(req, res){
    User.findOne({username: req.body.searched_username}, function(err, foundUser){
        if (err) {
            console.log(err);
        } 
        else {
            if (foundUser){
                if (foundUser.username == req.session.user.username){
                    res.render("friends", { status: "That's your own username!", str: "", requests: []})
                }
                else{
                    Friends.updateOne({username: req.session.user.username},{searched_friends: req.body.searched_username}, function(err, result){

                        if(err){
                            console.log(err);
                        }
                
                    })
                    res.render("friends", { status: req.body.searched_username, str: "", requests: []})
                }
            }
            else{
                var none = "No user with this username"
                res.render("friends", { status: none, str: "", requests: []})
            }
        }
    })
})

app.post("/add", function(req, res){
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
                        res.render("friends", {status : "", str: "This user has already sent you a request.", requests: []})
                    }
                    else if (receiver.requests.includes(sender.username)){
                        res.render("friends", {status : "", str: "You have already sent this user a request.", requests: []})
                    }
                    else {
                    receiver.requests.push(sender.username)
                    receiver.save()
                    res.render("friends", {status : "", str: "", requests: []})
                    }
                }
            })
            
        }
    })
})

app.post('/accept', function(req, res){
    var root = HTMLParser.parse('<h2 id="userName"><%= username %></h2>').text
    console.log(root);
})

app.listen(3000 || process.env.Port, function(){
    console.log("server on 3000");
})