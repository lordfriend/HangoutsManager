/**
 * Use to execute task on an QUEUE
 */
require('setimmediate');
var events = require('events'),
    uuid = require('node-uuid'),
    _ = require('underscore');


var taskQueue = [];
var hasRunningWorker = false;

/**
 * A worker which is used to running a time-consuming job.
 * @param data - the data needed by the executor
 * @param func - a function which to be execute when the worker is running.
 * @constructor - this constructor initialize a Worker and give the context to function passed in as the executor which
 * can retrieve the context to execute callback or access the data property.
 */
function Worker (data, func) {
    this.data = data;
    this.isRunning  = false;
    this.executor = func.bind(this);
    this.id = uuid.v1();
    this.revoked = false;
}

/**
 * This callback must be invoked in the executor when its job has done.
 */
Worker.prototype.callback = function() {
    manager.emit('complete');
    hasRunningWorker = false;
    if(taskQueue.length > 0) {
        manager.emit('loading', taskQueue.length);
    }
};

function QueueManager() {
    events.EventEmitter.call(this);
}
QueueManager.super_ = events.EventEmitter;
QueueManager.prototype = Object.create(events.EventEmitter.prototype, {
    constructor:{
        value: QueueManager,
        enumerable: false
    }
});

/**
 * Add a new Worker
 * @param data - the data need by the executor
 * @param func - will be used as a executor
 */
exports.addWorker = function(data, func){
    var worker = new Worker(data, func);
    taskQueue.push(worker);
    if(!hasRunningWorker) {
        manager.emit('loading', taskQueue.length);
    }
    return worker.id;
};

exports.revokeWorker = function(workerId) {
    return _.find(taskQueue, function(worker){
        if(worker.id == workerId && !worker.isRunning) {
            worker.revoked = true;
        }
    });
}

/**
 * fire up a worker
 */
function loadWorker(length) {
    if(length > 0) {
        var worker = taskQueue.shift();
        if(!!worker.revoked) {
            if(taskQueue.length > 0) {
                manager.emit('loading', taskQueue.length);
            }
            return;
        }
        hasRunningWorker = true;
        worker.isRunning = true;
        setImmediate(function(){
            worker.executor();
        });
    }
}

var manager = new QueueManager();
manager.on('loading', loadWorker);


//exports.queueManager = manager;