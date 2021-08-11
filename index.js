const express = require('express');
const bodyParser = require('body-parser');
const dbConfig = require('./config/db.config');
const mongoose = require('mongoose');
const cors = require("cors");
// const webpush = require('web-push');
require("dotenv").config();


// create express app
const app = express();
app.use(
    cors({
      credentials: true,
      
      optionsSuccessStatus: 200,
    })
  );

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

// Connecting database
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database Connected");
}).catch(err => {
    console.log('Database not connected. Exiting now...', err);
    process.exit();
});
// define a simple route
app.get('/', (req, res) => {
    res.json({"message":"Successfully run your port and connected the database"});
});
// Require Notes routes
require('./app/routes/user.router')(app);


// listen for requests
app.listen(9001, () => {
    console.log("Server is listening on port 9001");
});


//storing the keys in variables
// const publicVapidKey = 'BHEGN9S6KHCnWZVMGXd26HOoKgaDEIb0rUUfuNaEjb_7QQgQxboqT8fukMV_R6syJNUiNVKip13GU7mUA_i996g';
// const privateVapidKey = 'YQbc7FT6XoapEjKR-xyb6gnKApj_DXGwWVN6URJXq7o';

// //setting vapid keys details
// webpush.setVapidDetails('mailto:vivekrai@apptunix.com', publicVapidKey,privateVapidKey);