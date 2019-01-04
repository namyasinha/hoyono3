var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var bcrypt= require('bcryptjs');
var session = require('express-session');
var upload = require('express-fileupload');


var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'hoyono'
});
connection.connect((err)=>{
    if(!err){
        console.log('Database Connected');
    }
    else {
        console.log('Error Connecting Database');
    }
});

exports.register = function(req,res){
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    let sql = 'SELECT * FROM register WHERE email = ' + mysql.escape(email);
    let query = connection.query(sql,(error,results,fields)=> {
        if (error) {
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        }
        else if(results.length>0)  {
            if(results[0].email == email || results[0].username== username) {
                res.send({
                    "code": 204,
                    "status": "email or username already exists"
                })
            }
        }
        else {
            //crypting password
            //bcrypt.genSalt(10, function (err, salt) {
                //bcrypt.hash(password, salt, function (err, hash) {
                    // Store hash in your password DB.
                    var sql = "INSERT INTO register( username, email, password) VALUES ('" + username + "','" + email + "','" + password + "')";

                    let query = connection.query(sql, (error, results, fields) => {
                        if (error) {
                            console.log("error occurred ", error);
                            res.json(results);
                        }
                        else {
                            console.log('Results', results);
                            res.send({
                                "code": 200,
                                "success": "user registered successfully"
                            })
                        }
                    })
                //});
            //});
        }
    })

}

exports.login = function(req,res) {

    var email = req.body.email;
    var password = req.body.password;
    let sql = 'SELECT * FROM register WHERE email = ' + mysql.escape(email);


    let query = connection.query(sql, function (error, results, fields) {
        if (error) {
            // console.log("error ocurred",error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            // console.log('The solution is: ', results);
            if (results.length > 0) {
                if (results[0].password == password) {
                    req.session.loggedIn = true;
                        req.session.email = email;
                        res.send({"status":"ok"})

                    
                }


                else {
                    res.send({
                        "code": 204,
                        "success": "Email and password does not match"
                    });
                }
            }
            else {
                res.send({
                    "code": 204,
                    "success": "Email does not exits"
                });
            }
        }


    });
}
exports.upload = function(req,res) {
    console.log(req.files);
    console.log(req.session.email);
    var email =req.session.email;
    if (req.files.upfile) {
        var file = req.files.upfile,
            name = file.name,
            type = file.mimetype;
        var uploadpath = __dirname+'/uploads/' + name;


        var sql = "INSERT INTO uploads(upload,email) VALUES ('" + name + "','" + email + "')";
        let query = connection.query(sql, (error, results, fields) => {
            if (error) {
                console.log("error ocurred", error);
                res.json(result)
            }
            else {
                console.log('files uploaded');
                console.log(req.session.email);

            }
        })

        file.mv(uploadpath, function (err) {
            if (err) {
                console.log("File upload failed", name, err);
                res.send("Error Ocurred");
            }
            else {
                console.log("File uploaded", name);
                res.sendFile(__dirname + '/uploads'+'/uploaded.html')
            }
        })
    }
    else{
        res.send("No File Selected!");
        res.end();
    }
}

exports.uploads = function(req,res) {
    var email = req.session.email;

console.log('hey');
    console.log(req.session.email);
    var sql = "SELECT upload AS up FROM uploads WHERE email = '" + email + "'";
    let query = connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log("error ocurred", error);

        }
        else {

            res.json(results);
            console.log(results);

        }
    })

}
exports.uploaded = function(req,res){
    console.log(req.params.id);
   res.sendFile(__dirname + '/uploads/' +req.params.id);
}
