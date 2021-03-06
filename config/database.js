// const { MongoClient } = require('mongodb');

// require('dotenv').config();

// module.exports.main = async () => {
//   /**
//    * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
//    * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
//    */

//   // const uri = `mongodb+srv://chern_1997:shyechern@shyecherncluster.nvwz2.mongodb.net/<dbname>?retryWrites=true&w=majority`;

//   const uri = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.DBURL}/<dbname>?\
//                 retryWrites=true&w=majority`;
//   const client = new MongoClient(uri, { useUnifiedTopology: true });

//   console.log(uri);
//   try {
//     // Connect to the MongoDB cluster
//     await client.connect();

//     // Make the appropriate DB calls
//     // await listDatabases(client);

//     databasesList = await client.db().admin().listDatabases();

//     // console.log("Databases:");
//     let data = [];
//     databasesList.databases.forEach(db => data.push(`${db.name}`));

//     return data;

//   } catch (e) {
//     console.error(e);
//   } finally {
//     await client.close();
//   }
// }

// async function listDatabases(client) {
//   databasesList = await client.db().admin().listDatabases();

//   console.log("Databases:");
//   databasesList.databases.forEach(db => console.log(` - ${db.name}`));
// };

const mongoose = require('mongoose');
const config = require('./config').getConfig();

class Connection {
  constructor() {
    const url = config.MONGO_URL;

    // mongoose.Promise = global.Promise;
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useUnifiedTopology', true);
    this.connect(url).then(() => {
      console.log('Database Connected');
    }).catch((err) => {
      console.error('Database Error: ', err.message);
    });
  }

  async connect(url) {
    try {
      await mongoose.connect(url);
    } catch (e) {
      throw e;
    }
  }
}

module.exports = new Connection();