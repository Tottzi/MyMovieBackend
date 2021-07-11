const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const PORT = process.env.PORT || '5000'
const {moviesApi, usersApi} = require('./db/client/api')
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('DB Connected');
});

const logging = (req, res, next) => {
  const stamp = new Date().toISOString();
  req.requestId = (Math.random().toString(16).substr(2, 8));
  console.log(`Request: ${req.requestId} ${stamp} ${req.method} ${req.headers['content-type']} ${req.originalUrl}`);
  next();
};

const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/user/', logging, usersApi)
app.use('/', logging, moviesApi);

app.all('*', logging, (req, res, next) => {
  next(new Error(`404: Page not found on the following route: ${req.method} ${req.originalUrl}`));
});

app.use((err, req, res, next) => {
  console.log(err.message);
  if (err) {
    const endStatus = Number.isFinite(parseInt(err.message.substr(0, 3), 10))
      ? err.message.substr(0, 3)
      : 400;
    res.status(endStatus).json({ ErrorMessage: err.message });
    next();
  } else {
    res.status(500).json({ ErrorMessage: err.message });
    next();
  }
});

app.listen(PORT, process.env.IP, () => console.log(`listening on port: ${PORT}`))
