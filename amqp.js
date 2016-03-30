/* global process */
/* global Buffer */
var amqplib = require('amqplib');

var DEFAULT_URL = process.env['CLOUDAMQP_URL'] || 'amqp://localhost';

function Sender(channel, queue) {
    this.channel = channel;
    this.queue = queue;
    channel.assertQueue(queue, { durable: true });
    console.log('Sender created. Queue: %s', queue);

}

Sender.prototype.close = function (closeConnection) {
    if (this.channel) {
        var self = this;
        return self.channel.close().then(function () {
            var ch = self.channel;
            self.channel = undefined;
            if (closeConnection) {
                return ch.connection.close();
            }
        });
    }
};

Sender.prototype.send = function (data) {
    if (!Buffer.isBuffer(data)) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }
        data = new Buffer(data);
    }
    return this.channel.sendToQueue(this.queue, data, { persistent: true });

};

function createChannel(url) {
    var conn;
    console.log('AMQP. Connecting to ', url);
    return amqplib.connect(url)
        .then(function (connect) {
            conn = connect;
            return connect.createChannel();
        })
        .then(function (channel) {
            console.log('Channel created. URL: %s', url);
            return channel;
        },
            function (error) {
                if (conn) {
                    conn.close();
                }
                throw error;
            });
}

exports.createSender = function (queue, url) {
    url = url || DEFAULT_URL;
    return createChannel(url).then(function (channel) {
        return new Sender(channel, queue);
    });
};

exports.createReciever = function (queue, url, callback) {
    if (typeof url === 'function') {
        callback = url;
        url = undefined;
    }
    if (typeof callback !== 'function') {
        throw new Error('Callback function is expected');
    }
    url = url || DEFAULT_URL;
    return createChannel(url).then(function (channel) {
        channel.assertQueue(queue, { durable: true });
        channel.prefetch(1);
        var p = Promise.resolve();
        channel.consume(queue, function (msg) {
            var data = msg.content.toString();
            try {
                data = JSON.parse(data);
            } catch (error) {
            }
            p = p.then(callback(data, msg, channel));
            p = p.then(
                function () {
                    channel.ack(msg);
                },
                function (error) {
                    channel.ack(msg);
                    console.error(error);
                });
            return p;
        }, { noAck: false });
        console.log('Listening');
        return channel;
    });
};

