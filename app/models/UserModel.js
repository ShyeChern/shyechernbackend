const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// object id link to another document
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
    session: {
        type: String,
        default: ''
    },
    stock: {
        type: Array,
        default: []
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

// userSchema.findById = function (cb) {
//     return this.model('user').find({ id: this.id }, cb);
// };

// userSchema.findByUsername = function (cb) {
//     return this.model('user').find({ id: this.id }, cb);
// };

const User = mongoose.model('user', userSchema);

exports.insert = (data) => {
    return new Promise((resolve, reject) => {
        const user = new User({
            username: data.username,
            password: data.password
        });

        user.validate(function (err) {
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

exports.findByUsername = (username) => {
    return new Promise((resolve, reject) => {
        User.findOne({ username: username })
            .select('+password')
            .exec(function (err, doc) {
                if (err) {
                    reject(err.name + ': ' + err.message);
                } else {
                    resolve(doc);
                }
            })
    });
};

exports.findBySession = (session) => {
    return new Promise((resolve, reject) => {
        User.findOne({ session: session })
            .exec(function (err, doc) {
                if (err) {
                    reject(err.name + ': ' + err.message);
                } else {
                    resolve(doc);
                }
            })
    });
};

exports.updateUser = (id, data) => {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({ _id: id }, data, { new: true, rawResult: true }, (err, result) => {
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