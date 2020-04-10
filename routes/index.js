var express = require('express');
var router  = express.Router();
var multer  = require('multer');

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  limits: {fileSize: 1024 * 1024 * 10},
  fileFilter: function(req, fie, cb) {
    if(file.mimetype === "image.jpeg" || file.mimetype === "image/jpg"){
      cb(null, true);
    } else{
      cb(null, false);
    }
  }
});

var upload   = multer({storage: storage});
var fs       = require("fs");
var filePath = __dirname + "/../database/main.db";
var exists   = fs.existsSync(filePath);

/*Seeting up database*/
if(!exists) {
  fs.openSync(filePath, "w");

   var sqlite3 = require("sqlite3").verbose();
   var db = new sqlite3.Database(filePath);

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
  if (!req.session.username) {
    req.session.username  = 'Niet ingelogd';
    req.session.showLogin = true;
  }

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.render('index', { username: req.session.username,
                        showLogin: req.session.showLogin });
});

router.post('/login', function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  var sqlite3 = require("sqlite3").verbose();
  let db      = new sqlite3.Database(filePath);

  db.serialize(function() {
      db.all("SELECT * FROM Students WHERE student_Mail = (?) OR student_Number = (?)", [req.body.username, req.body.username], (err, rows) => {
        if (err) {
          throw err;
        }
        rows.forEach((row) => {
          if (row.password === req.body.password) {
              req.session.username       = row.first_Name + " " + row.middle_Name + " " + row.last_Name;
              req.session.first_Name     = row.first_Name;
              req.session.middle_Name    = row.middle_Name;
              req.session.last_Name      = row.last_Name;
              req.session.student_Number = row.student_Number;
              req.session.student_Mail   = row.student_Mail;
              req.session.program        = row.program;
              req.session.academic_Level = row.academic_Level;
              req.session.showLogin      = false;
          }
        });

        res.render('index', { username: req.session.username,
                              showLogin: req.session.showLogin });
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

router.get('/register', function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  if (!req.session.showLogin) {
    res.redirect('/');
  }

  res.render('register', { username: req.session.username,
                            showLogin: req.session.showLogin });
});

router.post('/register', function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  var sqlite3 = require("sqlite3").verbose();
  var db      = new sqlite3.Database(filePath);

  if (req.body.password === req.body.passwordCheck) {
    db.serialize(function() {
      var stmt = db.prepare("INSERT INTO Students VALUES (NULL, ?, ?, ?, ?, ? ,? ,?, NULL)");
      stmt.run(req.body.first_Name, req.body.middle_Name, req.body.last_Name, req.body.email, req.body.program, req.body.academic_level, req.body.password);
      stmt.finalize();
    });
    db.close();
  }

  res.render('index', { username: req.session.username,
                        showLogin: req.session.showLogin });
});

router.post('/deregister', function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  var sqlite3 = require("sqlite3").verbose();
  var db      = new sqlite3.Database(filePath);

  db.serialize(function() {
    db.run("DELETE FROM Registered WHERE student_Number = ? AND course_Number = ?", [req.session.student_Number, req.body.deregister], function(err) {
    if (err) {
      throw err;
    }
    console.log(`Row(s) deleted ${this.changes}`);
    });
  });
  db.close();

  res.redirect('/acount');
});

router.get('/acount', function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  if (req.session.showLogin) {
      res.redirect('/');
  }

  var sqlite3 = require("sqlite3").verbose();
  var db      = new sqlite3.Database(filePath);
  var array   = [];

  db.serialize(function(){
      db.all("SELECT * FROM Courses INNER JOIN Registered ON Courses.course_Number = Registered.course_Number WHERE student_Number = ?", [req.session.student_Number], (err, rows) => {
        if (err) {
          throw err;
        }

        rows.forEach((row) =>{
            array.push(row);
        });

        res.render('acount', { username: req.session.username,
                               showLogin: req.session.showLogin,
                               firstName: req.session.first_Name,
                               middleName: req.session.middle_Name,
                               lastName: req.session.last_Name,
                               email: req.session.student_Mail,
                               academic: req.session.academic_Level,
                               program: req.session.program,
                               array });
      });
      db.close();
  });
});

router.post('/change', function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  var sqlite3 = require("sqlite3").verbose();
  let db      = new sqlite3.Database(filePath);
  var pass    = '';

  req.session.first_Name     = req.body.first_Name;
  req.session.middle_Name    = req.body.middle_Name;
  req.session.last_Name      = req.body.last_Name;
  req.session.student_Mail   = req.body.email;
  req.session.academic_Level = req.body.academic_level;
  req.session.program        = req.body.program;

  db.serialize(function() {
    db.get("SELECT password FROM Students WHERE student_Number = (?)", [req.session.student_Number], (err, row) => {
      if (err) {
        throw err;
      }

      req.session.pass = row.password;
      if (row.password === req.body.old_pasword && req.body.new_pasword === req.body.paswordCheck) {
        pass = req.body.new_pasword;
      } else{
        pass = row.password;
      }

      let db1 = new sqlite3.Database(filePath);
      db1.serialize(function(){
        db1.run("UPDATE Students SET first_Name = ?, middle_Name = ? , last_Name = ? , student_Mail = ?, program = ?, academic_Level = ?, password = ? WHERE student_Number = ?", [req.session.first_Name, req.session.middle_Name, req.session.last_Name, req.session.student_Mail, req.session.program, req.session.academic_Level, pass, req.session.student_Number], function(err) {

        if(err){
            throw err;
        }
        });
      });
      db1.close();

    });
    db.close();

  });

  req.session.username = req.session.first_Name + " " + req.session.middle_Name + " " + req.session.last_Name;
  res.redirect('/acount');

});


