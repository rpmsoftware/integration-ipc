var memJs = require('memjs');
var Client = memJs.Client;

Client.prototype.getPromised = function (key) {
    var self = this;
    return new Promise((resolve, reject) => self.get(key, (err, val) => err ? reject(err) : resolve(val && JSON.parse(val))));
};


Client.prototype.setPromised = function (key, val) {
    var self = this;
    return new Promise((resolve, reject) => {
        function cb(err, success) {
            err ? reject(err) : resolve(success);
        }
        val ? self.set(key, JSON.stringify(val), cb) : self.delete(key, cb);
    });
};

Client.prototype.flushPromised = function () {
    var self = this;
    return new Promise((resolve, reject) => self.flush((err, success) => err ? reject(err) : resolve(success)));
};

const MEMCACHE_PROPERTY = 'memcache';

var hash;
function getHash(value) {
    if (!hash) {
        hash = require('object-hash');
    }
    return hash(value);
}

Client.prototype.cachedInit = function (config, cbInit) {
    var key = config[MEMCACHE_PROPERTY];
    if (!key) {
        return cbInit(config);
    }
    var checksum = getHash(config);
    var self = this;
    return self.getPromised(key).then(cached => {
        if (cached && cached.checksum === checksum) {
            return Promise.resolve(cached.value);
        }
        var value = cbInit(config);
        return (value instanceof Promise ? value : Promise.resolve(value)).then(value =>
            self.setPromised(key, { checksum, value }).then(() => value));
    });
}

module.exports = memJs;

