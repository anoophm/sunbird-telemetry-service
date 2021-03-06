var winston = require('winston');
require('winston-daily-rotate-file');

const defaultFileOptions = {
    filename: 'dispatcher-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '100m',
    maxFiles: '100',
    zippedArchive: true,
    json: true
}

function Dispatcher (options) {
    if (!options) {
        throw new Error('Dispatcher options are required');
    }
    this.logger = new (winston.Logger)({level: 'info'});
    if(options.dispatcher == 'kafka') {
        require('./kafka-dispatcher');
        this.logger.add(winston.transports.Kafka, options);
        console.log('Kakfa transport enabled !!!');
    } else if(options.dispatcher == 'file') {
        const config = Object.assign(defaultFileOptions, options);
        this.logger.add(winston.transports.DailyRotateFile, config);
        console.log('File transport enabled !!!');
    } else if (options.dispatcher === 'cassandra') {
        const Cassandra = require('./cassandra-dispatcher');
        this.logger.add(winston.transports.Cassandra, options);
        console.log('Cassandra transport enabled !!!');
    } else {
        // Log to console
        const config = Object.assign({json: true, stringify: function(obj){return JSON.stringify(obj)}}, options);
        this.logger.add(winston.transports.Console, config);
        console.log('Console transport enabled !!!');
    }
}

Dispatcher.prototype.dispatch = function(mid, message, cb) {
    this.logger.log('info', message, {mid: mid}, cb);
};

Dispatcher.prototype.health = function(cb) {
    // TODO: here we hardcoded the transport name as kafka. 
    // We should implement health method for other transport and get transport using dispatcher name.
    this.logger.transports['kafka'].health(cb);
};
module.exports.Dispatcher = Dispatcher;