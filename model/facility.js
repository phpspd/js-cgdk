/**
 * Created by Quake on 07.11.2017.
 */
module.exports.getInstance = function (
    id,
    type,
    ownerPlayerId,
    left,
    top,
    capturePoints,
    vehicleType,
    productionProgress
) {
    return {
        id                  : id,
        type                : type,
        ownerPlayerId       : ownerPlayerId,
        left                : left,
        top                 : top,
        capturePoints       : capturePoints,
        vehicleType         : vehicleType,
        productionProgress  : productionProgress
    };
};