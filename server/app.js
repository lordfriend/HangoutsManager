/**
 * Created by bob on 13-11-6.
 */
/*
 * Modules dependency
 */
var express = require('express'),
  path = require('path'),
  http = require('http'),
  index = require('./routes'),
  conversation = require('./routes/conversation'),
  setting = require('./routes/setting'),
  participant = require('./routes/participant'),
  configManager = require('./configManager');

configManager.checkConfigSync();

var app = express();

app.set('port', process.env.port || global.config.server.port);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/api/index', index.indexAPI);

app.get('/api/conversation/:conversationId/date-list', conversation.dataListAPI);
app.post('/api/conversation/:conversationId/events', conversation.eventsAPI);
//app.post('/api/conversation/none/archive', conversation.archive);

app.get('/api/setting/index', setting.checkIndexAPI);
app.post('/api/setting/index', setting.buildIndexAPI);
app.get('/api/setting/index-progress', setting.getBuildProgressAPI);
app.get('/api/setting/proxy', setting.getProxyAPI);
app.post('/api/setting/proxy', setting.setProxyAPI);
app.post('/api/setting/enableProxy', setting.enableProxyAPI);
app.get('/api/setting/timezone', setting.getTimezone);
app.post('/api/setting/timezone', setting.setTimezone);

app.get('/api/participant', participant.participantAPI);
app.get('/api/google', participant.googleAPI);
app.post('/api/participant', participant.saveParticipantAPI);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});