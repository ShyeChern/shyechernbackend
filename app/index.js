'use strict';

const userController = require('./controllers/UserController');
const express = require('express');
const router = express.Router();

// User Controller
router.post('/user/checkLogin', (req, res) => {
  userController.checkLogin(req, res);
});

router.post('/user/login', (req, res) => {
  userController.login(req, res);
});

router.post('/user/addUser', (req, res) => {
  userController.addUser(req, res);
});

module.exports = router;
