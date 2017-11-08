/**
 * Created by Quake on 07.11.2017.
 */
module.exports.getInstance = function (
    tickIndex,
    tickCount,
    width,
    height,
    players,
    newVehicles,
    vehicleUpdates,
    terrainByCellXY,
    weatherByCellXY,
    facilities
) {
    return {
        tickIndex       : tickIndex,
        tickCount       : tickCount,
        width           : width,
        height          : height,
        players         : players,
        newVehicles     : newVehicles,
        vehicleUpdates  : vehicleUpdates,
        terrainByCellXY : terrainByCellXY,
        weatherByCellXY : weatherByCellXY,
        facilities      : facilities
    };
};
