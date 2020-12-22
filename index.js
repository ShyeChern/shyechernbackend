require('dotenv').config();

require('./config/database');
const config = require('./config/config').getConfig();
const port = config.PORT;


const server = require('./config/server');

server.listen(port).on('error', (err) => {
  console.log('Failed to start');
  console.error(err.message);
  process.exit(0);
}).on('listening', () => {
  console.log(`Listening on port ${port}`);
});

