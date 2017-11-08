/**
 * Created by Quake on 07.11.2017.
 */
module.exports = {
    None                        : 0,
    ClearAndSelect              : 1,
    AddToSelection              : 2,
    Deselect                    : 3,
    Assign                      : 4,
    Dismiss                     : 5,
    Disband                     : 6,
    Move                        : 7,
    Rotate                      : 8,
    SetupVehicleProduction      : 9,
    
    validate: function (v) {
        if(typeof v !== 'number') throw 'Action-Type: number expected';
        if(v < 0 || v > 9) throw 'Action-Type: enum value out of range [0, 9]';
    }
};
