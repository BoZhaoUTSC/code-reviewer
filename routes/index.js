var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var http = require('http');
var router = express.Router();
var fs = require('fs');

//Here we are configuring express to use body-parser as middle-ware.
router.use(bodyParser.urlencoded( {extended: true} ));

// middleware to use for all requests
router.use(function(req, res, next) {
	console.log('Aaaand here we go...');
	next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/*
router.post('/', function(req, res) {
	// open the form
	/*
	var student = new Student({
		last_name: req.body.lastname,
		first_name: req.body.firstname,
		student_number: req.body.studentnumber
	});
	student.save(function (err) {
	  if (err) {
	    console.log(err);
	  } else {
	    console.log(req.body.lastname + " Added");
	    console.log("the number is " + req.body.studentnumber);
	  }
	});
	 res.render('index', { title: 'Express' });
});
*/

router.post('/go_to_instruction', function(req, res, next) {
	res.redirect('/instruction');
});


router.post('/go_to_self_review', function(req, res, next) {
	res.redirect('/self_review');
});


console.log("Connection opened.");

module.exports = router;


