/**
 * Created by Quake on 07.11.2017.
 */
module.exports = {
    Plain   : 0,
    Swamp   : 1,
    Forest  : 2,
    
    validate: function (v) {
        if(typeof v !== 'number') throw 'Terrain-Type: number expected';
        if(v < 0 || v > 2) throw 'Terrain-Type: enum value out of range [0, 2]';
    }
};
