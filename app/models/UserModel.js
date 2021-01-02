const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username field is required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  webSession: {
    type: String,
    default: ''
  },
  mobileAppSession: {
    type: String,
    default: ''
  },
  stock: [{
    type: ObjectId,
    ref: 'Stock',
    autopopulate: true,
  }],
  role: {
    type: Number,
    get: getRole
  },
  createdAt: Date,
  updatedAt: Date
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true
  },
});

function getRole(role) {
  if (role === 1) {
    return 'Admin';
  } else if (role === 2) {
    return 'User';
  }
}


userSchema.plugin(require('mongoose-autopopulate'));
const User = mongoose.model('User', userSchema);

exports.insert = (data) => {
  return new Promise((resolve, reject) => {
    const user = new User(data);
    user.validate((err) => {
      if (err)
        reject(err)
      else {
        user.save((err, doc) => {
          if (err) {
            reject(err.name + ': ' + err.message);
          } else {
            doc = doc.toJSON();
            delete doc.password;
            resolve(doc);
          }
        });
      }
    })
  });
}

// get user with password
exports.selectWithPass = (username) => {
  return new Promise((resolve, reject) => {
    User.findOne({ username: username })
      .select('+password')
      .exec((err, doc) => {
        if (err) {
          reject(err.name + ': ' + err.message);
        } else {
          resolve(doc);
        }
      })
  });
};


exports.update = (condition, data) => {
  return new Promise((resolve, reject) => {
    User.findOneAndUpdate(condition, data, { new: true, rawResult: true }, (err, result) => {
      if (err) {
        reject(err.name + ': ' + err.message);
      } else {
        if (result.lastErrorObject.n > 0) {
          resolve(result.value.toJSON());
        } else {
          reject('Fail to update user data');
        }

      }
    })
  });
}

// general get user
exports.select = (data) => {
  return new Promise((resolve, reject) => {
    User.findOne(data)
      .exec((err, doc) => {
        if (err) {
          reject(err.name + ': ' + err.message);
        } else {
          resolve(doc);
        }
      })
  });
}