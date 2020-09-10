
const box2d = require('./build/box2d/box2d.umd');
let b2 = {};


for (var key in box2d) {
    if (key.indexOf('b2_') !== -1) {
        continue;
    }
    let newKey = key.replace('b2', '');
    b2[newKey] = box2d[key];
}

module.exports = b2;
