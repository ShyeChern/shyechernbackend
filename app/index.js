'use strict';

const userController = require('./controllers/UserController');
const authController = require('./controllers/AuthController');
const stockController = require('./controllers/StockController');
const marketController = require('./controllers/MarketController');
const newsController = require('./controllers/NewsController');
const express = require('express');
const router = express.Router();

// session checking middleware for mobile first then follow by web
const sessionChecking = async (req, res, next) => {
  if (typeof req.headers['mobile-app-session'] !== 'undefined') {
    await authController.checkMobileAppSession(req, res).then(result => {
      if (!result) {
        return res.status(401).send({ result: false, message: 'Invalid or no session' });
      } else {
        return next();
      }
    });
  } else if (process.env.ENVIRONMENT === 'Live') {
    await authController.checkWebSession(req, res).then(result => {
      if (!result) {
        return res.status(401).send({ result: false, message: 'Invalid or no session' });
      } else {
        return next();
      }
    });
  } else if (process.env.ENVIRONMENT === 'Local') {
    return next();
  }
}

// session update middleware for mobile first then follow by web
const sessionUpdate = async (req, res, next) => {
  if (typeof req.headers['mobile-app-session'] !== 'undefined') {
    return next();
  } else if (process.env.ENVIRONMENT === 'Live') {
    await authController.updateWebSession(req, res).then(result => {
      if (!result) {
        return res.status(500).send({ result: false, message: 'Fail to update session' });
      } else {
        return next();
      }
    })
  } else if (process.env.ENVIRONMENT === 'Local') {
    return next();
  }
}

/*
  User Controller
*/
router.get('/user/checkLogin', (req, res) => {
  userController.checkLogin(req, res);
});

router.post('/user/checkUpdateMobileAppSession', (req, res) => {
  userController.checkUpdateMobileAppSession(req, res);
});

router.post('/user/login', (req, res) => {
  userController.login(req, res);
});

router.post('/user/signUp', (req, res) => {
  userController.addUser(req, res);
});

router.post('/user/addUser', [sessionChecking, sessionUpdate], (req, res) => {
  userController.addUser(req, res);
});

router.get('/user/getUser/:userId', [sessionChecking], (req, res) => {
  userController.getUser(req, res);
});

router.put('/user/logout/:userId', [sessionChecking], (req, res) => {
  userController.logout(req, res);
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

router.get('/market/getMarket/:userId', [sessionChecking], (req, res) => {
  marketController.getMarket(req, res);
});

/*
  News Controller
*/
router.get('/news/getNewsList/:userId/:symbol', [sessionChecking], (req, res) => {
  newsController.getNewsList(req, res);
});

router.get('/news/getNewsDetail/:userId/:uuid', [sessionChecking], (req, res) => {
  newsController.getNewsDetail(req, res);
});

module.exports = router;
