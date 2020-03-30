var express = require('express');
var router = express.Router();

var fs = require("fs");
var file = __dirname + "/../database/main.db";
var exists = fs.existsSync(file);

/*Seeting up database*/
if(!exists) {
  fs.openSync(file, "w");

   var sqlite3 = require("sqlite3").verbose();
   var db = new sqlite3.Database(file);

    db.serialize(function() {
        db.run("CREATE TABLE Students (student_Number INTEGER PRIMARY KEY AUTOINCREMENT, first_Name TEXT, middle_Name TEXT, last_Name TEXT, student_Mail TEXT UNIQUE, program TEXT, academic_Level INT, password TEXT)"); console.log('created');
 });
    db.close();
}


/* Routes */
router.get('/', function(req, res, next) {

     if(!req.session.username){
       req.session.username = 'Niet ingelogd';
       req.session.showLogin = true;
   }

    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('index', {username: req.session.username,
                         showLogin: req.session.showLogin});
});

router.post('/login', function(req, res, next){

    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

    var sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database(file);

    db.serialize(function() {
        db.all("SELECT * FROM Students WHERE student_Mail = (?) OR student_Number = (?)", [req.body.username, req.body.username], (err, rows) => {
        if (err) {
            throw err;
        }
            rows.forEach((row) => {
                if(row.password === req.body.password){
                    req.session.username = row.first_Name + " " + row.middle_Name + " " + row.last_Name;
                    req.session.first_Name = row.first_Name;
                    req.session.middle_Name = row.middle_Name;
                    req.session.last_Name = row.last_Name;
                    req.session.student_Number = row.student_Number;
                    req.session.student_Mail = row.student_Mail;
                    req.session.program = row.program;
                    req.session.academic_Level = row.academic_Level;
                    req.session.showLogin = false;
                }
            });

             res.render('index', {username: req.session.username,
                                   showLogin: req.session.showLogin});

        });
        db.close();
    });
});

router.get('/logout', function(req, res, next) {
    req.session.destroy((err)=>{
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.redirect('/');
    });
});

router.get('/register', function(req, res, next){
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

    if(!req.session.showLogin){
        res.redirect('/');
    }

     res.render('register', {username: req.session.username,
                             showLogin: req.session.showLogin});
});

router.post('/register', function(req, res, next){

    var sqlite3 = require("sqlite3").verbose();
    var db = new sqlite3.Database(file);

    if(req.body.password === req.body.passwordCheck){
        db.serialize(function() {
        var stmt = db.prepare("INSERT INTO Students VALUES (NULL, ?, ?, ?, ?, ? ,? ,?)");
        stmt.run(req.body.first_Name, req.body.middle_Name, req.body.last_Name, req.body.email, req.body.program, req.body.academic_level, req.body.password);
        stmt.finalize();
        });
        db.close();
       }

   res.render('index', {username: req.session.username,
                             showLogin: req.session.showLogin});
});

//---------------

router.get('/test', function(req, res, next){
    var array = [];

    var sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database(file);

    db.all('SELECT * FROM Students', (err, rows) => {
    if (err) {
    throw err;
    }
    rows.forEach((row) => {
    array.push(row);
    });
        console.log(array);
        res.render('test', {array});
});

  db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
});

});

//------------------

module.exports = router;
