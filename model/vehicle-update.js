/**
 * Created by Quake on 07.11.2017.
 */
module.exports.getInstance = function (
    id,
    x,
    y,
    durability,
    remainingAttackCooldownTicks,
    selected,
    groups
) {
    return {
        id                              : id,
        x                               : x,
        y                               : y,
        durability                      : durability,
        remainingAttackCooldownTicks    : remainingAttackCooldownTicks,
        selected                        : selected,
        groups                          : groups
    };
};
