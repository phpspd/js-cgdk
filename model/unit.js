/**
 * Created by Quake on 07.11.2017.
 */

var pool = {};
var getDistanceTo = function (x, y) {
    var dx, dy;
    if(typeof x === 'number') {
        dx = x - this.x;
        dy = y - this.y;
    } else {
        dx = x.x - this.x;
        dy = x.y - this.y;
    }
    
    return Math.sqrt(dx * dx + dy * dy);
};
module.exports.getInstance = function (
    id,
    x,
    y
) {
    var ret;
    if (pool.hasOwnProperty(id)) {
        ret = pool[id];
        ret.x = x;
        ret.y = y;
    } else {
        ret = {
            id: id,
            x: x,
            y: y
        };
        ret.getDistanceTo = getDistanceTo.bind(ret);
        pool[id] = ret;
    }
    return ret;
};
