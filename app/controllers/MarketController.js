const marketModel = require('../models/MarketModel');
const keyModel = require('../models/KeyModel');
const axios = require('axios');

// call api to get the market return (spy) and update to db
exports.updateMarketReturn = async (req, res) => {
  let currentDate = new Date();
  let endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), (currentDate.getTimezoneOffset() / 60 * -1)).getTime() / 1000;
  let startDate = new Date(currentDate.getFullYear() - 5, currentDate.getMonth(), currentDate.getDate(), (currentDate.getTimezoneOffset() / 60 * -1)).getTime() / 1000;
  const symbol = 'SPY';
  await keyModel.select({ type: 'Yahoo Finance', source: 'Rapid Api', status: true }).then(async (result) => {
    await axios.get('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-historical-data', {
      url: '/stock/v2/get-historical-data',
      method: 'get',
      baseUrl: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com',
      headers: {
        'x-rapidapi-key': result.key,
        'x-rapidapi-host': result.host,
        'useQueryString': true
      },
      params: {
        period1: startDate,
        period2: endDate,
        symbol: symbol,
        filter: 'history',
        frequency: '1mo'
      },
    }).then(async (axiosRes) => {
      if (axiosRes.data == '') {
        res.status(404).send({ result: false, message: 'Invalid symbol or no result' });
      } else {
        let marketPrices = [];
        axiosRes.data.prices.forEach(value => {
          value.hasOwnProperty('adjclose') ? marketPrices.push({ date: new Date(value.date * 1000), price: value.adjclose }) : '';
        });
        marketPrices.sort((a, b) => {
          return a.date - b.date
        });

        let marketReturn = (Math.pow((marketPrices[marketPrices.length - 1].price / marketPrices[0].price), 0.2) - 1).toFixed(4);

        await marketModel.update({ _id: req.params.marketId }, { marketReturn: marketReturn }).then(result => {
          res.status(200).send({ result: true, message: "Update market return success", data: result });
        }).catch(err => {
          res.status(500).send({ result: false, message: err });
        });
      }
    })
      .catch(error => {
        res.status(500).send({ result: false, message: error });
      })
  }).catch(err => {
    res.status(500).send({ result: false, message: err })
  });
};

exports.updateRiskFree = async (req, res) => {

  await marketModel.update({ _id: req.params.marketId }, { riskFree: req.body.riskFree }).then(result => {
    res.status(200).send({ result: true, message: "Update risk free success", data: result });
  }).catch(err => {
    res.status(500).send({ result: false, message: err });
  });

}
exports.getMarket = async (req, res) => {
  await marketModel.select().then(result => {
    if (!result) {
      res.status(404).send({ result: false, message: 'Market data not found' })
    } else {
      res.status(200).send({ result: true, message: 'Get market data success', data: result });
    }
  }).catch(err => {
    res.status(500).send({ result: false, message: err })
  });
};
