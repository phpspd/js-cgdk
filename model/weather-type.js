/**
 * Created by Quake on 07.11.2017.
 */
module.exports = {
    Clear   : 0,
    Cloud   : 1,
    Rain    : 2,
    
    validate: function (v) {
        if(typeof v !== 'number') throw 'Weather-Type: number expected';
        if(v < 0 || v > 2) throw 'Weather-Type: enum value out of range [0, 2]';
    }
};
