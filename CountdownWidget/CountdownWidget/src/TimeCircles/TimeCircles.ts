/// <reference path="timecircles.d.ts" />
/**
 * Basic structure: TC_Class is the public class that is returned upon being called
 * 
 * So, if you do
 *      var tc = $(".timer").TimeCircles();
 *      
 * tc will contain an instance of the public TimeCircles class. It is important to
 * note that TimeCircles is not chained in the conventional way, check the
 * documentation for more info on how TimeCircles can be chained.
 * 
 * After being called/created, the public TimerCircles class will then- for each element
 * within it's collection, either fetch or create an instance of the private class.
 * Each function called upon the public class will be forwarded to each instance
 * of the private classes within the relevant element collection
 **/

import * as $ from 'jquery';

$.fn.TimeCircles = function (options) {
    return new TimeCircles.TimeCircles(this, options);
};

module TimeCircles {
    export class TimeCircles implements ITimeCircles {
        useWindow = window;
        // Used to disable some features on IE8
        limited_mode = false;
        tick_duration = 200; // in ms
        debug = (location.hash === "#debug");

        constructor(elements, options: TimeCirclesOptions) {
            // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
            if (!Object.keys) {
                Object.keys = (function () {
                    'use strict';
                    var hasOwnProperty = Object.prototype.hasOwnProperty,
                        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
                        dontEnums = [
                            'toString',
                            'toLocaleString',
                            'valueOf',
                            'hasOwnProperty',
                            'isPrototypeOf',
                            'propertyIsEnumerable',
                            'constructor'
                        ],
                        dontEnumsLength = dontEnums.length;

                    return function (obj) {
                        if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                            throw new TypeError('Object.keys called on non-object');
                        }

                        var result = [], prop, i;

                        for (prop in obj) {
                            if (hasOwnProperty.call(obj, prop)) {
                                result.push(prop);
                            }
                        }

                        if (hasDontEnumBug) {
                            for (i = 0; i < dontEnumsLength; i++) {
                                if (hasOwnProperty.call(obj, dontEnums[i])) {
                                    result.push(dontEnums[i]);
                                }
                            }
                        }
                        return result;
                    };
                }());
            }

            /**
          * Array.prototype.indexOf fallback for IE8
          * @param {Mixed} mixed
          * @returns {Number}
          */
            if (!Array.prototype.indexOf) {
                Array.prototype.indexOf = function (elt /*, from*/) {
                    var len = this.length >>> 0;

                    var from = Number(arguments[1]) || 0;
                    from = (from < 0)
                        ? Math.ceil(from)
                        : Math.floor(from);
                    if (from < 0)
                        from += len;

                    for (; from < len; from++) {
                        if (from in this &&
                            this[from] === elt)
                            return from;
                    }
                    return -1;
                };
            }

            this.elements = elements;
            this.options = options;
            this.foreach(null);
        }

        debug_log(msg) {
            if (this.debug) {
                console.log(msg);
            }
        }

        allUnits = ["Days", "Hours", "Minutes", "Seconds"];
        nextUnits = {
            Seconds: "Minutes",
            Minutes: "Hours",
            Hours: "Days",
            Days: "Years"
        };
        secondsIn = {
            Seconds: 1,
            Minutes: 60,
            Hours: 3600,
            Days: 86400,
            Months: 2678400,
            Years: 31536000
        };

