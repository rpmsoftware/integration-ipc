var key = 'vvv';
var cache = require('./memcache').Client.create();
cache.flushPromised()
    .then(() => cache.setPromised(key, 100))
    .then(() => cache.getPromised(key))
    .then((v) => {
        console.log(v);
        cache.close();
    });
