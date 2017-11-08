/**
 * Created by Quake on 07.11.2017.
 */
"use strict";

let ActionType = require(__dirname + '/action-type');
let VehicleType = require(__dirname + '/vehicle-type');

module.exports.getInstance = function () {
    
    let _action             = -1;
    let _group              = 0;
    let _left               = 0.0;
    let _top                = 0.0;
    let _right              = 0.0;
    let _bottom             = 0.0;
    let _x                  = 0.0;
    let _y                  = 0.0;
    let _angle              = 0.0;
    let _maxSpeed           = 0.0;
    let _maxAngularSpeed    = 0.0;
    let _vehicleType        = -1;
    let _facilityId         = -1;
    
    let ret = {
        setAction: function (action) {
            if(typeof action !== 'number') throw "Wrong value for move.setAction: " + action;
            ActionType.validate(action);
            _action = action;
        },
        getAction: function () {
            return _action;
        },
        setGroup: function (group) {
            if (typeof group !== 'number') throw "Wrong value for move.setGroup: " + group;
            _group = group;
        },
        getGroup: function () {
            return _group;
        },
        setLeft: function (left) {
            if (typeof left !== 'number') throw "Wrong value for move.setLeft: " + left;
            _left = left;
        },
        getLeft: function () {
            return _left;
        },
        setTop: function (top) {
            if (typeof top !== 'number') throw "Wrong value for move.setTop: " + top;
            _top = top;
        },
        getTop: function () {
            return _top;
        },
        setRight: function (right) {
            if (typeof right !== 'number') throw "Wrong value for move.setRight: " + right;
            _right = right;
        },
        getRight: function () {
            return _right;
        },
        setBottom: function (bottom) {
            if (typeof bottom !== 'number') throw "Wrong value for move.setBottom: " + bottom;
            _bottom = bottom;
        },
        getBottom: function () {
            return _bottom;
        },
        setX: function (x) {
            if (typeof x !== 'number') throw "Wrong value for move.setX: " + x;
            _x = x;
        },
        getX: function () {
            return _x;
        },
        setY: function (y) {
            if (typeof y !== 'number') throw "Wrong value for move.setY: " + y;
            _y = y;
        },
        getY: function () {
            return _y;
        },
        setAngle: function (angle) {
            if (typeof angle !== 'number') throw "Wrong value for move.setAngle: " + angle;
            _angle = angle;
        },
        getAngle: function () {
            return _angle;
        },
        setMaxSpeed: function (maxSpeed) {
            if (typeof maxSpeed !== 'number') throw "Wrong value for move.setMaxSpeed: " + maxSpeed;
            _maxSpeed = maxSpeed;
        },
        getMaxSpeed: function () {
            return _maxSpeed;
        },
        setMaxAngularSpeed: function (maxAngularSpeed) {
            if (typeof maxAngularSpeed !== 'number') throw "Wrong value for move.setMaxAngularSpeed: " + maxAngularSpeed;
            _maxAngularSpeed = maxAngularSpeed;
        },
        getMaxAngularSpeed: function () {
            return _maxAngularSpeed;
        },
        setVehicleType: function (vehicleType) {
            if (typeof vehicleType !== 'number') throw "Wrong value for move.setVehicleType: " + vehicleType;
            VehicleType.validate(vehicleType);
            _vehicleType = vehicleType;
        },
        getVehicleType: function () {
            return _vehicleType;
        },
        setFacilityId: function (facilityId) {
            if (typeof facilityId !== 'number') throw "Wrong value for move.setFacilityId: " + facilityId;
            _facilityId = facilityId;
        },
        getFacilityId: function () {
            return _facilityId;
        }
    };
    
    Object.freeze(ret);
    return ret;
};