router.get('/delete', function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  var sqlite3 = require("sqlite3").verbose();
  var db      = new sqlite3.Database(filePath);

  db.serialize(function(){
    db.run("DELETE FROM Students WHERE student_Number = ?", [req.session.student_Number], function(err) {

    if (err) {
      throw err;
    }
    });
  });
  db.close();

  res.redirect('/logout');
});

router.post('/zoeken', function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  var defaultValue;
  var array   = [];
  var sqlite3 = require("sqlite3").verbose();
  var db      = new sqlite3.Database(filePath);

  db.serialize(function() {
    if (!req.body.search && !req.body.semester && !req.body.academic_level && !req.body.program) {
      db.all("SELECT * FROM Courses ORDER BY program ASC, academic_Level, semester, title ASC",(err, rows) => {

      if (err) {
        throw err;
      }

      rows.forEach((row) => {
        array.push(row);
      });

      res.render('zoekpagina', { username: req.session.username,
                                 showLogin: req.session.showLogin,
                                 searchValue: req.body.search,
                                 defaultValue: defaultValue,
                                 array });
      });

      if(!req.body.search){
        defaultValue = "zoeken..";
      }
    } else if(!req.body.search && !req.body.semester && !req.body.academic_level && req.body.program) {
      db.all("SELECT * FROM Courses WHERE program LIKE ? ORDER BY program ASC, academic_Level, semester, title ASC", ['%' + req.body.program + '%'] ,(err, rows) => {
        if (err) {
          throw err;
        }

        rows.forEach((row) => {
          array.push(row);
        });

        res.render('zoekpagina', { username: req.session.username,
                                   showLogin: req.session.showLogin,
                                   searchValue: req.body.search,
                                   defaultValue: defaultValue,
                                   array });
      });
    } else if(req.body.search && !req.body.semester && !req.body.academic_level && !req.body.program) {
      db.all("SELECT * FROM Courses WHERE title LIKE ? ORDER BY program ASC, academic_Level, semester, title ASC", ['%' + req.body.search + '%'] ,(err, rows) => {
        if (err) {
          throw err;
        }

        rows.forEach((row) => {
          array.push(row);
        });

        res.render('zoekpagina', { username: req.session.username,
                                   showLogin: req.session.showLogin,
                                   searchValue: req.body.search,
                                   defaultValue: defaultValue,
                                   array });
      });
    } else if(!req.body.search && req.body.semester && req.body.academic_level && req.body.program) {
      db.all("SELECT * FROM Courses WHERE semester = ? AND academic_Level = ? AND program = ? ORDER BY program ASC, academic_Level, semester, title ASC", [req.body.semester, req.body.academic_level, req.body.program] , (err, rows) => {
        if (err) {
          throw err;
        }

        rows.forEach((row) => {
          array.push(row);
        });

        res.render('zoekpagina', { username: req.session.username,
                                   showLogin: req.session.showLogin,
                                   searchValue: req.body.search,
                                   defaultValue: defaultValue,
                                   array });
      });
    } else if(req.body.search && req.body.semester && req.body.academic_level && req.body.program) {
      db.all("SELECT * FROM Courses WHERE title LIKE ? AND semester = ? AND academic_Level = ? AND program = ? ORDER BY program ASC, academic_Level, semester, title ASC", ['%' + req.body.search + '%', req.body.semester, req.body.academic_level, req.body.program] , (err, rows) => {
        if (err) {
          throw err;
        }

        rows.forEach((row) => {
          array.push(row);
        });

        res.render('zoekpagina', { username: req.session.username,
                                   showLogin: req.session.showLogin,
                                   searchValue: req.body.search,
                                   defaultValue: defaultValue,
                                   array });
      });
    }
  });
  db.close();
});


