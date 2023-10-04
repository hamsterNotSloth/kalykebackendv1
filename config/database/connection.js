import { connect } from "mongoose";

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;

let connectionAttempts = 0;
const maxConnectionAttempts = 5;
const retryInterval = 5000; 

const connection = () => {
  if (connectionAttempts < maxConnectionAttempts) {
    connect(`mongodb+srv://Abdul:${encodeURIComponent('ksaha@123')}@kalyke.xbaqzbq.mongodb.net/kalyke?retryWrites=true&w=majority`, {})
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
