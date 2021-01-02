const keyModel = require('../models/KeyModel');
const axios = require('axios');

// call api to get the market return (spy) and update to db
exports.getNewsList = async (req, res) => {
  await keyModel.select({ type: 'Yahoo Finance', source: 'Rapid Api', status: true }).then(async (result) => {
    await axios.get('https://apidojo-yahoo-finance-v1.p.rapidapi.com/news/list', {
      url: '/news/list',
      method: 'get',
      baseUrl: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com',
      headers: {
        'x-rapidapi-key': result.key,
        'x-rapidapi-host': result.host,
        'useQueryString': true
      },
      params: {
        category: req.params.symbol,
        region: 'US',
      },
    }).then(async (axiosRes) => {
      if (axiosRes.data.items.result.length == 0) {
        res.status(404).send({ result: false, message: 'Invalid symbol or no result' });
      } else {
        res.status(200).send({ result: true, message: "Get news list success", data: axiosRes.data });
      }
    }).catch(error => {
      res.status(500).send({ result: false, message: error });
    })
  }).catch(err => {
    res.status(500).send({ result: false, message: err })
  });
};

// Currently no use
exports.getNewsDetail = async (req, res) => {
  await keyModel.select({ type: 'Yahoo Finance', source: 'Rapid Api', status: true }).then(async (result) => {
    await axios.get('https://apidojo-yahoo-finance-v1.p.rapidapi.com/news/v2/get-details', {
      url: '/news/v2/get-details',
      method: 'get',
      baseUrl: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com',
      headers: {
        'x-rapidapi-key': result.key,
        'x-rapidapi-host': result.host,
        'useQueryString': true
      },
      params: {
        uuid: req.params.uuid,
        region: 'US',
      },
    }).then(async (axiosRes) => {
      if (!axiosRes.data.data.contents) {
        res.status(404).send({ result: false, message: 'Invalid uuid or no result' });
      } else {
        res.status(200).send({ result: true, message: "Get news detail success", data: axiosRes.data });
      }
    }).catch(error => {
      res.status(500).send({ result: false, message: error });
    })
  }).catch(err => {
    res.status(500).send({ result: false, message: err })
  });
};

