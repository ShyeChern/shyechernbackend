const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { setRoutes } = require('./routes');

app.use(bodyParser.json({ limit: '200mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

app.use(cookieParser('signedbyshyechern'));

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use((req, res, next) => {

  const base64Credentials = (req.headers.authorization || '').split(' ')[1] || '';
  const [username, password] = Buffer.from(base64Credentials, 'base64').toString().split(':');

  if (username === process.env.AUTH_USERNAME && password === process.env.AUTH_PASSWORD + process.env.AUTH_SALT) {
    return next();
  } else {
    res.status(401).send({ result: false, message: 'Fail Authorization' });
  }

});

setRoutes(app);

module.exports = app;