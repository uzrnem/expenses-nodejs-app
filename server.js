const express = require('express');
const bodyParser = require('body-parser');

// create express app
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse requests of content-type - application/json
app.use(bodyParser.json())

app.use('/tags', require('./src/routes/tag.routes'));
app.use('/accounts', require('./src/routes/account.routes'));
app.use('/account_types', require('./src/routes/account_type.routes'));
app.use('/activities', require('./src/routes/activity.routes'));
app.use('/passbooks', require('./src/routes/passbook.routes'));
app.use('/transaction_types', require('./src/routes/transaction_type.routes'));
app.use('/statements', require('./src/routes/statement.routes'));

app.use('/', express.static('public'));

// listen for requests
const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
