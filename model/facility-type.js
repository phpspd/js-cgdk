/**
 * Created by Quake on 07.11.2017.
 */
module.exports = {
    ControlCenter   : 0,
    VehicleFactory  : 1,
    
    validate: function (v) {
        if(typeof v !== 'number') throw 'Facility-Type: number expected';
        if(v < 0 || v > 1) throw 'Facility-Type: enum value out of range [0, 1]';
    }
};
