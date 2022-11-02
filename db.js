const dotenv = require("dotenv");
dotenv.config();

const { MongoClient } = require("mongodb");
const uri = process.env.CONNECTIONSTRING;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  module.exports = client;
  console.log("Connection Established");
  const app = require("./app");
  app.listen(process.env.PORT || 8000);
});
