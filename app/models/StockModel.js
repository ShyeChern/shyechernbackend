const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const stockSchema = new Schema({
  name: {
  },
  symbol: {
  },
  beta: {
  },
  requiredReturn: {

  },
  actualReturn: {

  },
  createdAt: Date,
  updatedAt: Date
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
    }
  },
});

