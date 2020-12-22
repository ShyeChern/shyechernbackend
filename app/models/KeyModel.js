const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const keySchema = new Schema({
  host: String,
  key: String,
  type: String,
  source: String,
  status: Boolean
});

const Key = mongoose.model('Key', keySchema);

// random the key to extend lifespan
// 500 uses per month
exports.select = (data) => {
  return new Promise((resolve, reject) => {
    Key.countDocuments(data).exec((err, count) => {
      if (err) {
        reject(err.name + ': ' + err.message);
      } else {
        let random = Math.floor(Math.random() * count);
        Key.findOne(data)
          .skip(random)
          .exec((err, doc) => {
            if (err) {
              reject(err.name + ': ' + err.message);
            } else {
              resolve(doc);
            }
          })
      }
    })

  });
}
