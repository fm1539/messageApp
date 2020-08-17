const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const ejs = require("ejs")
const cookieParser = require("cookie-parser")
var session = require("express-session")
const { v4: uuidv4 } = require('uuid');
var session = require('client-sessions');

const URI = "mongodb+srv://isfar:testing321@cluster0.jrwic.mongodb.net/data?retryWrites=true&w=majority"

const app = express()

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
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

const logSchema = new mongoose.Schema({
    email: String
})

const User = new mongoose.model("User", userSchema)
const Log = new mongoose.model("Log", logSchema)

app.get('/', function(req, res){
    res.render("index")
})

app.get("/register", function(req, res){
    res.render("register")
})

app.get("/login", function(req, res){
    res.render("login")
})

app.get('/dashboard', function(req, res){
    res.render("dashboard")
})

app.get("/settings", function(req,res){
    console.log(req.session.user.email);
    User.findOne({email: req.session.user.email}, function(err, foundUser){
        if (err){
            console.log(err);
        }
        else{
            var user = { 
                Email: foundUser.email,
                Username: foundUser.username,
                First: foundUser.first,
                Last: foundUser.last
            }
            res.render("settings", {user: user });  
        }
        
    })
    
})


app.post("/login", function(req,res){
    const email = req.body.email
    const password = req.body.password
    // req.session.id = req.session.id || uuidv4()
    req.session.id = "Isfar"
    console.log(req.session.id);
    User.findOne({email: email}, function(err, foundUser){
        if (err){
            console.log(err);
        }
        else{
            if (foundUser){
                if (foundUser.password === password)
                {
                    req.session.user = foundUser;
                    console.log(req.session.user);
                    // req.session.user = email
                    res.redirect("/dashboard")
                
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
    if (pass === reppass){
        const newUser = new User({
            username: req.body.username,
            first: req.body.first,
            last: req.body.last,
            email: req.body.email,
            password: req.body.password
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
})

app.post("/update", function(req,res){
    var query = User.findOne({ 'email': req.session.user.email });
    console.log(query.password);
    
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
        }
    }
    if(i == 0){
        const filter = { username: req.session.user.email };
        const update = { username: focus };

        User.findOneAndUpdate(filter, update);

        console.log(which);
        console.log(focus);
        res.render("settings")
    }
})



app.listen(3000 || process.env.Port, function(){
    console.log("server on 3000");
})