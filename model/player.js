/**
 * Created by Quake on 07.11.2017.
 */
module.exports.getInstance = function (
    id,
    me,
    strategyCrashed,
    score,
    remainingActionCooldownTicks
) {
    return {
        id                              : id,
        me                              : me,
        strategyCrashed                 : strategyCrashed,
        score                           : score,
        remainingActionCooldownTicks    : remainingActionCooldownTicks
    };
};
