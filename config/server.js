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
  
  // basic authorization chg to jwt later
  const base64Credentials = (req.headers.authorization || '').split(' ')[1] || '';
  const [username, password] = Buffer.from(base64Credentials, 'base64').toString().split(':');

  const auth = { username: 'shyechern', password: 'lim123' }

  if (username === auth.username && password === auth.password) {
    return next();
  } else {
    res.status(401).send({ result: false, message: 'Fail Authorization' });
  }

});

setRoutes(app);

module.exports = app;