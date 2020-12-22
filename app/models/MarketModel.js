const { Decimal128 } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const marketSchema = new Schema({
  marketReturn: Decimal128,
  riskFree: Decimal128,
  createdAt: Date,
  updatedAt: Date
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  },
});

const Market = mongoose.model('Market', marketSchema);

exports.update = (condition, data) => {
  return new Promise((resolve, reject) => {
    Market.findOneAndUpdate(condition, data, { new: true, rawResult: true }, (err, result) => {
      if (err) {
        reject(err.name + ': ' + err.message);
      } else {
        if (result.lastErrorObject.n > 0) {
          resolve(result.value.toJSON());
        } else {
          reject('Fail to update market data');
        }

      }
    })
  });
}

exports.select = () => {
  return new Promise((resolve, reject) => {
    Market.findOne({})
      .exec((err, doc) => {
        if (err) {
          reject(err.name + ': ' + err.message);
        } else {
          resolve(doc);
        }
      })
  });
}

