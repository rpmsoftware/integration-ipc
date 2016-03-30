var key = 'vvv';
var cache = require('./memcache').Client.create();
var p = cache.flushPromised().then(function() {
    
    return cache.setPromised(key,100);
}).then(function() {
    return cache.getPromised(key);
}).then(function(v) {
    console.log(v);
    cache.close();
});
