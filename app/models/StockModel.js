const { Decimal128 } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockSchema = new Schema({
  name: String,
  symbol: String,
  beta: Decimal128,
  createdAt: Date,
  updatedAt: Date
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  },
});

const Stock = mongoose.model('Stock', stockSchema);

exports.upsert = (condition, data) => {
  return new Promise((resolve, reject) => {
    Stock.findOneAndUpdate(condition, data, { new: true, rawResult: true, upsert: true }, (err, result) => {
      if (err) {
        reject(err.name + ': ' + err.message);
      } else {
        if (result.lastErrorObject.n > 0) {
          resolve(result.value.toJSON());
        } else {
          reject('Fail to insert or update new stock data');
        }
      }
    })
  });
}

// general get stock
exports.select = (data) => {
  return new Promise((resolve, reject) => {
    Stock.findOne(data)
      .exec((err, doc) => {
        if (err) {
          reject(err.name + ': ' + err.message);
        } else {
          resolve(doc);
        }
      })
  });
}



