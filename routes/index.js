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
        db.run("CREATE TABLE Students (student_number INT, first_Name TEXT, middle_Name TEXT, last_Name TEXT, student_Mail TEXT, program TEXT, password TEXT)");
 });
    db.close();
}


/* Routes */
router.get('/', function(req, res, next) {

     if(!req.session.username){
       req.session.username = 'Niet ingelogd';
       req.session.showLogin = true;
   }

    res.render('index', {username: req.session.username,
                         showLogin: req.session.showLogin});
});

router.post('/login', function(req, res, next){

    var sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database(file);

    db.serialize(function() {
        db.all("SELECT * FROM Students WHERE student_Mail = (?) OR student_Number = (?)", [req.body.username, req.body.username], (err, rows) => {
        if (err) {
            throw err;

        }
            rows.forEach((row) => {
                if(row.password === req.body.password){
                    console.log('suc6');
                    req.session.username = row.first_Name + " " + row.last_Name;
                    req.session.first_Name = row.first_Name;
                    req.session.middle_Name = row.middle_Name;
                    req.session.last_Name = row.last_Name;
                    req.session.student_Number = row.student_Number;
                    req.session.student_Mail = row.student_Mail;
                    req.session.program = row.program;
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
        res.redirect('/');
    });
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
