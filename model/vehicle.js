/**
 * Created by Quake on 07.11.2017.
 */
let CircularUnit = require(__dirname + '/circular-unit');

module.exports.getInstance = function (
    id,
    x,
    y,
    radius,
    playerId,
    durability,
    maxDurability,
    maxSpeed,
    visionRange,
    squaredVisionRange,
    groundAttackRange,
    squaredGroundAttackRange,
    aerialAttackRange,
    squaredAerialAttackRange,
    groundDamage,
    aerialDamage,
    groundDefence,
    aerialDefence,
    attackCooldownTicks,
    remainingAttackCooldownTicks,
    type,
    aerial,
    selected,
    groups
) {
    let ret = CircularUnit.getInstance(
        id,
        x,
        y,
        radius
    );

    ret.playerId = playerId;
    ret.durability = durability;
    ret.maxDurability = maxDurability;
    ret.maxSpeed = maxSpeed;
    ret.visionRange = visionRange;
    ret.squaredVisionRange = squaredVisionRange;
    ret.groundAttackRange = groundAttackRange;
    ret.squaredGroundAttackRange = squaredGroundAttackRange;
    ret.aerialAttackRange = aerialAttackRange;
    ret.squaredAerialAttackRange = squaredAerialAttackRange;
    ret.groundDamage = groundDamage;
    ret.aerialDamage = aerialDamage;
    ret.groundDefence = groundDefence;
    ret.aerialDefence = aerialDefence;
    ret.attackCooldownTicks = attackCooldownTicks;
    ret.remainingAttackCooldownTicks = remainingAttackCooldownTicks;
    ret.type = type;
    ret.aerial = aerial;
    ret.selected =selected;
    ret.groups = groups;

    return ret;
};
