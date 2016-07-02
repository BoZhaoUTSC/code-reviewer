var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');



/* GET users listing. */
router.get('/', function(req, res, next) {
	// user authentication
	if (!req.isAuthenticated()) {
		console.log("Please log in");
    return res.redirect('/');
  }
  console.log(req.user.emails[0].value);
  // loop through collection rules
  var rule_model = require('./models/rule_model.js');
  // find all documents in collection rules
	rule_model.find({}, function (err, rules) {
	  if (err) return err;
	  res.render('instructor', { 
	  	title : 'instructor',
	  	rules : rules
	  });
	});
});

module.exports = router;
