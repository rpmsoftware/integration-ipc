
const assert = require('assert');
const key = 'vvv';
const store = require('./store').createStore('memjs');
(async () => {
    await store.flush();
    const v = 'somevalue';
    await store.set(key, v);
    const v2 = await store.get(key);
    assert.equal(v, v2);
    console.log('done');
})().then(() => store.close(), err => {
    store.close()
    console.error(err)
});

