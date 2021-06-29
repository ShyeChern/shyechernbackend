const stockModel = require('../models/StockModel');
const userModel = require('../models/UserModel');
const keyModel = require('../models/KeyModel');
const axios = require('axios')

// get the actual return in last 5 year
const getActualReturn = async (symbol) => {
  let currentDate = new Date();
  let endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), (currentDate.getTimezoneOffset() / 60 * -1)).getTime() / 1000;
  let startDate = new Date(currentDate.getFullYear() - 5, currentDate.getMonth(), currentDate.getDate(), (currentDate.getTimezoneOffset() / 60 * -1)).getTime() / 1000;
  let marketReturn;

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
        marketReturn = 0;
      } else {
        let marketPrices = [];
        axiosRes.data.prices.forEach(value => {
          value.hasOwnProperty('adjclose') && value.adjclose !== null ? marketPrices.push({ date: new Date(value.date * 1000), price: value.adjclose }) : '';
        });
        marketPrices.sort((a, b) => {
          return a.date - b.date
        });
        marketReturn = (Math.pow((marketPrices[marketPrices.length - 1].price / marketPrices[0].price), 0.2) - 1).toFixed(4);
      }
    }).catch(error => {
      marketReturn = 0;
    })
  }).catch(err => {
    marketReturn = 0;
  });
  return marketReturn;
}

// upsert stock summary
const updateStockSummary = async (req, res) => {
  return new Promise((resolve, reject) => {
    keyModel.select({ type: 'Yahoo Finance', source: 'Rapid Api', status: true }).then(async (result) => {
      await axios.get('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary', {
        url: '/stock/v2/get-summary',
        method: 'get',
        baseUrl: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com',
        headers: {
          'x-rapidapi-key': result.key,
          'x-rapidapi-host': result.host,
          'useQueryString': true
        },
        params: {
          symbol: req.body.symbol,
        },
      }).then(async (axiosRes) => {
        if (axiosRes.data == '') {
          res.status(404).send({ result: false, message: 'Invalid symbol or no result' });
        } else {
          let actualReturn = await getActualReturn(req.body.symbol);
          let condition = {
            symbol: axiosRes.data.quoteType.symbol
          };

          let data = {
            name: axiosRes.data.quoteType.shortName,
            symbol: axiosRes.data.quoteType.symbol,
            beta: axiosRes.data.defaultKeyStatistics.beta ? axiosRes.data.defaultKeyStatistics.beta.fmt : 0, // probably need to handle undefined fmt? need more test
            actualReturn: actualReturn
          };
          await stockModel.upsert(condition, data).then(result => {
            resolve(result)
          }).catch(err => {
            reject(err)
          });
        }
      }).catch(err => {
        reject(err)
      })
    }).catch(err => {
      reject(err)
    });
  }).catch(err => {
    reject(err)
  });
}

// add stock to user stock model
const updateUserStock = async (req, res, data) => {
  await userModel.update({ _id: req.params.userId }, { $addToSet: { stock: data.stockId } }).then((result) => {
    res.status(200).send({ result: true, message: 'Get and update stock success', data: result })
  }).catch(err => {
    res.status(500).send({ result: false, message: err })
  });
}

// check stock exist in db. If no get stock data from api
// If yes check last update time, if is same day, add stock to user, else get stock data from api
exports.getStock = async (req, res) => {
  await stockModel.select({ symbol: { $regex: new RegExp("^" + req.body.symbol + '$', "i") } }).then(async (result) => {
    if (!result) {
      await updateStockSummary(req, res).then(result => {
        updateUserStock(req, res, { stockId: result._id });
      }).catch(err => {
        res.status(500).send({ result: false, message: err })
      });
    } else {
      let lastUpdate = new Date(result.updatedAt);
      let nextDay = new Date(lastUpdate.getFullYear(), lastUpdate.getMonth(), lastUpdate.getDate() + 1, (lastUpdate.getTimezoneOffset() / 60 * -1)).getTime();

      if (new Date().getTime() > nextDay) {
        await updateStockSummary(req, res).then(result => {
          updateUserStock(req, res, { stockId: result._id });
        }).catch(err => {
          res.status(500).send({ result: false, message: err })
        });
      } else {
        updateUserStock(req, res, { stockId: result._id });
      }
    }
  }).catch(err => {
    res.status(500).send({ result: false, message: err })
  });
};

// get all the stock available in the db
exports.getSampleStock = async (req, res) => {
  await stockModel.selectAll({}).then(async (result) => {
    res.status(200).send({ result: true, message: 'Get sample stock success', data: result });
  }).catch(err => {
    res.status(500).send({ result: false, message: err })
  });
};

//use pull to take out mongoose stock
exports.deleteStock = async (req, res) => {
  await userModel.update({ _id: req.params.userId }, { $pull: { stock: req.body.stockId } }).then((result) => {
    res.status(200).send({ result: true, message: 'Delete stock success', data: result })
  }).catch(err => {
    res.status(500).send({ result: false, message: err })
  });
}




