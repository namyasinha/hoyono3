var express= require('express');
var app=express();
var bodyParser= require('body-parser');
app.use(bodyParser.urlencoded({extended: false }));
app.use(bodyParser.json());
var router = express.Router();
var path = require('path');
var upload = require('express-fileupload');
var passport=require('passport');
app.use(express.static('../routes/uploads'));

var fs = require('fs');
var exphbs = require('express-handlebars');
app.set('/views',path.join( __dirname + 'views'));

app.engine('handlebars',exphbs({defaultLayout:'main'}))
app.set('view engine','handlebars');
app.use(upload());


var login = require('./routes/loginroutes');

var jwt = require('jsonwebtoken');
var session = require('express-session');
var cors = require('cors');

app.use(bodyParser.json({ type: 'application/*+json' }))

app.use('views', express.static('views'));

var mysql = require('mysql');





app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(session({ resave: true ,secret: '123456' , saveUninitialized: true}));

var checkUser = function(req,res,next){
    if(req.session.loggedIn){
        next();
    }
    else if(req.body.email){
        var admin,password;
        admin = req.body.email;
        password = req.body.password;
        req.session.loggedIn = true;
        console.log(admin);
        res.redirect('/');
    }
    else{
        res.redirect('/');
    }
}

var logout = function(req,res,next){
    req.session.loggedIn = false;
    res.redirect('/');
}


app.get('/',(req,res)=>{
    res.sendFile(__dirname +'/index.html');

});
app.get('/post',checkUser,(req,res)=>{
    res.sendFile(__dirname + '/post.html');
})
app.get('/preupl',checkUser,(req,res)=>{
    res.sendFile(__dirname + '/routes/uploads'+'/uploaded.html');
})
app.get('/register',(req,res)=>{
    res.sendFile(__dirname + '/register.html');
})
app.get('/logout',function(req,res){
    //req.logout();
    req.session.loggedIn=false;
    res.redirect('/');
});


//register route
router.post('/register',login.register);
router.post('/login',login.login);
router.post('/upload',login.upload);
router.post('/uploads',login.uploads);
//router.get('/logout',login.logout);
router.get('/:id',login.uploaded);


app.use('/api',router);

var port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log('listening to port',port);
});
