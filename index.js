require('dotenv').config();

require('./config/database');
const config = require('./config/config').getConfig();
const port = config.PORT;
// const express = require('express');
// const app = express();
// const path = require('path');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const { v4: uuidv4 } = require('uuid');

// db
// var db = require('./config/database');

// const axios = require('axios')


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


// app.get('/getHistoricalData', async (req, res) => {
//   let currentDate = new Date();
//   let endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 8).getTime() / 1000;
//   let startDate = new Date(currentDate.getFullYear() - 5, currentDate.getMonth(), currentDate.getDate(), 8).getTime() / 1000;
//   let symbol = req.query.symbol;
//   axios
//     .get('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-historical-data', {
//       url: '/stock/v2/get-historical-data',
//       method: 'get',
//       baseUrl: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com',
//       headers: {
//         'x-rapidapi-key': '81dff25889msh3ec83c5fc9f1ae0p169175jsnc049f001c189',
//         'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
//         'useQueryString': true
//       },
//       params: {
//         period1: startDate,
//         period2: endDate,
//         symbol: symbol,
//         filter: 'history',
//         frequency: '1mo'
//       },
//     })
//     .then(axiosRes => {
//       if (axiosRes.data == '') {
//         res.send({ status: 'fail', message: 'no result' });
//       } else {
//         res.send({ status: 'success', data: axiosRes.data });
//       }

//       res.end();
//     })
//     .catch(error => {
//       console.error(error)
//       console.log(err)
//     })
// });

// app.get('/test', async (req, res) => {
//   axios
//     .get('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary', {
//       url: '/stock/v2/get-summary',
//       method: 'get',
//       baseUrl: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com',
//       headers: {
//         'x-rapidapi-key': '81dff25889msh3ec83c5fc9f1ae0p169175jsnc049f001c189',
//         'x-rapidapi-host': '',
//         'useQueryString': true
//       },
//       params: {
//         symbol: 'APPL',
//         region: 'US'
//       },
//     })
//     .then(axiosRes => {
//       console.log(axiosRes.data)
//       res.send(axiosRes.data);
//       res.end();
//     })
//     .catch(error => {
//       console.error(error)
//     })
// });


const server = require('./config/server');

server.listen(port).on('error', (err) => {
  console.log('Failed to start');
  console.error(err.message);
  process.exit(0);
}).on('listening', () => {
  console.log(`Listening on port ${port}`);
});

