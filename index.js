// const express = require('express')
// const path = require('path')
// require('dotenv').config();
// const PORT = process.env.PORT || 5000

// express()
//   .use(express.static(path.join(__dirname, 'public')))
//   .set('views', path.join(__dirname, 'views'))
//   .set('view engine', 'ejs')
//   .get('/', (req, res) => res.render('pages/index'))
//   .listen(PORT, () => console.log(`Listening on ${PORT}`))


const express = require('express')
require('dotenv').config();
const app = express();
const path = require('path')
const port = process.env.PORT || 5000

// db
var db = require('./app/database');

const axios = require('axios')

const bodyParser = require('body-parser');
const { error } = require('console');
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
app.use(bodyParser.json({ limit: '200mb', extended: true }));

app.use(function (req, res, next) {
  // website
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-with,content-type');

  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// app.use(express.static(path.join(__dirname, 'public')))
//   .set('views', path.join(__dirname, 'views'))
//   .set('view engine', 'ejs').
//   get('/', async (req, res) => {
//     // res.send('Hello World!');
//     let data = await db.main();
//     // res.render('pages/index', {
//     //   data: data
//     // })
//     res.send(data);
//     res.end();
//   });

app.get('/', async (req, res) => {
  // res.send('Hello World!');
  let data = await db.main();
  // res.render('pages/index', {
  //   data: data
  // })
  res.send(data);
  res.end();
});

app.get('/getHistoricalData', async (req, res) => {
  let currentDate = new Date();
  let endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 8).getTime() / 1000;
  let startDate = new Date(currentDate.getFullYear() - 5, currentDate.getMonth(), currentDate.getDate(), 8).getTime() / 1000;
  let symbol = req.query.symbol;
  axios
    .get('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-historical-data', {
      url: '/stock/v2/get-historical-data',
      method: 'get',
      baseUrl: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com',
      headers: {
        'x-rapidapi-key': '81dff25889msh3ec83c5fc9f1ae0p169175jsnc049f001c189',
        'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
        'useQueryString': true
      },
      params: {
        period1: startDate,
        period2: endDate,
        symbol: symbol,
        filter: 'history',
        frequency: '1mo'
      },
    })
    .then(axiosRes => {
      if (axiosRes.data == '') {
        res.send({ status: 'fail', message: 'no result' });
      } else {
        res.send({ status: 'success', data: axiosRes.data });
      }

      res.end();
    })
    .catch(error => {
      console.error(error)
      console.log(err)
    })
});

app.get('/test', async (req, res) => {
  axios
    .get('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary', {
      url: '/stock/v2/get-summary',
      method: 'get',
      baseUrl: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com',
      headers: {
        'x-rapidapi-key': '81dff25889msh3ec83c5fc9f1ae0p169175jsnc049f001c189',
        'x-rapidapi-host': '',
        'useQueryString': true
      },
      params: {
        symbol: 'APPL',
        region: 'US'
      },
    })
    .then(axiosRes => {
      console.log(axiosRes.data)
      res.send(axiosRes.data);
      res.end();
    })
    .catch(error => {
      console.error(error)
    })
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});