        /**
            * Converts hex color code into object containing integer values for the r,g,b use
            * This function (hexToRgb) originates from:
            * http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
            * @param {string} hex color code
            */
        hexToRgb(hex) {

            // Verify already RGB (e.g. "rgb(0,0,0)") or RGBA (e.g. "rgba(0,0,0,0.5)")
            var rgba = /^rgba?\(([\d]+),([\d]+),([\d]+)(,([\d\.]+))?\)$/;
            if (rgba.test(hex)) {
                var result = rgba.exec(hex);
                return {
                    r: parseInt(result[1]),
                    g: parseInt(result[2]),
                    b: parseInt(result[3]),
                    a: parseInt(result[5] ? result[5] : "1")
                };
            }

            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                return r + r + g + g + b + b;
            });

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

     

        /**
            * Function s4() and guid() originate from:
            * http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
            */
        s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        /**
            * Creates a unique id
            * @returns {String}
            */
        guid() {
            return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
                this.s4() + '-' + this.s4() + this.s4() + this.s4();
        }

        parse_date(str) {
            var match = str.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}\s[0-9]{1,2}:[0-9]{2}:[0-9]{2}$/);
            if (match !== null && match.length > 0) {
                var parts = str.split(" ");
                var date = parts[0].split("-");
                var time = parts[1].split(":");
                return new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]);
            }
            // Fallback for different date formats
            var d = Date.parse(str);
            if (!isNaN(d))
                return d;
            d = Date.parse(str.replace(/-/g, '/').replace('T', ' '));
            if (!isNaN(d))
                return d;
            // Cant find anything
            return new Date();
        }

        parse_times(diff, old_diff, total_duration, units, floor) {
            var raw_time = {};
            var raw_old_time = {};
            var time = {};
            var pct = {};
            var old_pct = {};
            var old_time = {};

            var greater_unit = null;
            for (var i = 0; i < units.length; i++) {
                var unit = units[i];
                var maxUnits;

                if (greater_unit === null) {
                    maxUnits = total_duration / this.secondsIn[unit];
                }
                else {
                    maxUnits = this.secondsIn[greater_unit] / this.secondsIn[unit];
                }

                var curUnits = (diff / this.secondsIn[unit]);
                var oldUnits = (old_diff / this.secondsIn[unit]);

                if (floor) {
                    if (curUnits > 0) curUnits = Math.floor(curUnits);
                    else curUnits = Math.ceil(curUnits);
                    if (oldUnits > 0) oldUnits = Math.floor(oldUnits);
                    else oldUnits = Math.ceil(oldUnits);
                }

                if (unit !== "Days") {
                    curUnits = curUnits % maxUnits;
                    oldUnits = oldUnits % maxUnits;
                }

                raw_time[unit] = curUnits;
                time[unit] = Math.abs(curUnits);
                raw_old_time[unit] = oldUnits;
                old_time[unit] = Math.abs(oldUnits);
                pct[unit] = Math.abs(curUnits) / maxUnits;
                old_pct[unit] = Math.abs(oldUnits) / maxUnits;

                greater_unit = unit;
            }

            return {
                raw_time: raw_time,
                raw_old_time: raw_old_time,
                time: time,
                old_time: old_time,
                pct: pct,
                old_pct: old_pct
            };
        }

        TC_Instance_List = {};
        updateUsedWindow() {
            if (typeof this.useWindow.TC_Instance_List !== "undefined") {
                this.TC_Instance_List = this.useWindow.TC_Instance_List;
            }
            else {
                this.useWindow.TC_Instance_List = this.TC_Instance_List;
            }
            this.initializeAnimationFrameHandler(this.useWindow);
        };

        initializeAnimationFrameHandler(w) {
            var vendors = ['webkit', 'moz'];
            for (var x = 0; x < vendors.length && !w.requestAnimationFrame; ++x) {
                w.requestAnimationFrame = w[vendors[x] + 'RequestAnimationFrame'];
                w.cancelAnimationFrame = w[vendors[x] + 'CancelAnimationFrame'];
            }

            if (!w.requestAnimationFrame || !w.cancelAnimationFrame) {
                w.requestAnimationFrame = function (callback, element, instance) {
                    if (typeof instance === "undefined")
                        instance = { data: { last_frame: 0 } };
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - instance.data.last_frame));
                    var id = w.setTimeout(function () {
                        callback(currTime + timeToCall);
                    }, timeToCall);
                    instance.data.last_frame = currTime + timeToCall;
                    return id;
                };
                w.cancelAnimationFrame = function (id) {
                    clearTimeout(id);
                };
            }
        };

        elements;
        options;



        getInstance(element) {
            var instance;

            var cur_id = $(element).data("tc-id");
            if (typeof cur_id === "undefined") {
                cur_id = this.guid();
                $(element).attr("data-tc-id", cur_id);
            }
            if (typeof this.TC_Instance_List[cur_id] === "undefined") {
                var options = this.options;
                var element_options = $(element).data('options');
                if (typeof element_options === "string") {
                    element_options = JSON.parse(element_options);
                }
                if (typeof element_options === "object") {
                    options = $.extend(true, {}, this.options, element_options);
                }
                instance = new TC_Instance(element, options);
                this.TC_Instance_List[cur_id] = instance;
            }
            else {
                instance = this.TC_Instance_List[cur_id];
                if (typeof this.options !== "undefined") {
                    instance.setOptions(this.options);
                }
            }
            return instance;
        };

        addTime(seconds_to_add) {
            this.foreach((instance) => {
                instance.addTime(seconds_to_add);
            });
        };

        foreach(callback) {
            var _this = this;
            this.elements.each(function () {
                var instance = _this.getInstance(this);
                if (typeof callback === "function") {
                    callback(instance);
                }
            });
            return this;
        };

        start() {
            this.foreach(function (instance) {
                instance.start();
            });
            return this;
        };

        stop() {
            this.foreach(function (instance) {
                instance.stop();
            });
            return this;
        };

        restart = function () {
            this.foreach(function (instance) {
                instance.restart();
            });
            return this;
        };

        rebuild = function () {
            this.foreach(function (instance) {
                instance.initialize(false);
            });
            return this;
        };

        getTime = function () {
            return this.getInstance(this.elements[0]).timeLeft();
        };

        addListener = function (f, type) {
            if (typeof type === "undefined")
                type = "visible";
            var _this = this;
            this.foreach(function (instance) {
                instance.addListener(f, _this.elements, type);
            });
            return this;
        };

        destroy = function () {
            this.foreach(function (instance) {
                instance.destroy();
            });
            return this;
        };

        end = function () {
            return this.elements;
        };
    }
}