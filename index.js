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
const path = require('path');
const port = process.env.PORT || 5000;
const cors = require('cors');
const cookieParser = require('cookie-parser');

// db
var db = require('./config/database');

const axios = require('axios')

const bodyParser = require('body-parser');
const { error } = require('console');
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
app.use(bodyParser.json({ limit: '200mb', extended: true }));


app.use(cookieParser());
app.use(cors({
  origin: '*',
  credentials: true,
}));
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

app.use((req, res, next) => {
  // maybe try use router?
  // learn how to do authorization, validate cookie, check timestamp
  // Set-Cookie: check credentials credentials: 'include'
  console.log(req.headers, req.cookies, req.signedCookies);
  // cookieparser if no use rmb uninstall npm
  res.cookie('cookieName', 'cookieValue', { maxAge: 900000, httpOnly: true, sameSite: 'none', secure: true });
  const base64Credentials = (req.headers.authorization || '').split(' ')[1] || '';
  const [username, password] = Buffer.from(base64Credentials, 'base64').toString().split(':');

  const auth = { username: 'shyechern', password: 'lim123' }
  console.log(username, password, auth.username, auth.password);

  if (username === auth.username && password === auth.password) {
    return next();
  } else {
    res.status(401).send('Authentication required.'); // custom message
  }

  // return next();
});

app.get('/', async (req, res) => {
  // res.send('Hello World!');
  // let data = await db.main();
  // res.render('pages/index', {
  //   data: data
  // })
  // res.send(data);

  res.send({ result: true });
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