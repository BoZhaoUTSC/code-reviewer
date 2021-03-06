var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var fs = require('fs');
// import module mongodb
var code_schema = require("./models/submission_schema.js");
var review_schema = require("./models/review_schema.js");

var rule_model = require("./models/rule_model.js");
var student_model = require('./models/student_model.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
	// user authentication
	if (!req.isAuthenticated()) {
		console.log("Please log in");
    return res.redirect('/');
	}
	student_model.findOne({ email: req.user.emails[0].value }, function (err, student) {
	  if (err) return err;
	  if (student == null) {
	  	res.redirect('/' + req.session.current_site);
	  } else {
	  	if (req.session.current_site != "self_review") {
	  		init_all(req, res, 'self_review');
	  	} else {
	  		find_feedback(req, res, 'self_review');
	  	}
	  }
	 });

});

router.post('/go_to_self_review', function(req, res, next) {
	for (var i = 1; i <= req.session.review_array.length; i++) {
	  var key = "peer_" + String(i);
	  if (key in req.body) {
	    req.session.peer_number = i;
	  }
	}
	res.redirect('/self_review');
});

function init_all(req, res, site) {
	req.session.current_site = site;
	req.session.self_utorid = '';
	req.session.review_array = [];
	req.session.feedbacks = [];
  	req.session.highlight_str = '';
  	req.session.peer_number = 1;
  	req.session.num_stars = 0;
  	req.session.code_path = '';
  	req.session.feedback_questions = [];
  	get_feedback_questions(req, res, site);

}

function get_feedback_questions(req, res, site) {
	rule_model.findOne({ work_name: req.session.work_name }, function (err, rule) {
	  if (err) return err;
	  req.session.feedback_questions = rule.feedback_questions;
	  get_student_utorid(req, res, site);
	 });
}

function get_student_utorid(req, res, site) {
	student_model.findOne({ email: req.user.emails[0].value }, function (err, student) {
	  if (err) return err;
	  req.session.self_utorid = student.utorid;
	  find_student_code(req, res, site);
	 });
}

function find_student_code(req, res, site) {
	console.log(req.session.self_utorid);
	var code_model = mongoose.model(req.session.work_name, code_schema);
  	code_model.findOne({ utorid: req.session.self_utorid }, function(err, code) {
  	req.session.code_path = code.code_path;
  	req.session.review_array = code.review_by;
  	find_feedback(req, res, site);
  });
}

function shuffle_array(req, res, code_array, site) {
  var currentIndex = code_array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = code_array[currentIndex];
    code_array[currentIndex] = code_array[randomIndex];
    code_array[randomIndex] = temporaryValue;
  }
   req.session.review_array = code_array;
  find_feedback(req, res, site);
}

function find_feedback(req, res, site) {
	console.log(req.session.self_utorid);
  var review_model = mongoose.model(req.session.work_name + "_reviews", review_schema);
  review_model.findOne({ author: req.session.self_utorid, review_by: req.session.review_array[req.session.peer_number-1] }, function(err, review) {
	  req.session.feedbacks= review.feedbacks;
	  req.session.num_stars = review.num_stars;
	  req.session.highlight_str = review.highlights;
	  read_file(req, res, site);
  });
  
}

var readline = require('readline');
var stream = require('stream');

function read_file(req, res, site) {
	var instream = fs.createReadStream(req.session.code_path);
	var outstream = new stream;
	var rl = readline.createInterface(instream, outstream);
	var str = "";
	rl.on('line', function(line) {
	  str += line + "\n";
	  //console.log(line);
	});

	rl.on('close', function() {
		res.render(site, {
			title: site,
			entries: req.session.review_array,
			code: str,
			peer_num: req.session.peer_number,
			feedbacks: req.session.feedbacks,
			num_stars: req.session.num_stars,
			init_highligts: req.session.highlight_str,
			feedback_questions: req.session.feedback_questions
		});
	});
}

module.exports = router;
