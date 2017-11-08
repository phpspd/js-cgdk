/**
 * Created by Quake on 07.11.2017.
 */
"use strict";
var ActionType = require('./model/action-type.js');
var FacilityType = require('./model/facility-type.js');
var TerrainType = require('./model/terrain-type.js');
var VehicleType = require('./model/vehicle-type.js');
var WeatherType = require('./model/weather-type.js');
var Vehicle = require('./model/vehicle.js');

module.exports.getInstance = function () {
    //private strategy variables here;

    /**
     * Ключевые точки для каждой линии, позволяющие упростить управление перемещением волшебника.
     * <p>
     * Если всё хорошо, двигаемся к следующей точке и атакуем противников.
     * Если осталось мало жизненной энергии, отступаем к предыдущей точке.
     */
    var terrainTypeByCellXY = [];
    var weatherTypeByCellXY = [];
    var __r;
    var rand = function (max) {
        __r = ((__r * (33)) + 831);
        __r %= 12147483647;
        if (max !== undefined) {
            return Math.ceil(__r / 491) % max;
        }
        return Math.ceil(__r / 493);
    };
    var nextBoolean = function () {
        return (rand() & 1) === 0;
    };

    var vehicleById = {};
    var updateTickByVehicleId = {};
    var delayedMoves = [];

    /**
     * Основной метод стратегии, осуществляющий управление армией. Вызывается каждый тик.
     *
     * @param self  Информация о вашем игроке.
     * @param world Текущее состояние мира.
     * @param game  Различные игровые константы.
     * @param move  Результатом работы метода является изменение полей данного объекта.
     */
    var initialized;
    var self, world, game, move;

    var moveFunction = function (self, world, game, move) {
        if (!initialized) {
            initializeStrategy(world, game);
            initialized = true;
        }
        initializeTick(self, world, game, move);

        if (self.remainingActionCooldownTicks > 0) {
            return;
        }

        if (executeDelayedMove()) {
            return;
        }

        moveFunc();

        executeDelayedMove();
    };

    /**
     * Инциализируем стратегию.
     * <p>
     * Для этих целей обычно можно использовать конструктор, однако в данном случае мы хотим инициализировать генератор
     * случайных чисел значением, полученным от симулятора игры.
     */
    var initializeStrategy = function (world, game) {
        __r = game.randomSeed;
        terrainTypeByCellXY = world.terrainByCellXY;
        weatherTypeByCellXY = world.weatherByCellXY;
    };
    /**
     * Сохраняем все входные данные в полях замыкания упрощения доступа к ним.
     */
    var initializeTick = function (self_, world_, game_, move_) {
        self = self_;
        world = world_;
        game = game_;
        move = move_;

        for (let vehicle of world.newVehicles) {
            vehicleById[vehicle.id] = vehicle;
            updateTickByVehicleId[vehicle.id] = world.tickIndex;
        }

        for (let vehicleUpdate of world.vehicleUpdates) {
            let vehicleId = vehicleUpdate.id;

            if (vehicleUpdate.durability == 0) {
                delete vehicleById[vehicleId];
            } else {
                let vehicle = vehicleById[vehicleId];
                vehicle.x = vehicleUpdate.x;
                vehicle.y = vehicleUpdate.y;
                vehicle.durability = vehicleUpdate.durability;
                vehicle.remainingAttackCooldownTicks = vehicleUpdate.remainingAttackCooldownTicks;
                vehicle.selected = vehicleUpdate.selected;
                vehicle.groups = vehicleUpdate.groups;

                updateTickByVehicleId[vehicle.id] = world.tickIndex;
            }
        }
    };

    /**
     * Достаём отложенное действие из очереди и выполняем его.
     *
     * @return Возвращает {@code true}, если и только если отложенное действие было найдено и выполнено.
     */
    var executeDelayedMove = function () {
        if (!delayedMoves.length) {
            return false;
        }

        delayedMoves.shift()();
        return true;
    }

    /**
     * Основная логика нашей стратегии.
     */
    var moveFunc = function () {
        // Каждые 300 тиков ...
        if (world.tickIndex % 300 == 0) {
            // ... для каждого типа техники ...
            for (let vehicleType = 0; vehicleType <= 4; vehicleType++) {
                let targetType = getPreferredTargetType(vehicleType);

                // ... если этот тип может атаковать ...
                if (targetType == null) {
                    continue;
                }

                // ... получаем центр формации ...
                let myVehicles = Object.values(vehicleById).filter(function (vehicle) {
                    return vehicle.playerId == self.id;
                }).filter(function(vehicle) {
                    return vehicle.type == vehicleType;
                });
                let x = myVehicles.reduce(function (sum, vehicle) {
                    return sum + vehicle.x;
                }, 0) / myVehicles.length;
                let y = myVehicles.reduce(function (sum, vehicle) {
                    return sum + vehicle.y;
                }, 0) / myVehicles.length;

                // ... получаем центр формации противника или центр мира ...
                let enemyVehicles = Object.values(vehicleById).filter(function (vehicle) {
                    return vehicle.playerId != self.id;
                }).filter(function(vehicle) {
                    return vehicle.type == targetType;
                });;
                let targetX = enemyVehicles.reduce(function (sum, vehicle) {
                    return sum + vehicle.x;
                }, 0) / enemyVehicles.length;
                let targetY = enemyVehicles.reduce(function (sum, vehicle) {
                    return sum + vehicle.y;
                }, 0) / enemyVehicles.length;

                // .. и добавляем в очередь отложенные действия для выделения и перемещения техники.
                if (!isNaN(x) && !isNaN(y)) {
                    delayedMoves.push(function(){
                        move.setAction(ActionType.ClearAndSelect);
                        move.setRight(world.width);
                        move.setBottom(world.height);
                        move.setVehicleType(vehicleType);
                    });

                    delayedMoves.push(function(){
                        move.setAction(ActionType.Move);
                        move.setX(targetX - x);
                        move.setY(targetY - y);
                    });
                }
            }

            // Также находим центр формации наших БРЭМ ...
            let myArrvs = Object.values(vehicleById).filter(function(vehicle) {
                return vehicle.playerId == self.id && vehicle.type == VehicleType.Arrv
            });
            let x = myArrvs.reduce(function (sum, vehicle) {
                return sum + vehicle.x;
            }, 0) / myArrvs.length;
            let y = myArrvs.reduce(function (sum, vehicle) {
                return sum + vehicle.y;
            }, 0) / myArrvs.length;

            // .. и отправляем их в центр мира.
            if (!isNaN(x) && !isNaN(y)) {
                delayedMoves.push(function() {
                    move.setAction(ActionType.ClearAndSelect);
                    move.setRight(world.width);
                    move.setBottom(world.height);
                    move.setVehicleType(VehicleType.Arrv);
                });

                delayedMoves.push(function() {
                    move.setAction(ActionType.Move);
                    move.setX(world.width / 2 - x);
                    move.setY(world.height / 2 - y);
                });
            }

            return;
        }

        // Если ни один наш юнит не мог двигаться в течение 60 тиков ...
        let myVehicles = Object.values(vehicleById).filter(function (vehicle) {
            return vehicle.playerId == self.id;
        });
        if (!myVehicles.some(function(vehicle) {
            return world.tickIndex - updateTickByVehicleId[vehicle.id] <= 60
        })) {
            /// ... находим центр нашей формации ...
            let x = myVehicles.reduce(function (sum, vehicle) {
                return sum + vehicle.x;
            }, 0) / myVehicles.length;
            let y = myVehicles.reduce(function (sum, vehicle) {
                return sum + vehicle.y;
            }, 0) / myVehicles.length;

            // ... и поворачиваем её на случайный угол.
            if (!isNaN(x) && !isNaN(y)) {
                move.setAction(ActionType.Rotate);
                move.setX(x);
                move.setY(y);
                move.setAngle(nextBoolean() ? Math.PI : - Math.PI);
            }
        }
    }

    /**
     * Вспомогательный метод, позволяющий для указанного типа техники получить другой тип техники, такой, что первый
     * наиболее эффективен против второго.
     *
     * @param vehicleType Тип техники.
     * @return Тип техники в качестве приоритетной цели.
     */
    function getPreferredTargetType(vehicleType) {
        switch(vehicleType) {
            case VehicleType.Fighter:
                return VehicleType.Helicopter;
            case VehicleType.Helicopter:
                return VehicleType.Tank;
            case VehicleType.IFV:
                return VehicleType.Helicopter;
            case VehicleType.Tank:
                return VehicleType.IFV;
            default:
                return null;
        }
    }

    return moveFunction; //возвращаем функцию move, чтобы runner мог ее вызывать
};