const userModel = require('../models/UserModel');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// general function for update cookie
const updateCookie = async (res, userId) => {
  return await userModel.update({ _id: userId }, { session: uuidv4() }).then(result => {
    res.cookie('shyechern', result.session, {
      // in milliseconds (1 hour)
      maxAge: 60 * 60 * 1000,
      httpOnly: false,
      sameSite: 'none',
      // secure: true,
      signed: true
    });
    return { result: true, userData: result }
  }).catch(err => {
    return { result: false, message: err }
  });
}


// check login session with cookie, if exist then generate new cookie
exports.checkLogin = async (req, res) => {
  if (req.signedCookies['shyechern'] === undefined) {
    res.status(404).send({ result: false, message: 'Session expired or not login' })
  } else {
    await userModel.select({ session: req.signedCookies['shyechern'] }).then(result => {
      if (!result) {
        res.status(404).send({ result: false, message: 'Invalid Session' })
      } else {
        updateCookie(res, result._id).then(result => {
          if (!result.result) {
            res.status(500).send({ result: false, message: result.message })
          } else {
            res.status(200).send({ result: true, message: 'Login Success.', data: result.userData });
          }
        }).catch(err => {
          res.status(500).send({ result: false, message: err });
        });
      }
    })
      .catch(err => {
        res.status(500).send({ result: false, message: err });
      });
  }
}


// login, if success generate cookie
exports.login = async (req, res) => {
  if (!req.body.username || req.body.username === "" || !req.body.password || req.body.password === "") {
    res.status(404).send({ result: false, message: 'Please fill in username and passowrd' });
  } else {
    await userModel.selectWithPass(req.body.username).then(result => {
      if (!result) {
        res.status(404).send({ result: false, message: 'Invalid username or password' })
      } else {
        const [salt, key] = result.password.split("$");
        let encryptedPassword = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
        if (encryptedPassword !== key) {
          res.status(401).send({ result: false, message: 'Invalid username or password' });
        } else {
          updateCookie(res, result._id).then(result => {
            if (!result.result) {
              res.status(500).send({ result: false, message: result.message })
            } else {
              res.status(200).send({ result: true, message: 'Login Success', data: result.userData });
            }
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
    let data = {
      username: req.body.username,
      password: salt + "$" + hash,
      role: 2,
    };

    await userModel.insert(data).then(result => {
      res.status(201).send({ result: true, message: 'success', data: result })
    })
      .catch(err => {
        res.status(500).send({ result: false, message: err })
      });
  }
}

exports.getUser = async (req, res) => {
  if (req.params.userId === '' || !req.params.userId) {
    res.status(404).send({ result: false, message: 'Empty user id detected' })
  } else {
    await userModel.select({ _id: req.params.userId }).then(result => {
      if (!result) {
        res.status(404).send({ result: false, message: 'User data not found' })
      } else {
        res.status(200).send({ result: true, message: 'Get user data success', data: result });
      }
    })
      .catch(err => {
        res.status(500).send({ result: false, message: err })
      });
  }
}