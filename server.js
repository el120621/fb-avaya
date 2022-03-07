const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Define routers
const facebookRouter = require('./routes/facebook') ;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/webhook', facebookRouter);

// ********* Express server **********
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Now listening on port ${port}...`));