/**
 * Created by Quake on 07.11.2017.
 */


function goToSafeMode() {
    if (process.argv[6] === 'disable-fs') {
        process.kill = null;

        var path = require('path');

        var Module = require('module');
        var originalRequire = Module.prototype.require;
        Module.prototype.require = function (moduleName) {

            if (moduleName.indexOf(__dirname) !== 0) {
                moduleName = path.resolve(__dirname, moduleName);
            } else {
                moduleName = path.resolve(moduleName);
            }

            if (moduleName.indexOf(__dirname) !== 0) {
                throw moduleName + '; Modules import is restricted. Use require(__dirname+"/module.js") to import any modules. Ипорт модулей ограничен. Используйте (__dirname+"/module.js") для импорта модулей.';
            }

            return originalRequire(moduleName);

        };
        console.log('"fs" module disabled');
    }
}


var token = process.argv[4] || "0000000000000000";
var RemoteProcessClient = require(__dirname + '/remote-process-client.js');
var remoteProcessClient = new RemoteProcessClient.connect(process.argv[2] || '127.0.0.1', process.argv[3] || 31001, function onServerConnect() {
    if (MyStrategy.onLocalRunnerConnected) {
        MyStrategy.onLocalRunnerConnected();
    }
    if (process.env.DEBUG) {
        run();
    } else {
        try {
            run();
        } catch (e) {
            console.log('INITIALIZATION ERROR: ' + e.message);
            process.exit(1);
        }
    }
});
var strategy = null;
var teamSize;
var game;
var Move = require('./model/move.js');

goToSafeMode();

var MyStrategy = require(__dirname + '/' + (process.argv[5] || './my-strategy.js'));

var isCallbackedStrategy = false;
var _move;
function run() {
    remoteProcessClient.writeTokenMessage(token);
    remoteProcessClient.writeProtocolVersionMessage();
    remoteProcessClient.readTeamSizeMessage(function f1(v) {
        teamSize = v;
        remoteProcessClient.readGameContextMessage(function f2(v) {
            game = v;
            strategy = MyStrategy.getInstance();
            isCallbackedStrategy = strategy.length === 5; //http proxy strategy with callback
            remoteProcessClient.readPlayerContextMessage(handleGameFrame);
        });
    });
}
function handleGameFrame(playerContext) {
    if (!playerContext) {
        remoteProcessClient.close();
        process.exit(1);
    }
    var player = playerContext.player;
    if (player == null) {
        console.log('wrong player');
        process.exit(1);
    } else {

        callBackCount = 0;

        var move = Move.getInstance();
        if (!isCallbackedStrategy) {
            _move = move;
        }
        if (process.env.DEBUG) {
            callStrategy(player, playerContext.world, game, move);
        } else {
            try {
                callStrategy(player, playerContext.world, game, move);
            } catch (e) {
                console.log(e.stack);
                process.exit(1);
            }
        }
    }
    if (!isCallbackedStrategy) {
        afterAllStrategyProcessed();
    }
}
function afterAllStrategyProcessed() {
    remoteProcessClient.writeMoveMessage(_move);
    remoteProcessClient.readPlayerContextMessage(handleGameFrame);
}
var callBackCount;
function callStrategy(player, world, game, move) {

    if (isCallbackedStrategy) {
        callBackCount++;
        strategy(player, world, game, move, function (returnedMove) {
            _move = returnedMove;
            callBackCount--;
            if (callBackCount === 0) {
                afterAllStrategyProcessed();
            }
        });
    } else {
        strategy(player, world, game, move);
    }
}
