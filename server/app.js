require('babel/register')({
  extensions: ['js', '.es', '.es6', '.jsx']
});
const express = require('express');
const path = require('path');
//  const favicon = require('serve-favicon')
//const logger = require('morgan');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const app = express();

// view engine setup
/*  app.set('views', appRoot('views'));
app.engine('html', swig.renderFile);
app.set('view engine', 'html')*/

//  app.use(logger('dev'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, '../client/')));
app.use(express.static(path.join(__dirname, '../client/public')));

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
