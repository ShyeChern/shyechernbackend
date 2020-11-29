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
  let data = await db.main().catch(console.error);
  // res.render('pages/index', {
  //   data: data
  // })
  res.send(data);
  res.end();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});