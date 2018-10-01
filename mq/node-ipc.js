const assert = require('assert');
const ipc = require('node-ipc');
const rpmUtil = require('integration-common/util');

const TYPE = 'message';

function createReceiver(config, callback) {
    assert.equal(typeof callback, 'function');
    rpmUtil.validateString(config.id);
    Object.assign(ipc.config, config);
    ipc.serve(() => ipc.server.on(TYPE, callback));
    ipc.server.start();
    return ipc.server;
}

function createSender(config) {
    config = Object.assign({}, config);
    const socketID = rpmUtil.validateString(config.id);
    delete config.id;
    Object.assign(ipc.config, config);
    return new Promise((resolve, reject) => ipc.connectTo(socketID, () => {
        const client = ipc.of[socketID];
        client.on('connect', () => {
            return resolve(data => data !== undefined && client.emit(TYPE, data));
        });
        client.on('error', reject);
    }));
}

exports.createReceiver = createReceiver;
exports.createSender = createSender;