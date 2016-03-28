var memJs = require('memjs');
var Client = memJs.Client;


Client.prototype.getPromised = function (key) {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.get(key, function (err, val) {
            err ? reject(err) : resolve(JSON.parse(val));
        });
    });
};


Client.prototype.setPromised = function (key, val) {
    var self = this;
    return new Promise(function (resolve, reject) {
        val = JSON.stringify(val);
        self.set(key, val, function (err, success) {
            err ? reject(err) : resolve(success);
        });
    });
};


Client.prototype.flushPromised = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.flush(function (err, success) {
            err ? reject(err) : resolve(success);
        });
    });
};


for (var key in memJs) {
    exports[key] = memJs[key];
}

