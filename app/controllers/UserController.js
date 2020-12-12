const userModel = require('../models/UserModel');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// check login session with cookie, if exist then generate new cookie
exports.checkLogin = async (req, res) => {
  // res.clearCookie('shyechern');
  if (req.signedCookies['shyechern'] === undefined) {
    res.status(404).send({ result: false, message: 'Session expired or not login' })
  } else {
    await userModel.findBySession(req.signedCookies['shyechern']).then(result => {
      if (!result) {
        res.status(404).send({ result: false, message: 'Invalid Session' })
      } else {
        userModel.updateUser(result.id, { session: uuidv4() }).then(result => {
          res.cookie('shyechern', result.session, {
            // in milliseconds (1 hour)
            maxAge: 60 * 60 * 1000,
            httpOnly: false,
            sameSite: 'none',
            secure: true,
            signed: true
          });
          res.status(200).send({ result: true, message: 'Login Success', data: result });
        }).catch(err => {
          res.status(500).send({ result: false, message: err })
        });
      }
    })
      .catch(err => {
        res.status(500).send({ result: false, message: err })
      });
  }

}

// login, if success generate cookie of 1 hour
exports.login = async (req, res) => {
  if (!req.body.username || req.body.username === "" || !req.body.password || req.body.password === "") {
    res.status(404).send({ result: false, message: 'Please fill in username and passowrd' });
  } else {
    await userModel.findByUsername(req.body.username).then(result => {
      if (!result) {
        res.status(404).send({ result: false, message: 'Username is not exist' })
      } else {
        const [salt, key] = result.password.split("$");
        let encryptedPassword = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
        if (encryptedPassword !== key) {
          res.status(401).send({ result: false, message: 'Password does not matched' });
        } else {
          userModel.updateUser(result.id, { session: uuidv4() }).then(result => {
            res.cookie('shyechern', result.session, {
              // in milliseconds (1 hour)
              maxAge: 60 * 60 * 1000,
              httpOnly: false,
              sameSite: 'none',
              secure: true,
              signed: true
            });
            res.status(200).send({ result: true, message: 'Login Success', data: result });
          }).catch(err => {
            res.status(500).send({ result: false, message: err })
          });
        }
      }
    }).catch(err => {
      res.status(500).send({ result: false, message: err })
    });
  }
}

// add new user
exports.addUser = async (req, res) => {
  if (!req.body.username || req.body.username === "" || !req.body.password || req.body.password === "") {
    res.status(404).send({ result: false, message: 'Please fill in username and passowrd' });
  } else {
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
    req.body.password = salt + "$" + hash;

    await userModel.insert(req.body).then(result => {
      res.status(200).send({ result: true, message: 'success', data: result })
    })
      .catch(err => {
        res.status(500).send({ result: false, message: err })
      });
  }
}