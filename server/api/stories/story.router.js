'use strict';

var router = require('express').Router();

var HttpError = require('../../utils/HttpError');
var Story = require('./story.model');
var User = require('../users/user.model')

router.param('id', function (req, res, next, id) {
  Story.findById(id)
  .then(function (story) {
    if (!story) throw HttpError(404);
    req.story = story;
    next();
  })
  .catch(next);
});

router.get('/', function (req, res, next) {
  Story.findAll({
    include: [{model: User, as: 'author'}],
    attributes: {exclude: ['paragraphs']}
  })
  .then(function (stories) {
    res.json(stories);
  })
  .catch(next);
});

router.post('/', function (req, res, next) {
  if(req.user.id === req.body.author_id){
   Story.create(req.body)
    .then(function (story) {
      return story.reload({include: [{model: User, as: 'author'}]});
    })
    .then(function (includingAuthor) {
      res.status(201).json(includingAuthor);
    })
    .catch(next);
  }
  else {
    res.sendStatus(401);
  }
 
});

router.get('/:id', function (req, res, next) {
  req.story.reload({include: [{model: User, as: 'author'}]})
  .then(function (story) {
    res.json(story);
  })
  .catch(next);
});

router.put('/:id', function (req, res, next) {
  //console.log("REQ BODY", req.body);
  if(req.user.id === req.body.author_id || req.user.isAdmin){
  req.story.update(req.body)
  .then(function (story) {
    res.json(story);
  })
  .catch(next);
  }
  else {
    res.sendStatus(401);
  }
});

router.delete('/:id', function (req, res, next) {
  if(req.user.id == req.story.author_id || req.user.isAdmin){
    req.story.destroy()
    .then(function () {
      res.status(204).end();
    })
    .catch(next);
  }
  else {
    res.sendStatus(401);
  }
});

module.exports = router;