router.post('/goToCourse', function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.query.number) {
    req.body.courseButton = req.query.number;
  }

  var sqlite3 = require("sqlite3").verbose();
  var db      = new sqlite3.Database(filePath);
  var array   = [];

  db.serialize(function() {
    db.get("SELECT * FROM Courses WHERE course_Number = ?", [req.body.courseButton], (err, row) => {
      array.push(row);

      res.render('coursepage',  { username: req.session.username,
                                  showLogin: req.session.showLogin,
                                  program: req.session.program,
                                  academic: req.session.academic_Level,
                                  array });
    });
  });
  db.close();
});

router.get('/goBackToCourse', function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  var sqlite3 = require("sqlite3").verbose();
  var db      = new sqlite3.Database(filePath);
  var array   = [];

  db.serialize(function() {
    db.get("SELECT * FROM Courses WHERE course_Number = ?", [req.query.number], (err, row) => {
        array.push(row);

        res.render('coursepage',  { username: req.session.username,
                                    showLogin: req.session.showLogin,
                                    program: req.session.program,
                                    academic: req.session.academic_Level,
                                    array });
    });
  });
  db.close();
});


router.post('/courseRegister', function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  var sqlite3 = require("sqlite3").verbose();
  var db      = new sqlite3.Database(filePath);
  var db1     = new sqlite3.Database(filePath);
  var array   = [];

  db.serialize(function(){
    db.all("SELECT * FROM Registered WHERE student_Number = ? AND course_Number = ?", [req.session.student_Number, req.body.courseButton], (err, rows) => {
      if((err) => {
        throw err;
      });

      rows.forEach((row) =>{
        array.push(row);
      });

      if (array.length === 0) {
        db1.serialize(function() {
            var stmt = db1.prepare("INSERT INTO Registered VALUES (?, ?)");

            stmt.run(req.session.student_Number, req.body.courseButton);
            stmt.finalize();
        });
        db1.close();
      }
    });
    db.close();
  });

  res.redirect('/goBackToCourse?number=' + req.body.courseButton);
});


// //---------------

// router.get('/test', function(req, res, next){
//     var array = [];

//     var sqlite3 = require("sqlite3").verbose();
//     let db = new sqlite3.Database(filePath);

//     db.all('SELECT * FROM Students', (err, rows) => {
//     if (err) {
//     throw err;
//     }
//     rows.forEach((row) => {
//     array.push(row);
//     });
//         console.log(array);
//         res.render('test', {array});
// });

//   db.close((err) => {
//   if (err) {
//     return console.error(err.message);
//   }
// });

// });

// router.post('/voegtoe', upload.single('uploadImage'), function(req, res, next){
//     var sqlite3 = require("sqlite3").verbose();
//     let db = new sqlite3.Database(filePath);

//     db.serialize(function(){

//         var stmt = db.prepare("INSERT INTO Courses VALUES (NULL, ?, ?, ?, ?, ? ,? ,?, ?)");
//         stmt.run(req.body.titel, req.body.faculteit, req.body.program, req.body.academic_level, req.body.semester, req.body.beschrijving, req.body.naamDocent, req.file.path);
//         stmt.finalize();

//         db.all('SELECT * FROM Courses', (err, rows) => {
//     if (err) {
//     throw err;
//     }
//     rows.forEach((row) => {
//     console.log(row);
//     });

// });

//     });
//     db.close();
//     var array = [];
//     res.render('test', {array});
// });

// router.post('/upload', upload.single('uploadImage') ,function(req, res, next){
// console.log(req.file);

//      res.render('index', {username: req.session.username,
//                          showLogin: req.session.showLogin});
// });
// //------------------

module.exports = router;
