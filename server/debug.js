/**
 * Created by bob on 13-11-23.
 */
var postProcessor = require('./postProcessor');

postProcessor.indexPostProcess(function(err){
  console.error(err);
});