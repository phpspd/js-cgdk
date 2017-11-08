/**
 * Created by Quake on 07.11.2017.
 */
let Unit = require(__dirname + '/unit');
module.exports.getInstance = function (
    id,
    x,
    y,
    
    radius
) {
    let ret = Unit.getInstance(
        id,
        x,
        y
    );

    ret.radius = radius;

    return ret;
};