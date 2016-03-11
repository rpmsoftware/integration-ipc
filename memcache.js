var memJs = require('memjs');
var Client = memJs.Client;

var originalGet = Client.prototype.get;

Client.prototype.get = function (key) {
    var core = originalGet.bind(this);
    return new Promise(function (resolve, reject) {
        core(key, function (err, val) {
            err ? reject(err) : resolve(JSON.parse(val));
        });
    });
};

var originalSet = Client.prototype.set;

Client.prototype.set = function (key, val) {
    var core = originalSet.bind(this);
    return new Promise(function (resolve, reject) {
        val = JSON.stringify(val);
        core(key, val, function (err, success) {
            err ? reject(err) : resolve(success);
        });
    });
};

var originalFlush = Client.prototype.flush;

Client.prototype.flush = function () {
    var core = originalFlush.bind(this);
    return new Promise(function (resolve, reject) {
        core(function (err, success) {
            err ? reject(err) : resolve(success);
        });
    });
};


for (var key in memJs) {
    exports[key] = memJs[key];
}

