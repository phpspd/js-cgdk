/**
 * Created by Quake on 07.11.2017.
 */
module.exports = {
    Arrv        : 0,
    Fighter     : 1,
    Helicopter  : 2,
    IFV         : 3,
    Tank        : 4,
    
    validate: function (v) {
        if(typeof v !== 'number') throw 'Vehicle-Type: number expected';
        if(v < 0 || v > 4) throw 'Vehicle-Type: enum value out of range [0, 4]';
    }
};
