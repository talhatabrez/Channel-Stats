const express = require('express')
const app = express();
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

const subscriberRoutes = require('./routes/subscriberRoutes');
const creatorRoutes = require('./routes/creatorRoutes');

app.use('/subscriber', subscriberRoutes);
app.use('/creator', creatorRoutes);

app.listen(PORT, ()=> {
    console.log('listening on port 3000');
})