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
        db.run("CREATE TABLE Students (student_Number INTEGER PRIMARY KEY AUTOINCREMENT, first_Name TEXT, middle_Name TEXT, last_Name TEXT, student_Mail TEXT UNIQUE, program TEXT, academic_Level TEXT, password TEXT, link_Picture_Student TEXT)");

        db.run("CREATE TABLE Courses (course_Number INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, faculty TEXT, program TEXT, academic_Level TEXT, semester TEXT, description TEXT, teacher TEXT, link_Picture_Teacher TEXT)");

        db.run("CREATE TABLE Registered (student_Number INTEGER, course_Number INTEGER)");
        console.log('created');
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
        var stmt = db.prepare("INSERT INTO Students VALUES (NULL, ?, ?, ?, ?, ? ,? ,?, NULL)");
        stmt.run(req.body.first_Name, req.body.middle_Name, req.body.last_Name, req.body.email, req.body.program, req.body.academic_level, req.body.password);
        stmt.finalize();
        });
        db.close();
       }

   res.render('index', {username: req.session.username,
                             showLogin: req.session.showLogin});
});

router.get('/acount', function(req, res, next){
   res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

    if(req.session.showLogin){
        res.redirect('/');
    }

   res.render('acount', {username: req.session.username,
                         showLogin: req.session.showLogin,
                         firstName: req.session.first_Name,
                        middleName: req.session.middle_Name,
                        lastName: req.session.last_Name,
                        email: req.session.student_Mail,
                        academic: req.session.academic_Level});
});

router.post('/change', function(req, res, next){
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

     var sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database(file);

    var pass = '';

        req.session.first_Name = req.body.first_Name;
        req.session.middle_Name = req.body.middle_Name;
        req.session.last_Name = req.body.last_Name;
        req.session.student_Mail = req.body.email;


    if(req.body.academic_Level !== req.session.academic_Level){
        req.session.academic_Level = req.body.academic_level
    }

    if(req.body.program !== req.session.program){
        req.session.program = req.body.program
    }

        db.serialize(function() {
        db.get("SELECT password FROM Students WHERE student_Number = (?)", [req.session.student_Number], (err, row) => {
        if (err) {
            throw err;
        }   req.session.pass = row.password;
                if(row.password === req.body.old_pasword && req.body.new_pasword === req.body.paswordCheck){
                  pass = req.body.new_pasword;
                }else{
                  pass = row.password;
                }

            let db1 = new sqlite3.Database(file);
           db1.serialize(function(){
                db1.run("UPDATE Students SET first_Name = ?, middle_Name = ? , last_Name = ? , student_Mail = ?, program = ?, academic_Level = ?, password = ? WHERE student_Number = ?", [req.session.first_Name, req.session.middle_Name, req.session.last_Name, req.session.student_Mail, req.session.program, req.session.academic_Level, pass, req.session.student_Number], function(err) {

                if(err){
                    throw err;
                }
                // console.log(`Row(s) updated: ${this.changes}`);
            });
           });
            db1.close();

        });

        db.close();
    });

   req.session.username = req.session.first_Name + " " + req.session.middle_Name + " " + req.session.last_Name;

    res.render('index', {username: req.session.username,
                         showLogin: req.session.showLogin});

});


router.get('/delete', function(req, res, next){
     res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

     var sqlite3 = require("sqlite3").verbose();
     var db = new sqlite3.Database(file);

    db.serialize(function(){
        db.run("DELETE FROM Students WHERE student_Number = ?", [req.session.student_Number], function(err) {
        if (err) {
        throw err;
    }
        console.log(`Row(s) deleted ${this.changes}`);
        });
    });
    db.close();

     res.redirect('/logout');
});


router.post('/zoeken', function(req, res, next){
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

    var array = [];
    var defaultValue;
    var sqlite3 = require("sqlite3").verbose();
     var db = new sqlite3.Database(file);

    db.serialize(function(){
        if(!req.body.search && !req.body.semester && !req.body.academic_level && !req.body.program){
            db.all("SELECT * FROM Courses ORDER BY program ASC, academic_Level, semester, title ASC",(err, rows) => {
        if (err) {
            throw err;
        }
            rows.forEach((row) => {
                array.push(row);
            });

                res.render('zoekpagina', {username: req.session.username,
                             showLogin: req.session.showLogin,
                             searchValue: req.body.search,
                              defaultValue: defaultValue,
                                array});
               //  console.log(array);
               // console.log(req.body.search + '1');
        });

              if(!req.body.search){
        defaultValue = "zoeken..";
        }

        }else if(req.body.search && !req.body.semester && !req.body.academic_level && !req.body.program){
            db.all("SELECT * FROM Courses WHERE title LIKE ? ORDER BY program ASC, academic_Level, semester, title ASC", ['%' + req.body.search + '%'] ,(err, rows) => {
        if (err) {
            throw err;
        }
            rows.forEach((row) => {
                array.push(row);
            });
                res.render('zoekpagina', {username: req.session.username,
                             showLogin: req.session.showLogin,
                             searchValue: req.body.search,
                              defaultValue: defaultValue,
                                array});
               //  console.log(array);
                 //console.log(req.body.search + '2');
        });
        }else if(!req.body.search && req.body.semester && req.body.academic_level && req.body.program){
                 db.all("SELECT * FROM Courses WHERE semester = ? AND academic_Level = ? AND program = ? ORDER BY program ASC, academic_Level, semester, title ASC", [req.body.semester, req.body.academic_level, req.body.program] , (err, rows) => {
        if (err) {
            throw err;
        }
            rows.forEach((row) => {
                array.push(row);
            });

                     res.render('zoekpagina', {username: req.session.username,
                             showLogin: req.session.showLogin,
                             searchValue: req.body.search,
                              defaultValue: defaultValue,
                                array});
                // console.log(array);
                 //console.log(req.body.search + '3');
        });
        }else if(req.body.search && req.body.semester && req.body.academic_level && req.body.program){
            db.all("SELECT * FROM Courses WHERE title LIKE ? AND semester = ? AND academic_Level = ? AND program = ? ORDER BY program ASC, academic_Level, semester, title ASC", ['%' + req.body.search + '%', req.body.semester, req.body.academic_level, req.body.program] , (err, rows) => {
        if (err) {
            throw err;
        }
            rows.forEach((row) => {
                array.push(row);
            });

                res.render('zoekpagina', {username: req.session.username,
                             showLogin: req.session.showLogin,
                             searchValue: req.body.search,
                              defaultValue: defaultValue,
                                array});

              //   console.log(array);
                // console.log(req.body.search + '4');
        });
        }
    });
    db.close();
});


router.post('/goToCourse', function(req, res, next){

    console.log(req.body.courseButton);

    res.render('index',  {username: req.session.username,
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




router.post('/voegtoe', function(req, res, next){
    var sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database(file);

    db.serialize(function(){

        var stmt = db.prepare("INSERT INTO Courses VALUES (NULL, ?, ?, ?, ?, ? ,? ,?, ?)");
        stmt.run(req.body.titel, req.body.faculteit, req.body.program, req.body.academic_level, req.body.semester, req.body.beschrijving, req.body.naamDocent, req.body.link);
        stmt.finalize();

        db.all('SELECT * FROM Courses', (err, rows) => {
    if (err) {
    throw err;
    }
    rows.forEach((row) => {
    console.log(row);
    });

});

    });
    db.close();
    var array = [];
    res.render('test', {array});
});
//------------------

module.exports = router;
