import { connect } from "mongoose";

const mySecret = process.env['mongoDB']


let connectionAttempts = 0;
const maxConnectionAttempts = 5;
const retryInterval = 5000;

const connection = () => {
  if (connectionAttempts < maxConnectionAttempts) {
    connect(`mongodb+srv://Abdul:${encodeURIComponent('ksaha@123')}@kalyke.xbaqzbq.mongodb.net/kalyke?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        console.log("Connection successful with MongoDB");
      })
      .catch((err) => {
        console.log(
          `Connection attempt ${connectionAttempts + 1} failed with MongoDB`
        );
        console.error(err);
        connectionAttempts++;
        setTimeout(connection, retryInterval);
      });
  } else {
    console.log(
      `Maximum connection attempts (${maxConnectionAttempts}) reached. Exiting...`
    );
    process.exit(1);
  }
};

export default connection;
