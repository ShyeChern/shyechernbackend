const userModel = require('../models/UserModel');
const { v4: uuidv4 } = require('uuid');

const getUserId = (req, res) => {
  let userId;
  if (req.method == 'GET') {
    userId = req.params.userId;
  } else if (req.method == 'POST') {
    userId = req.body.userId;
  } else if (req.method == 'PUT') {
    userId = typeof req.body.userId !== 'undefined' ? req.body.userId : req.params.userId;
  }
  return userId;
}

// session checking for middleware
exports.checkSession = async (req, res) => {
  console.log(req.signedCookies['shyechern']);
  const userId = getUserId(req, res);
  if (req.signedCookies['shyechern'] === undefined || !userId || userId === '') {
    return false;
  } else {
    const exist = await userModel.select({ session: req.signedCookies['shyechern'], _id: userId }).then(result => {
      if (!result) {
        return false
      } else {
        return true;
      }
    })
      .catch(err => {
        return false
      });
    return exist;
  }
}

// session update for middleware
exports.updateSession = async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId || userId === '') {
    return false;
  } else {
    const complete = await userModel.update({ _id: userId }, { session: uuidv4() }).then(result => {
      if (!result) {
        return false;
      } else {
        if (process.env.ENVIRONMENT === 'Live') {
          res.cookie('shyechern', result.session, {
            maxAge: 60 * 60 * 1000,
            httpOnly: false,
            sameSite: 'none',
            secure: true,
            signed: true
          });
          return true;
        } else if (process.env.ENVIRONMENT === 'Local') {
          res.cookie('shyechern', result.session, {
            maxAge: 60 * 60 * 1000,
            signed: true
          });
          return true;
        }

      }
    })
      .catch(err => {
        return false
      });
    return complete;
  }
}