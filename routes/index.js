var express = require('express');
var router = express.Router();
var machine = require('../machine_learning');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/train', function(req, res) {
  var snapshot = req.body.image;
  console.log(req.body);
  // var canvas, context;
  // canvas = snapshot._canvas;
  // context = canvas.getContext("2d");
  // var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
  // console.log(imgData);

  res.send('blah');
});

router.get('/predict', function(req, res) {

});

module.exports = router;
