const { MongoClient } = require('mongodb');

//const url = "mongodb://localhost:3000";

let client = new MongoClient(
  process.env.DB_URI, 
  { useUnifiedTopology: true}
);

let database;

async function connectDB() {
  try {
    await client.connect();
    console.log('DB connected!');
    //console.log(client);
    database = await client.db(process.env.DB_NAME);
  }
  catch (err) {
      return console.log('Database Connection Error!', err.message);
  }
}

connectDB();

const db = () => database;

module.exports.db = db;