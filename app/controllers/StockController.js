const stockModel = require('../models/StockModel');

exports.getStock = async (req, res) => {
  await userModel.findByUsername(req.body.username).then(result => {
    res.status(200).send({ result: true, message: 'success', data: result })
  })
    .catch(err => {
      res.status(500).send({ result: false, message: err })
    });

  // if (req.body.username === 'admin' && req.body.password === 'admin') {
  //   res.status(200).send({ result: true, message: 'Login Success' });
  // } else {
  //   res.status(200).send({ result: false, message: 'Invalid Username or Password' });
  // }
}

exports.searchStock = (req, res) => {
  if (req.body.username === 'test' && req.body.password === 'test') {
    res.status(200).send({ result: true, message: 'Login Success' });
  } else {
    res.status(200).send({ result: false, message: 'Invalid Username or Password' });
  }
}
