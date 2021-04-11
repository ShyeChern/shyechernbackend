const userModel = require('../models/UserModel');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// general function for update cookie
const updateCookie = async (req, res, userId) => {
  if (typeof req.headers['mobile-app-session'] !== 'undefined') {
    return await userModel.update({ _id: userId }, { mobileAppSession: uuidv4() }).then(result => {
      return { result: true, userData: result }
    }).catch(err => {
      return { result: false, message: err }
    });
  } else {
    return await userModel.update({ _id: userId }, { webSession: uuidv4() }).then(result => {
      if (process.env.ENVIRONMENT === 'Live') {
        res.cookie('shyechern', result.webSession, {
          // in milliseconds (1 hour)
          maxAge: 60 * 60 * 1000,
          httpOnly: false,
          sameSite: 'none',
          secure: true,
          signed: true
        });
      } else if (process.env.ENVIRONMENT === 'Local') {
        res.cookie('shyechern', result.webSession, {
          maxAge: 60 * 60 * 1000,
          signed: true
        });
      }
      return { result: true, userData: result }
    }).catch(err => {
      return { result: false, message: err }
    });
  }
}

// check login session with cookie, if exist then generate new cookie
exports.checkLogin = async (req, res) => {
  if (req.signedCookies['shyechern'] === undefined) {
    res.status(404).send({ result: false, message: 'Session expired or not login' })
  } else {
    await userModel.select({ webSession: req.signedCookies['shyechern'] }).then(result => {
      if (!result) {
        res.status(404).send({ result: false, message: 'Invalid Session' })
      } else {
        updateCookie(req, res, result._id).then(result => {
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

// check mobile login session, if match generate new session
exports.checkUpdateMobileAppSession = async (req, res) => {
  if (req.headers['mobile-app-session'] === undefined || req.body.userId === '' || !req.body.userId) {
    res.status(404).send({ result: false, message: 'Empty mobile session or user id detected' })
  } else {
    await userModel.select({ mobileAppSession: req.headers['mobile-app-session'], _id: req.body.userId }).then(async (result) => {
      if (!result) {
        res.status(404).send({ result: false, message: 'No session found' })
      } else {
        await userModel.update({ _id: req.body.userId }, { mobileAppSession: uuidv4() }).then(result => {
          res.status(200).send({ result: true, message: 'Session exist', data: result })
        }).catch(err => {
          res.status(500).send({ result: false, message: err });
        });
      }
    }).catch(err => {
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
          updateCookie(req, res, result._id).then(result => {
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
  if (!req.body.username || req.body.username === "" || !req.body.password || req.body.password === ""
    || !req.body.confirmPassword || req.body.confirmPassword === "") {
    res.status(404).send({ result: false, message: 'Please fill in username and passowrd' });
  } else if (req.body.password !== req.body.confirmPassword) {
    res.status(400).send({ result: false, message: 'Password does not matched' });
  } else {
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
    let data = {
      username: req.body.username,
      password: salt + "$" + hash,
      role: 2,
    };

    await userModel.insert(data).then(result => {
      res.status(201).send({ result: true, message: 'Sign up successfully', data: result })
    })
      .catch(err => {
        res.status(500).send({ result: false, message: err })
      });
  }
}

exports.logout = async (req, res) => {
  if (req.params.userId === '' || !req.params.userId) {
    res.status(404).send({ result: false, message: 'Empty user id detected' })
  } else {
    if (typeof req.headers['mobile-app-session'] !== 'undefined') {
      await userModel.update({ _id: req.params.userId }, { mobileAppSession: '' }).then(result => {
        res.status(200).send({ result: true, message: 'Logout successfully' })
      }).catch(err => {
        res.status(500).send({ result: false, message: err })
      });
    } else {
      await userModel.update({ _id: req.params.userId }, { webSession: '' }).then(result => {
        res.cookie('shyechern', result.webSession, {
          maxAge: 0,
          httpOnly: false,
          sameSite: 'none',
          secure: true,
          signed: true
        });
        res.status(200).send({ result: true, message: 'Logout successfully' })
      }).catch(err => {
        res.status(500).send({ result: false, message: err })
      });
    }
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
