/**
 * Created by Quake on 07.11.2017.
 */
const Game = require('./model/game.js');
const World = require('./model/world.js');
const Player = require('./model/player.js');
const PlayerContext = require('./model/player-context.js');
const Vehicle = require('./model/vehicle.js');
const VehicleUpdate = require('./model/vehicle-update.js');
const Facility = require('./model/facility.js');
const TerrainType = require('./model/terrain-type.js');
const WeatherType = require('./model/weather-type.js');

var clientPaused;

module.exports.connect = function connect(host, port, onConnect) {

    const net = require('net');

    var request = [];
    var answer = [];
    var busy;
    var remainder;

    var previousPlayers = [];
    var previousFacilities = [];
    var terrainByCellXY = [];
    var weatherByCellXY = [];
    var previousPlayerById = {};
    var previousFacilityById = {};
    var _cachedBoolFlag = false;
    var _cachedBoolValue = false;

    var client = net.connect(port, host, function connectHandler() {
        // 'connect' listener
        console.log('connected to server!');
        onConnect();
    });
    client.setNoDelay();

    function dataHandler(data) {
        if (data) {
            if (remainder) {
                data = Buffer.concat([remainder, data]);
            }
        } else {
            if (remainder) {
                data = remainder;
            } else {
                return;
            }
        }
        busy = true;
        var len = data.length;
        var pos = 0;
        var tooSmall = false;
        var v;
        while (!tooSmall && (request.length > 0)) {
            //network problems imitation
            /*
             if (len>0 && Math.random()>0.995) {
             setTimeout(dataHandler, 100);
             break;
             }//*/
            if (typeof (pos) === 'undefined') throw 'error';
            var need = request[0];
            if (typeof (need) === 'function') {
                //end of request;
                need(answer);
                answer = [];
            } else if (typeof (need) === 'number') {
                //read buffer with certain length
                if (len >= need) {
                    answer.push(data.slice(pos, pos + need));
                    pos += need;
                    len -= need;
                }
            } else switch (need) {
                case 'byte':
                    if (len > 1) {
                        answer.push(data.readInt8(pos));
                        pos += 1;
                        len -= 1;
                    } else {
                        tooSmall = true;
                    }
                    break;
                case 'enum':
                    if (len > 1) {
                        v = data.readInt8(pos);
                        answer.push((v < 0) ? null : v);
                        pos += 1;
                        len -= 1;
                    } else {
                        tooSmall = true;
                    }
                    break;
                case 'bool':
                    if (len > 1) {
                        var bl = data.readInt8(pos);
                        if (bl !== 0 && bl !== 1) throw 'wrong bool value reade';
                        answer.push(bl !== 0);
                        pos += 1;
                        len -= 1;
                    } else {
                        tooSmall = true;
                    }
                    break;
                case 'long':
                    if (len >= 8) {
                        answer.push(data.readUInt32LE(pos));
                        pos += 8;
                        len -= 8;
                    } else {
                        tooSmall = true;
                    }
                    break;
                case 'int':
                    if (len >= 4) {
                        answer.push(data.readInt32LE(pos));
                        pos += 4;
                        len -= 4;
                    } else {
                        tooSmall = true;
                    }
                    break;
                case 'double':
                    if (len >= 8) {
                        answer.push(data.readDoubleLE(pos));
                        pos += 8;
                        len -= 8;
                    } else {
                        tooSmall = true;
                    }
                    break;
                default:
                    throw 'Wrong type';
                    break
            }
            if (!tooSmall) {
                request.shift();
            }
        }
        if (len > 0) {
            if (pos > 0) {
                remainder = data.slice(pos);
            } else {
                remainder = data;
            }
            if (remainder.length > 1000000) {
                if (!clientPaused) {
                    client.pause();
                    var pauseInterval = setInterval(function () {
                        if (remainder.length < 100000) {
                            clearInterval(pauseInterval);
                            clientPaused = false;
                            client.resume();
                        }
                    }, 100);
                    clientPaused = true;
                }
            }

        } else {
            remainder = null;
        }

        busy = false;
    }
    client.on('data', dataHandler);
    client.on('error', function onError(e) {
        console.log("SOCKET ERROR: " + e.message);
        process.exit(1);
    });

    client.on('close', function onClose() {
        console.log('server closed connection.');
        client.unref();
        process.exit();
    });
    client.on('end', function onEnd() {
        console.log('disconnected from server');
        process.exit();
    });
    var readSequence = function readSequence(a, callback) {
        if (!callback) {
            throw 'Callback expected';
        }
        if (Array.isArray(a)) {
            if (a.length < 1) {
                throw 'empty sequence to read';
            }
            request = request.concat(a);
        } else {
            request.push(a);
        }
        request.push(callback);
        if (!busy) {
            dataHandler();
        }
        /* //callers tracing. Weapon against callbacks-hell
         var a = [];
         var c = arguments.callee;
         while(c){
         if(!c.name) throw 'unknown function';
         a.push(c);
         c = c.caller;
         }
         callback.callStackDebug = a;*/
    };

    function readByte(callback) {
        readSequence('byte', function onByteReaded(a) {
            callback(a[0]);
        });
    }
    function readEnum(callback) {
        readSequence('enum', function onEnumReaded(a) {
            callback(a[0]);
        });
    }
    function readBool(callback) {
        if (_cachedBoolFlag) {
            _cachedBoolFlag = false;
            callback(_cachedBoolValue);
        } else {
            readSequence('bool', function onBoolReaded(a) {
                callback(a[0]);
            });
        }
    }
    function readInt(callback) {
        readSequence('int', function onIntReaded(a) {
            callback(a[0]);
        });
    }
    function readLong(callback) {
        readSequence('long', function onLongReaded(a) {
            callback(a[0]);
        });
    }
    function readDouble(callback) {
        readSequence('double', function omDoubleReaded(a) {
            callback(a[0]);
        });
    }
    function readFixedByteArray(len, callback) {

        readSequence(len, function onFixedByteArrayReaded(a) {
            callback(a[0]);
        });
    }
    function readByteArray(nullable, callback) {
        readInt(function readByteArrayf1(len) {

            if (len < 0) {
                callback(null);
            } else if (len === 0) {
                if (nullable) {
                    callback(null);
                } else {
                    callback([]);
                }
            } else {
                readFixedByteArray(len, function readByteArrayf2(resArray) {
                    var buf = resArray[0];
                    var ab = new ArrayBuffer(buf.length);
                    var view = new Uint8Array(ab);
                    for (var i = 0; i < buf.length; ++i) {
                        view[i] = buf[i];
                    }
                    callback(ab);
                });
            }
        });
    }
    function readEnums(enumType, callback) {
        readArrayOfElements(readEnum, function onEnumsReaded(a) {
            a.some(enumType.validate);
            callback(a);
        });
    }
    function readEnums2D(enumType, callback) {
        readArrayOfElements(readEnums.bind(undefined, enumType), callback);
    }
    function readNullableEnums(callback) {
        readByteArray(true, callback);
    }
    function readInts(callback) {
        readArrayOfElements(readInt, callback);
    }
    function readNulableEnums2D(callback) {
        readArrayOfElements(readNullableEnums, callback);
    }
    function readString(callback) {
        readInt(function readStringf1(len) {
            if (len < 0) {
                callback(null);
            } else if (len === 0) {
                callback('');
            } else {
                readFixedByteArray(len, function readStringf2(resArray) {
                    callback(resArray.toString('utf8'));
                });
            }
        });
    }
    function writeString(s) {
        var b = Buffer.from(s, 'utf-8');
        writeInt(b.length);
        client.write(b);
    }
    function writeInt(val) {
        tmpBuf.writeInt32LE(val, 0);
        var b = tmpBuf.slice(0, 4);
        client.write(b);
    }
    function writeDouble(val) {
        tmpBuf.writeDoubleLE(val, 0);
        var b = tmpBuf.slice(0, 8);
        client.write(b);
    }
    function writeLong(val) {
        tmpBuf.writeInt32LE(val, 0);
        tmpBuf.writeInt32LE((val === -1) ? -1 : 0, 4);
        var b = tmpBuf.slice(0, 8);
        client.write(b);
    }
    var tmpBuf = Buffer.alloc(1000);
    function writeEnum(val) {
        if (!val) val = 0;
        tmpBuf.writeInt8(val, 0);
        var b = tmpBuf.slice(0, 1);
        client.write(b);
    }
    function writeMessages(messages) {
        if (!messages) {
            writeInt(-1);
            return;
        }
        writeInt(messages.length);
        messages.some(writeMessage);
    }
    function writeMessage(message) {
        writeBoolean(message);
        writeEnum(message.lane);
        writeEnum(message.skillToLearn);
        writeByteArray(message.rawMessage);
    }
    function writeByteArray(array) {
        if (!array) {
            writeInt(-1);
        } else {
            writeInt(array.Length);
            var b = Buffer.from(a);
            client.write(b);
        }
    }
    function writeBoolean(v) {
        writeEnum(v ? 1 : 0);
    }
    this.writeTokenMessage = function writeTokenMessage(token) {
        writeEnum(MessageType.AuthenticationToken);
        writeString(token);
    };
    this.writeProtocolVersionMessage = function writeProtocolVersionMessage() {
        writeEnum(MessageType.ProtocolVersion);
        writeInt(1);
    };
    this.readTeamSizeMessage = function readTeamSizeMessage(callback) {
        readEnum(function readTeamSizeMessagef1(val) {
            ensureMessageType(val, MessageType.TeamSize);
            readInt(callback);
        })
    };
    this.readGameContextMessage = function readGameContextMessage(callback) {
        readEnum(function readGameContextMessagef1(val) {
            ensureMessageType(val, MessageType.GameContext);
            readGame(callback);
        });
    };
    function readGame(callback) {
        readBool(function readGamef1(val) {
            if (!val) {
                callback(null);
            } else {
                readSequence([
                    'long', 'int', 'double', 'double', 'bool', 'int', 'int', 'int', 'int', 'int',
                    'int', 'int', 'int', 'int', 'double', 'double', 'double', 'double', 'double', 'double',
                    'double', 'double', 'double', 'double', 'double', 'double', 'double', 'double', 'double', 'double',
                    'double', 'double', 'double', 'int', 'double', 'double', 'double', 'double', 'int', 'int',
                    'int', 'int', 'int', 'int', 'int', 'double', 'double', 'double', 'double', 'int',
                    'int', 'int', 'int', 'int', 'int', 'int', 'double', 'double', 'int', 'int',
                    'int', 'double', 'double', 'int', 'double', 'double', 'double', 'double', 'int', 'int',
                    'int', 'int', 'int', 'int', 'int', 'double', 'double', 'double', 'double', 'int',
                    'int', 'int', 'int', 'int', 'int', 'double', 'double', 'double', 'double'], function readGamef2(firstPart) {

                        var data = firstPart;
                        var game = Game.getInstance.apply(undefined, data);
                        callback(game);
                    })
            }

        })
    }
    this.readPlayerContextMessage = function readPlayerContextMessage(callback) {

        readEnum(function readPlayerContextMessagef1(messageType) {
            if (messageType === MessageType.GameOver) {
                this.close();
                process.exit(0);
            } else {
                ensureMessageType(messageType, MessageType.PlayerContext);
                readBool(function readPlayerContextMessagef2(val) {
                    if (!val) {
                        callback(null);
                    } else {
                        _cachedBoolFlag = true;
                        _cachedBoolValue = true;
                        readPlayerContext(callback);
                    }
                });
            }
        });
    };
    function readPlayerContext(callback) {
        readBool(function readPlayerContextf1(val) {
            if (!val) {
                callback(null);
            } else {
                readPlayer(function readPlayerContextf2(player) {
                    readWorld(function readPlayerContextf3(world) {
                        var playerContext = PlayerContext.getInstance(player, world);
                        callback(playerContext);
                    })
                })
            }
        })
    }
    function readVehicle(callback) {
        readBool(function readVehiclef1(val) {
            if (!val) {
                callback(null);
            } else {
                readSequence([
                    'long', 'double', 'double', 'double', 'long', 'int', 'int', 'double', 'double', 'double',
                    'double', 'double', 'double', 'double', 'int', 'int', 'int', 'int', 'int', 'int',
                    'enum', 'bool', 'bool'
                ], function readVehiclef2(part1) {
                    readInts(function readVehiclef3(ints) {
                        let data = part1;
                        data.push(ints);
                        let vehicle = Vehicle.getInstance.apply(undefined, data);
                        callback(vehicle);
                    })
                })
            }
        });
    }
    function readVehicles(callback) {
        readArrayOfElements(readVehicle, function onReadVehicles(vehicles) {
            callback(vehicles);
        });
    }
    function readVehicleUpdate(callback) {
        readBool(function readVehicleUpdatef1(val) {
            if (!val) {
                callback(val);
            } else {
                readSequence([
                    'long', 'double', 'double', 'int', 'int', 'bool'
                ], function readVehicleUpdatef2(part1) {
                    readInts(function readVehicleUpdatef3(ints) {
                        let data = part1;
                        data.push(ints);
                        let vehicleUpdate = VehicleUpdate.getInstance.apply(undefined, data);
                        callback(vehicleUpdate);
                    })
                })
            }
        })
    }
    function readVehicleUpdates(callback) {
        readArrayOfElements(readVehicleUpdate, function readVehicleUpdatesf1(vehicleUpdates) {
            callback(vehicleUpdates);
        });
    }
    function readFacility(callback) {
        readByte(function readFacilityf1(val) {
            if (val == 0) {
                callback(null);
            } else if (val == 127) {
                readLong(function readFacilityf2(val) {
                    callback(previousFacilityById[val]);
                })
            } else {
                readSequence([
                    'long', 'enum', 'long', 'double', 'double', 'double', 'enum', 'int'
                ], function readFacilityf3(data) {
                    let facility = Facility.getInstance.apply(undefined, data)
                    previousFacilityById[facility.id] = facility;
                    callback(data);
                })
            }
        })
    }
    function readFacilities(callback) {
        readArrayOfElements(readFacility, function readFacilitiesf1(facilities) {
            callback(facilities);
        });
    }
    function readArrayOfElements(reader, callback) {
        var arrayTargetLen;
        var arrayBuilder;
        var __ArrayReaderHandler = function __ArrayReaderHandler(data) {
            arrayBuilder.push(data);
            arrayTargetLen--;
            if (arrayTargetLen === 0) {
                callback(arrayBuilder);
            } else {
                reader(__ArrayReaderHandler);
            }
        };
        readInt(function onReadArrayLen(len) {
            if (len < 0) {
                callback(null);
                return;
            }
            arrayBuilder = [];
            if (len === 0) {
                callback(arrayBuilder);
            } else {
                arrayTargetLen = len;
                reader(__ArrayReaderHandler);
            }
        });
    }
    function readTerrainByCellXY(callback) {
        if (!terrainByCellXY.length) {
            readEnums2D(TerrainType, function (data) {
                terrainByCellXY = data;
                callback(terrainByCellXY);
            });
        } else {
            callback(terrainByCellXY);
        }
    }
    function readWeatherByCellXY(callback) {
        if (!weatherByCellXY.length) {
            readEnums2D(WeatherType, function (data) {
                weatherByCellXY = data;
                callback(weatherByCellXY);
            });
        } else {
            callback(weatherByCellXY);
        }
    }
    function readWorld(callback) {
        readBool(function readWorldf1(val) {
            if (!val) {
                callback(null);
            } else {
                readSequence([
                    'int', 'int', 'double', 'double'
                ], function readWorldf2(part1) {
                    readArrayOfElements(readPlayer, function readWorldOnPlayerRead(players) {
                        readVehicles(function readWorldOnVehicles(vehicles) {
                            readVehicleUpdates(function readWorldOnVehicleUpdates(vehicleUpdates) {
                                readTerrainByCellXY(function readWorldOnTerrain(terrainByCellXY) {
                                    readWeatherByCellXY(function readWorldOnWeather(weatherByCellXY) {
                                        readFacilities(function (facilities) {
                                            let world = World.getInstance(part1[0], part1[1], part1[2], part1[3], players, vehicles, vehicleUpdates, terrainByCellXY, weatherByCellXY, facilities);
                                            callback(world);
                                        });
                                    })
                                })
                            })
                        })
                    })
                })
            }
        })
    }
    function readPlayer(callback) {
        readByte(function readPlayerf1(val) {
            if (!val) {
                callback(null);
            } else if (val == 127) {
                readLong(function readPlayerf2(val2) {
                    callback(previousPlayerById[val2]);
                });
            } else {
                readSequence(['long', 'bool', 'bool', 'int', 'int'], function readPlayerf3(part1) {
                    var player = Player.getInstance.apply(undefined, part1);
                    previousPlayerById[player.id] = player;
                    callback(player);
                })
            }
        })
    }

    function writeMove(move) {
        if (!move) {
            writeBoolean(false);
            return;
        }
        writeBoolean(true);
        writeEnum(move.getAction());
        writeInt(move.getGroup());
        writeDouble(move.getLeft());
        writeDouble(move.getTop());
        writeDouble(move.getRight());
        writeDouble(move.getBottom());
        writeDouble(move.getX());
        writeDouble(move.getY());
        writeDouble(move.getAngle());
        writeDouble(move.getMaxSpeed());
        writeDouble(move.getMaxAngularSpeed());
        writeEnum(move.getVehicleType());
        writeLong(move.getFacilityId());
    }
    this.writeMoveMessage = function writeMoveMessage(move) {
        writeEnum(MessageType.Move);
        writeMove(move);
    }

    this.close = function close() {
        try {
            client.unref();
            client.close();
            cllient.destroy();
        } catch (e) {
            console.log(e);
        }
    }

};

function ensureMessageType(actualType, expectedType) {
    if (actualType != expectedType) {
        throw "Received wrong message [actual=" + actualType + ", expected=" + expectedType + "].";
    }
}
var MessageType = {
    Unknown: 0,
    GameOver: 1,
    AuthenticationToken: 2,
    TeamSize: 3,
    ProtocolVersion: 4,
    GameContext: 5,
    PlayerContext: 6,
    Move: 7
};
