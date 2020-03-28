var express = require('express');
var router = express.Router();

var fs = require("fs");
var file = __dirname + "/../database/test.db";
var exists = fs.existsSync(file);

/* Routes */
router.get('/', function(req, res, next) {

    if(!req.session.username){
        req.session.username = 'Niet ingelogd';
    }

    res.render('index', {username: req.session.username});
});

//------------------

/*creates db file*/


router.post('/login', function(req, res, next){
   /* var sqlite3 = require("sqlite3").verbose();

    let db = new sqlite3.Database(file, (err) => {
        if (err) {
            return console.error(err.message);
    }
    });

    var createlogin ={
        username: req.body.username
    };

    var stmt = db.prepare("INSERT INTO Stuff VALUES (?)");
    stmt.run("Thing #" + createlogin.username);
    stmt.finalize();

    db.serialize(function() {
   db.each("SELECT rowid AS id, thing FROM Stuff", function(err, row) {
       console.log(row.id + ": " + row.thing); });
});

  db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
});
  */  res.render('index', {username: req.session.username});
});



//-----------------




module.exports = router;







