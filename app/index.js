'use strict';

const userController = require('./controllers/UserController');
const authController = require('./controllers/AuthController');
const stockController = require('./controllers/StockController');
const marketController = require('./controllers/MarketController');
const express = require('express');
const router = express.Router();

// session checking middleware
const sessionChecking = async (req, res, next) => {
  // return next();
  await authController.checkSession(req, res).then(result => {
    if (!result) {
      return res.status(401).send({ result: false, message: 'Invalid or no session' });
    } else {
      return next();
    }
  });
}

// session update middleware
const sessionUpdate = async (req, res, next) => {
  // return next();
  await authController.updateSession(req, res).then(result => {
    if (!result) {
      return res.status(500).send({ result: false, message: 'Fail to update session' });
    } else {
      return next();
    }
  })
}

/*
  User Controller
*/
router.get('/user/checkLogin', (req, res) => {
  userController.checkLogin(req, res);
});

router.post('/user/login', (req, res) => {
  userController.login(req, res);
});

router.post('/user/addUser', (req, res) => {
  userController.addUser(req, res);
});

router.get('/user/getUser/:userId', [sessionChecking, sessionUpdate], (req, res) => {
  userController.getUser(req, res);
});

/*
  Stock Controller
*/
router.put('/stock/getStock/:userId', [sessionChecking, sessionUpdate], (req, res) => {
  stockController.getStock(req, res);
});

router.put('/stock/deleteStock/:userId', [sessionChecking, sessionUpdate], (req, res) => {
  stockController.deleteStock(req, res);
});


/*
  Market Controller
*/
router.put('/market/updateMarketReturn/:marketId', [sessionChecking, sessionUpdate], (req, res) => {
  marketController.updateMarketReturn(req, res);
});

router.put('/market/updateRiskFree/:marketId', [sessionChecking, sessionUpdate], (req, res) => {
  marketController.updateRiskFree(req, res);
});

router.get('/market/getMarket/:userId', [sessionChecking, sessionUpdate], (req, res) => {
  marketController.getMarket(req, res);
});


module.exports = router;
