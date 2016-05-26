'use strict';

var router = require('express').Router();

var HttpError = require('../utils/HttpError');
var User = require('../api/users/user.model');

router.post('/login', function (req, res, next) {
  if(!req.user){
  User.findOne({
    where: req.body
  })
  .then(function (user) {
    if (!user) throw HttpError(401);
    req.login(user, function (err) {
      if (err) next(err);
      else res.json(user);
    });
  })
  .catch(next);
  }
  else {
    res.sendStatus(204);
  }
});

router.post('/signup', function (req, res, next) {
  if(!req.user){
      User.create(req.body)
      .then(function (user) {
        req.login(user, function (err) {
          if (err) next(err);
          else res.status(201).json(user);
        });
      })
      .catch(next);
  }
  else {
    res.sendStatus(401);
  }
});

router.get('/me', function (req, res, next) {
  res.json(req.user);
});

router.delete('/me', function (req, res, next) {
  req.logout();
  res.status(204).end();
});

router.use('/google', require('./google.oauth'));

router.use('/twitter', require('./twitter.oauth'));

router.use('/github', require('./github.oauth'));

module.exports = router;
