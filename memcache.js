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


for (var key in memJs) {
    exports[key] = memJs[key];
}

