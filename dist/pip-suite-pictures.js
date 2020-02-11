(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).pictures = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process,global,setImmediate){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function() {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function() {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function(fn) {
        setTimeout(fn, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;


    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];

        var iter = _keyIterator(object);
        var key, completed = 0;

        while ((key = iter()) != null) {
            completed += 1;
            iterator(object[key], key, only_once(done));
        }

        if (completed === 0) callback(null);

        function done(err) {
            completed--;
            if (err) {
                callback(err);
            }
            // Check key is null in case iterator isn't exhausted
            // and done resolved synchronously.
            else if (key === null && completed <= 0) {
                callback(null);
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.setImmediate(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        arr = arr || [];
        var results = _isArrayLike(arr) ? [] : {};
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    async.transform = function (arr, memo, iterator, callback) {
        if (arguments.length === 3) {
            callback = iterator;
            iterator = memo;
            memo = _isArray(arr) ? [] : {};
        }

        async.eachOf(arr, function(v, k, cb) {
            iterator(memo, v, k, cb);
        }, function(err) {
            callback(err, memo);
        });
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectLimit =
    async.filterLimit = doParallelLimit(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function(arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any =
    async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all =
    async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, concurrency, callback) {
        if (typeof arguments[1] === 'function') {
            // concurrency is optional, shift the args.
            callback = concurrency;
            concurrency = null;
        }
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }
        if (!concurrency) {
            concurrency = remainingTasks;
        }

        var results = {};
        var runningTasks = 0;

        var hasError = false;

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            if (hasError) return;
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                runningTasks--;
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    hasError = true;

                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has nonexistent dependency in ' + requires.join(', '));
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return runningTasks < concurrency && _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                runningTasks++;
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    runningTasks++;
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
            if(typeof t === 'number'){
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if(typeof t === 'object'){
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
                return function(seriesCallback){
                    setTimeout(function(){
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                }
                else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function(tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(
                null, args.concat(callArgs)
            );
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function(err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback.apply(null, [null].concat(args));
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function() {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function() {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function() {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function(next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;

                var removed = false;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    _arrayEach(workersList, function (worker, index) {
                        if (worker === task && !removed) {
                            workersList.splice(index, 1);
                            removed = true;
                        }
                    });

                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var workersList = [];
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                while(!q.paused && workers < q.concurrency && q.tasks.length){

                    var tasks = q.payload ?
                        q.tasks.splice(0, q.payload) :
                        q.tasks.splice(0, q.tasks.length);

                    var data = _map(tasks, function (task) {
                        return task.data;
                    });

                    if (q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    workersList.push(tasks[0]);
                    var cb = only_once(_next(q, tasks));
                    worker(data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            workersList: function () {
                return workersList;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + ((end - beg + 1) >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        var has = Object.prototype.hasOwnProperty;
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (has.call(memo, key)) {   
                async.setImmediate(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (has.call(queues, key)) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn) {
        return _restParam(function(fns, args) {
            var go = _restParam(function(args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            });
            if (args.length) {
                return go.apply(this, args);
            }
            else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function(values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function(value) {
                    callback(null, value);
                })["catch"](function(err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)

},{"_process":2,"timers":3}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":2,"timers":3}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AddImageOption_1 = require("./AddImageOption");
var ConfigTranslations = function (pipTranslateProvider) {
    pipTranslateProvider.translations('en', {
        'FILE': 'Upload pictures',
        'WEB_LINK': 'Use web link',
        'CAMERA': 'Take photo',
        'IMAGE_GALLERY': 'Use image library',
    });
    pipTranslateProvider.translations('ru', {
        'FILE': 'Загрузить картинку',
        'WEB_LINK': 'Вставить веб ссылка',
        'CAMERA': 'Использовать камеру',
        'IMAGE_GALLERY': 'Открыть галерею изображений'
    });
};
ConfigTranslations.$inject = ['pipTranslateProvider'];
{
    var AddImageController_1 = (function () {
        AddImageController_1.$inject = ['$scope', '$element', '$mdMenu', '$timeout', 'pipCameraDialog', 'pipPictureUrlDialog', 'pipGallerySearchDialog'];
        function AddImageController_1($scope, $element, $mdMenu, $timeout, pipCameraDialog, pipPictureUrlDialog, pipGallerySearchDialog) {
            "ngInject";
            this.$scope = $scope;
            this.$element = $element;
            this.$mdMenu = $mdMenu;
            this.$timeout = $timeout;
            this.pipCameraDialog = pipCameraDialog;
            this.pipPictureUrlDialog = pipPictureUrlDialog;
            this.pipGallerySearchDialog = pipGallerySearchDialog;
            var defaultOption = new AddImageOption_1.AddImageOption();
            this.option = _.assign(defaultOption, this.$scope.option);
        }
        AddImageController_1.prototype.openMenu = function ($mdOpenMenu) {
            if (this.$scope.ngDisabled()) {
                return;
            }
            $mdOpenMenu();
        };
        AddImageController_1.prototype.toBoolean = function (value) {
            if (!value) {
                return false;
            }
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        AddImageController_1.prototype.isMulti = function () {
            if (this.$scope.multi !== undefined && this.$scope.multi !== null) {
                if (angular.isFunction(this.$scope.multi)) {
                    return this.toBoolean(this.$scope.multi());
                }
                else {
                    return this.toBoolean(this.$scope.multi);
                }
            }
            else {
                return true;
            }
        };
        AddImageController_1.prototype.hideMenu = function () {
            this.$mdMenu.hide();
        };
        AddImageController_1.prototype.dataURItoBlob = function (dataURI) {
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0) {
                byteString = atob(dataURI.split(',')[1]);
            }
            else {
                byteString = unescape(dataURI.split(',')[1]);
            }
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            var ia = new Uint8Array(byteString.length);
            var i;
            for (i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ia], { type: mimeString });
        };
        AddImageController_1.prototype.addImages = function (images) {
            var _this = this;
            if (images === undefined) {
                return;
            }
            if (angular.isArray(images)) {
                images.forEach(function (img) {
                    if (_this.$scope.onChange) {
                        _this.$scope.onChange(img);
                    }
                });
            }
            else {
                if (this.$scope.onChange) {
                    this.$scope.onChange(images);
                }
            }
            if (this.$scope.$images === undefined || !Array.isArray(this.$scope.$images)) {
                return;
            }
            if (Array.isArray(images)) {
                images.forEach(function (img) {
                    _this.$scope.$images.push(img);
                });
            }
            else {
                this.$scope.$images.push(images);
            }
        };
        AddImageController_1.prototype.onFileChange = function ($files) {
            var _this = this;
            if ($files == null || $files.length == 0) {
                return;
            }
            $files.forEach(function (file) {
                if (file.type.indexOf('image') > -1) {
                    _this.$timeout(function () {
                        var fileReader = new FileReader();
                        fileReader.readAsDataURL(file);
                        fileReader.onload = function (e) {
                            _this.$timeout(function () {
                                _this.addImages({ url: null, uriData: e.target.result, file: file, picture: null });
                            });
                        };
                    });
                }
            });
        };
        AddImageController_1.prototype.onWebLinkClick = function () {
            var _this = this;
            this.pipPictureUrlDialog.show(function (result) {
                var blob = null;
                if (result.substring(0, 10) == 'data:image') {
                    blob = _this.dataURItoBlob(result);
                    blob.name = result.slice(result.lastIndexOf('/') + 1, result.length).split('?')[0];
                }
                _this.addImages({ url: result, uriData: null, file: blob, picture: null });
            });
        };
        AddImageController_1.prototype.onCameraClick = function () {
            var _this = this;
            this.pipCameraDialog.show(function (result) {
                var blob = _this.dataURItoBlob(result);
                blob.name = 'camera';
                _this.addImages({ url: null, uriData: result, file: blob, picture: null });
            });
        };
        AddImageController_1.prototype.onGalleryClick = function () {
            var _this = this;
            this.pipGallerySearchDialog.show({
                multiple: this.isMulti()
            }, function (result) {
                if (_this.isMulti()) {
                    var imgs_1 = [];
                    result.forEach(function (item) {
                        imgs_1.push({ url: null, uriData: null, file: null, picture: item });
                    });
                    _this.addImages(imgs_1);
                }
                else {
                    _this.addImages({ url: null, uriData: null, file: null, picture: result[0] });
                }
            });
        };
        return AddImageController_1;
    }());
    var AddImage = function () {
        return {
            restrict: 'AC',
            scope: {
                $images: '=pipImages',
                onChange: '&pipChanged',
                multi: '&pipMulti',
                option: '=pipOption',
                ngDisabled: '&'
            },
            transclude: true,
            templateUrl: 'add_image/AddImage.html',
            controller: AddImageController_1,
            controllerAs: 'vm'
        };
    };
    angular
        .module('pipAddImage', ['pipCameraDialog', 'pipPictureUrlDialog', 'pipGallerySearchDialog', 'angularFileUpload'])
        .config(ConfigTranslations)
        .directive('pipAddImage', AddImage);
}
},{"./AddImageOption":5}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AddImageOption = (function () {
    function AddImageOption() {
        this.Upload = true;
        this.WebLink = true;
        this.Camera = true;
        this.Galery = true;
    }
    return AddImageOption;
}());
exports.AddImageOption = AddImageOption;
},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AddImageResult = (function () {
    function AddImageResult() {
    }
    return AddImageResult;
}());
exports.AddImageResult = AddImageResult;
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IAvatarDataService_1 = require("../data/IAvatarDataService");
var AvatarEdit_1 = require("../avatar_edit/AvatarEdit");
{
    var AvatarBindings = {
        pipId: '<?',
        pipUrl: '<?',
        pipName: '<?',
        ngClass: '<?',
        pipRebindAvatar: '<?',
        pipRebind: '<?'
    };
    var AvatarBindingsChanges = (function () {
        function AvatarBindingsChanges() {
        }
        return AvatarBindingsChanges;
    }());
    var AvatarController = (function () {
        AvatarController.$inject = ['$log', '$http', '$rootScope', '$element', 'pipAvatarData', 'pipPictureUtils', 'pipCodes', '$timeout'];
        function AvatarController($log, $http, $rootScope, $element, pipAvatarData, pipPictureUtils, pipCodes, $timeout) {
            "ngInject";
            var _this = this;
            this.$log = $log;
            this.$http = $http;
            this.$rootScope = $rootScope;
            this.$element = $element;
            this.pipAvatarData = pipAvatarData;
            this.pipPictureUtils = pipPictureUtils;
            this.pipCodes = pipCodes;
            this.$timeout = $timeout;
            this.postLink = false;
            this.image = null;
            this.initial = this.pipAvatarData.DefaultInitial;
            $element.addClass('pip-avatar flex-fixed');
            this.$rootScope.$on(AvatarEdit_1.ReloadAvatar, function ($event, id) {
                if (_this.pipId == id && _this.pipRebind) {
                    _this.refreshAvatar();
                }
            });
        }
        AvatarController.prototype.$postLink = function () {
            var _this = this;
            this.imageElement = this.$element.children('img');
            this.defaultAvatarElement = this.$element.find('#default-avatar');
            this.imageElement
                .load(function ($event) {
                _this.image = $($event.target);
                _this.pipPictureUtils.setImageMarginCSS(_this.$element, _this.image);
            })
                .error(function ($event) {
                _this.showAvatarByName();
            });
            this.bindControl();
            this.postLink = true;
        };
        AvatarController.prototype.$onChanges = function (changes) {
            var _this = this;
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }
            if (changes.pipRebindAvatar && changes.pipRebindAvatar.currentValue !== changes.pipRebindAvatar.previousValue) {
                this.pipRebindAvatar = changes.pipRebindAvatar.currentValue;
            }
            if (changes.ngClass && changes.ngClass.currentValue !== changes.ngClass.previousValue) {
                this.ngClass = changes.ngClass.currentValue;
                setTimeout(function () {
                    _this.pipPictureUtils.setImageMarginCSS(_this.$element, _this.image);
                }, 50);
            }
            var isDataChange = false;
            if (this.pipRebind) {
                if (changes.pipId && changes.pipId.currentValue !== changes.pipId.previousValue) {
                    this.pipId = changes.pipId.currentValue;
                    isDataChange = true;
                }
                if (changes.pipUrl && changes.pipUrl.currentValue !== changes.pipUrl.previousValue) {
                    this.pipUrl = changes.pipUrl.currentValue;
                    isDataChange = true;
                }
                if (changes.pipName && changes.pipName.currentValue !== changes.pipName.previousValue) {
                    this.pipName = changes.pipName.currentValue;
                    isDataChange = true;
                }
            }
            if (isDataChange && this.postLink) {
                this.refreshAvatar();
            }
        };
        AvatarController.prototype.showAvatarByName = function () {
            var _this = this;
            this.$timeout(function () {
                var colorClassIndex = _this.pipCodes.hash(_this.pipId) % IAvatarDataService_1.colors.length;
                _this.defaultAvatarElement.removeAttr('class');
                _this.defaultAvatarElement.addClass(IAvatarDataService_1.colorClasses[colorClassIndex]);
                _this.imageElement.css('display', 'none');
                _this.defaultAvatarElement.css('display', 'inline-block');
            });
        };
        AvatarController.prototype.toBoolean = function (value) {
            if (!value) {
                return false;
            }
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        AvatarController.prototype.refreshAvatar = function () {
            if (!this.pipAvatarData.ShowOnlyNameIcon) {
                this.imageElement.attr('src', '');
                this.imageElement.css('display', 'inline-block');
                this.defaultAvatarElement.css('display', 'none');
            }
            this.bindControl();
        };
        ;
        AvatarController.prototype.bindControl = function () {
            var _this = this;
            if (this.pipRebindAvatar) {
                this.cleanupAvatarUpdated = this.$rootScope.$on('pipPartyAvatarUpdated', function () { _this.refreshAvatar(); });
            }
            else {
                if (this.cleanupAvatarUpdated) {
                    this.cleanupAvatarUpdated();
                }
            }
            if (this.pipName) {
                this.initial = this.pipName.charAt(0);
            }
            else {
                this.initial = this.pipAvatarData.DefaultInitial;
            }
            if (!this.pipAvatarData.ShowOnlyNameIcon) {
                var url = this.pipId ? this.pipAvatarData.getAvatarUrl(this.pipId) : this.pipUrl;
                this.imageElement.attr('src', url);
            }
            else {
                this.showAvatarByName();
            }
        };
        return AvatarController;
    }());
    var AvatarComponent = {
        bindings: AvatarBindings,
        template: '<img/><div id="default-avatar">{{ $ctrl.initial }}</div>',
        controller: AvatarController
    };
    angular
        .module('pipAvatar', ['pipPictureUtils'])
        .component('pipAvatar', AvatarComponent);
}
},{"../avatar_edit/AvatarEdit":8,"../data/IAvatarDataService":18}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PicturePaste_1 = require("../utilities/PicturePaste");
var AddImageOption_1 = require("../add_image/AddImageOption");
exports.ReloadAvatar = 'pipReloadAvatar';
var AvatarEditControl = (function () {
    function AvatarEditControl() {
        this.disabled = false;
        this.url = '';
        this.progress = 0;
        this.uploaded = false;
        this.uploading = false;
        this.upload = false;
        this.loaded = false;
        this.file = null;
        this.state = AvatarStates.Original;
    }
    return AvatarEditControl;
}());
exports.AvatarEditControl = AvatarEditControl;
var AvatarStates = (function () {
    function AvatarStates() {
    }
    return AvatarStates;
}());
AvatarStates.Original = 'original';
AvatarStates.Changed = 'changed';
AvatarStates.Deleted = 'deleted';
AvatarStates.Error = 'error';
exports.AvatarStates = AvatarStates;
{
    var ConfigAvatarEditTranslations = function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            'PICTURE_EDIT_TEXT': 'Click here to upload a picture',
            'PICTURE_ERROR_LOAD': 'Error image loading'
        });
        pipTranslateProvider.translations('ru', {
            'PICTURE_EDIT_TEXT': 'Нажмите сюда для загрузки картинки',
            'PICTURE_ERROR_LOAD': 'Ошибка загрузки картинки'
        });
    };
    ConfigAvatarEditTranslations.$inject = ['pipTranslateProvider'];
    var SenderEvent = (function () {
        function SenderEvent() {
        }
        return SenderEvent;
    }());
    var AvatarEvent = (function () {
        function AvatarEvent() {
        }
        return AvatarEvent;
    }());
    var AvatarEditBindings = {
        ngDisabled: '<?',
        pipCreated: '&?',
        pipChanged: '&?',
        pipReset: '<?',
        pipId: '<?',
        text: '<?pipDefaultText',
        icon: '<?pipDefaultIcon',
        pipRebind: '<?',
    };
    var AvatarEditBindingsChanges = (function () {
        function AvatarEditBindingsChanges() {
        }
        return AvatarEditBindingsChanges;
    }());
    var AvatarEditController = (function () {
        AvatarEditController.$inject = ['$log', '$scope', '$http', '$rootScope', '$element', '$timeout', 'pipAvatarData', 'pipCodes', 'pipPictureUtils', 'pipFileUpload', 'pipRest'];
        function AvatarEditController($log, $scope, $http, $rootScope, $element, $timeout, pipAvatarData, pipCodes, pipPictureUtils, pipFileUpload, pipRest) {
            "ngInject";
            var _this = this;
            this.$log = $log;
            this.$scope = $scope;
            this.$http = $http;
            this.$rootScope = $rootScope;
            this.$element = $element;
            this.$timeout = $timeout;
            this.pipAvatarData = pipAvatarData;
            this.pipCodes = pipCodes;
            this.pipPictureUtils = pipPictureUtils;
            this.pipFileUpload = pipFileUpload;
            this.pipRest = pipRest;
            this.pipPicturePaste = new PicturePaste_1.PicturePaste($timeout);
            this.option = new AddImageOption_1.AddImageOption();
            this.option.WebLink = false;
            this.option.Galery = false;
            this.text = this.text || 'PICTURE_EDIT_TEXT';
            this.icon = this.icon || 'picture-no-border';
            this.errorText = 'PICTURE_ERROR_LOAD';
            this.control = new AvatarEditControl();
            this.multiUpload = false;
            this.control.reset = function (afterDeleting) {
                _this.reset(afterDeleting);
            };
            this.control.save = function (id, successCallback, errorCallback) {
                _this.save(id, successCallback, errorCallback);
            };
            $element.addClass('pip-picture-edit');
        }
        AvatarEditController.prototype.$postLink = function () {
            var _this = this;
            this.controlElement = this.$element.children('.pip-picture-upload');
            this.inputElement = this.controlElement.children('input[type=file]');
            this.$element.children('.pip-picture-upload').focus(function () {
                _this.pipPicturePaste.addPasteListener(function (item) {
                    _this.readItemLocally(item.url, item.uriData, item.file, item.picture);
                });
            });
            this.$element.children('.pip-picture-upload').blur(function () {
                _this.pipPicturePaste.removePasteListener();
            });
            if (this.pipCreated) {
                this.pipCreated({
                    $event: { $control: this.control },
                    $control: this.control
                });
            }
            this.control.reset();
        };
        AvatarEditController.prototype.$onChanges = function (changes) {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }
            if (changes.pipReset && changes.pipReset.currentValue !== changes.pipReset.previousValue) {
                this.pipReset = changes.pipReset.currentValue;
            }
            var isReset = false;
            if (this.pipRebind) {
                if (changes.pipId && changes.pipId.currentValue !== changes.pipId.previousValue) {
                    this.pipId = changes.pipId.currentValue;
                    if (this.pipReset !== false) {
                        isReset = true;
                    }
                }
                if (changes.ngDisabled && changes.ngDisabled.currentValue !== changes.ngDisabled.previousValue) {
                    this.ngDisabled = changes.ngDisabled.currentValue;
                }
            }
            if (changes.pipId && changes.pipId.currentValue && this.control && this.control.state != AvatarStates.Deleted && this.control.state != AvatarStates.Changed) {
                isReset = true;
            }
            if (isReset) {
                this.control.reset();
            }
        };
        AvatarEditController.prototype.reset = function (afterDeleting) {
            this.control.progress = 0;
            this.control.uploading = false;
            this.control.uploaded = false;
            this.control.file = null;
            this.control.state = AvatarStates.Original;
            this.control.url = '';
            this.control.uriData = null;
            if (!afterDeleting) {
                var url = this.pipId ? this.pipAvatarData.getAvatarUrl(this.pipId) : '';
                if (!url)
                    return;
                this.control.progress = 0;
                this.control.url = url;
                this.control.uploaded = this.control.url != '';
                this.onChange();
            }
            else
                this.onChange();
        };
        AvatarEditController.prototype.saveAvatar = function (id, successCallback, errorCallback) {
            var _this = this;
            if (!id) {
                id = this.pipId;
            }
            if (this.control.file !== null) {
                var fd = new FormData();
                fd.append('file', this.control.file);
                this.control.uploading = true;
                this.$http.put(this.pipAvatarData.getAvatarUrl(id), fd, {
                    uploadEventHandlers: {
                        progress: function (e) {
                            if (e.lengthComputable) {
                                _this.control.progress = (e.loaded / e.total) * 100;
                            }
                        }
                    },
                    headers: { 'Content-Type': undefined }
                })
                    .success(function (response) {
                    _this.control.progress = 100;
                    _this.pipId = response.id;
                    _this.$rootScope.$broadcast(exports.ReloadAvatar, _this.pipId);
                    _this.control.reset();
                    if (successCallback) {
                        successCallback(response);
                    }
                })
                    .error(function (error) {
                    _this.control.progress = 0;
                    _this.control.uploading = false;
                    _this.control.upload = false;
                    _this.control.progress = 0;
                    _this.control.state = AvatarStates.Original;
                    if (errorCallback) {
                        errorCallback(error);
                    }
                    else {
                        _this.$log.error(error);
                    }
                });
            }
        };
        AvatarEditController.prototype.deletePicture = function (successCallback, errorCallback) {
            var _this = this;
            this.pipAvatarData.deleteAvatar(this.pipId, function () {
                _this.$rootScope.$broadcast(exports.ReloadAvatar, _this.pipId);
                _this.control.reset(true);
                if (successCallback) {
                    successCallback();
                }
            }, function (error) {
                _this.control.uploading = false;
                _this.control.upload = false;
                _this.control.progress = 0;
                _this.control.state = AvatarStates.Original;
                if (errorCallback) {
                    errorCallback(error);
                }
                else {
                    _this.$log.error(error);
                }
            });
        };
        AvatarEditController.prototype.save = function (id, successCallback, errorCallback) {
            if (this.control.state == AvatarStates.Changed) {
                this.saveAvatar(id, successCallback, errorCallback);
            }
            else if (this.control.state == AvatarStates.Deleted) {
                this.deletePicture(successCallback, errorCallback);
            }
            else {
                if (successCallback)
                    successCallback();
            }
        };
        AvatarEditController.prototype.empty = function () {
            return this.control.url == '' && !this.control.uploading;
        };
        ;
        AvatarEditController.prototype.isUpdated = function () {
            return this.control.state != AvatarStates.Original;
        };
        ;
        AvatarEditController.prototype.readItemLocally = function (url, uriData, file, picture) {
            if (picture) {
                this.control.url = this.pipAvatarData.getAvatarUrl(this.pipId);
            }
            else {
                this.control.file = file;
                this.control.url = file ? uriData : url ? url : '';
            }
            this.control.state = AvatarStates.Changed;
            this.onChange();
        };
        ;
        AvatarEditController.prototype.onDeleteClick = function ($event) {
            if ($event) {
                $event.stopPropagation();
            }
            this.controlElement.focus();
            this.control.file = null;
            this.control.url = '';
            this.control.state = AvatarStates.Deleted;
            this.onChange();
        };
        ;
        AvatarEditController.prototype.onKeyDown = function ($event) {
            var _this = this;
            if ($event.keyCode == 13 || $event.keyCode == 32) {
                setTimeout(function () {
                    _this.controlElement.trigger('click');
                }, 0);
            }
            else if ($event.keyCode == 46 || $event.keyCode == 8) {
                this.control.file = null;
                this.control.url = '';
                this.control.state = AvatarStates.Deleted;
                this.onChange();
            }
            else if ($event.keyCode == 27) {
                this.control.reset();
            }
        };
        ;
        AvatarEditController.prototype.onImageError = function ($event) {
            var _this = this;
            this.$scope.$apply(function () {
                _this.control.url = '';
                var image = $($event.target);
                _this.control.state = AvatarStates.Original;
                _this.pipPictureUtils.setErrorImageCSS(image, { width: 'auto', height: '100%' });
            });
        };
        ;
        AvatarEditController.prototype.onImageLoad = function ($event) {
            var image = $($event.target);
            var container = {};
            container.clientWidth = 80;
            container.clientHeight = 80;
            this.pipPictureUtils.setImageMarginCSS(container, image);
            this.control.uploading = false;
        };
        ;
        AvatarEditController.prototype.onChange = function () {
            if (this.pipChanged) {
                this.pipChanged({
                    $event: { $control: this.control },
                    $control: this.control
                });
            }
        };
        ;
        return AvatarEditController;
    }());
    var AvatarEditComponent = {
        bindings: AvatarEditBindings,
        templateUrl: 'picture_edit/PictureEdit.html',
        controller: AvatarEditController
    };
    angular
        .module('pipAvatarEdit', ['ui.event', 'pipPictureUtils', 'pipPictures.Templates', 'pipFiles'])
        .config(ConfigAvatarEditTranslations)
        .component('pipAvatarEdit', AvatarEditComponent);
}
},{"../add_image/AddImageOption":5,"../utilities/PicturePaste":43}],9:[function(require,module,exports){
var ConfigCameraDialogTranslations = function (pipTranslateProvider) {
    pipTranslateProvider.translations('en', {
        'TAKE_PICTURE': 'Take a picture',
        'WEB_CAM_ERROR': 'Webcam is missing or was not found'
    });
    pipTranslateProvider.translations('ru', {
        'TAKE_PICTURE': 'Сделать фото',
        'WEB_CAM_ERROR': 'Web-камера отсутствует или не найдена'
    });
};
ConfigCameraDialogTranslations.$inject = ['pipTranslateProvider'];
{
    var CameraDialogController = (function () {
        CameraDialogController.$inject = ['$mdDialog', '$rootScope', '$timeout', '$mdMenu', 'pipSystemInfo'];
        function CameraDialogController($mdDialog, $rootScope, $timeout, $mdMenu, pipSystemInfo) {
            "ngInject";
            this.$mdDialog = $mdDialog;
            this.$rootScope = $rootScope;
            this.$timeout = $timeout;
            this.$mdMenu = $mdMenu;
            this.pipSystemInfo = pipSystemInfo;
            this.theme = this.$rootScope[pip.themes.ThemeRootVar];
            this.browser = this.pipSystemInfo.os;
            this.freeze = false;
            this.onInit();
        }
        CameraDialogController.prototype.onInit = function () {
            var _this = this;
            if (this.browser !== 'android') {
                Webcam.init();
                setTimeout(function () {
                    Webcam.attach('.camera-stream');
                }, 0);
                Webcam.on('error', function (err) {
                    _this.webCamError = true;
                    console.error(err);
                });
                Webcam.set({
                    width: 400,
                    height: 300,
                    dest_width: 400,
                    dest_height: 300,
                    crop_width: 400,
                    crop_height: 300,
                    image_format: 'jpeg',
                    jpeg_quality: 90
                });
                Webcam.setSWFLocation('webcam.swf');
            }
            else {
                document.addEventListener("deviceready", this.onDeviceReady, false);
            }
        };
        CameraDialogController.prototype.onDeviceReady = function () {
            var _this = this;
            navigator.camera.getPicture(function (data) { _this.onSuccess(data); }, function (message) { _this.onFail(message); }, {
                sourceType: Camera.PictureSourceType.CAMERA,
                correctOrientation: true,
                quality: 75,
                targetWidth: 200,
                destinationType: Camera.DestinationType.DATA_URL
            });
        };
        CameraDialogController.prototype.onSuccess = function (imageData) {
            var picture = 'data:image/jpeg;base64,' + imageData;
            this.$mdDialog.hide(picture);
        };
        CameraDialogController.prototype.onFail = function (message) {
            alert('Failed because: ' + message);
            this.$mdDialog.hide();
        };
        CameraDialogController.prototype.onTakePictureClick = function () {
            var _this = this;
            if (Webcam) {
                if (this.freeze) {
                    Webcam.snap(function (dataUri) {
                        _this.freeze = false;
                        _this.$mdDialog.hide(dataUri);
                    });
                }
                else {
                    this.freeze = true;
                    Webcam.freeze();
                }
            }
        };
        CameraDialogController.prototype.onResetPicture = function () {
            this.freeze = false;
            Webcam.unfreeze();
        };
        CameraDialogController.prototype.onCancelClick = function () {
            this.$mdDialog.cancel();
        };
        return CameraDialogController;
    }());
    angular
        .module('pipCameraDialog')
        .config(ConfigCameraDialogTranslations)
        .controller('pipCameraDialogController', CameraDialogController);
}
},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CameraDialogService = (function () {
    CameraDialogService.$inject = ['$mdDialog'];
    function CameraDialogService($mdDialog) {
        this._mdDialog = $mdDialog;
    }
    CameraDialogService.prototype.show = function (successCallback, cancelCallback) {
        this._mdDialog.show({
            templateUrl: 'camera_dialog/CameraDialog.html',
            clickOutsideToClose: true,
            controller: 'pipCameraDialogController',
            controllerAs: '$ctrl'
        })
            .then(function (result) {
            Webcam.reset();
            if (successCallback) {
                successCallback(result);
            }
        }, function () {
            Webcam.reset();
        });
    };
    return CameraDialogService;
}());
angular
    .module('pipCameraDialog')
    .service('pipCameraDialog', CameraDialogService);
},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipCameraDialog', ['ngMaterial', 'pipServices', 'pipPictures.Templates']);
require("./ICameraDialogService");
require("./CameraDialogService");
require("./CameraDialogController");
},{"./CameraDialogController":9,"./CameraDialogService":10,"./ICameraDialogService":11}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var ContainerSize = (function () {
        function ContainerSize() {
        }
        return ContainerSize;
    }());
    var CollageBindings = {
        pipPictureIds: '<?',
        pipSrcs: '<?',
        pipPictures: '<?',
        uniqueCode: '<?pipUniqueCode',
        multiple: '<?pipMultiple',
        allowOpen: '<?pipOpen',
        pipRebind: '<?',
    };
    var CollageBindingsChanges = (function () {
        function CollageBindingsChanges() {
        }
        return CollageBindingsChanges;
    }());
    var CollageController = (function () {
        CollageController.$inject = ['$log', '$scope', '$rootScope', '$element', 'pipPictureData', 'pipPictureUtils', 'pipCodes'];
        function CollageController($log, $scope, $rootScope, $element, pipPictureData, pipPictureUtils, pipCodes) {
            "ngInject";
            var _this = this;
            this.$log = $log;
            this.$scope = $scope;
            this.$rootScope = $rootScope;
            this.$element = $element;
            this.pipPictureData = pipPictureData;
            this.pipPictureUtils = pipPictureUtils;
            this.pipCodes = pipCodes;
            $element.addClass('pip-collage');
            this.collageSchemes = pipPictureUtils.getCollageSchemes(),
                this.resized = 0;
            this.svgData = '<?xml version="1.0" encoding="utf-8"?>' +
                '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
                '<svg version="1.1"' +
                'xmlns="http://www.w3.org/2000/svg"' +
                'xmlns:xlink="http://www.w3.org/1999/xlink"' +
                'x="0px" y="0px"' +
                'viewBox="0 0 510 510"' +
                'style="enable-background:new 0 0 515 515;"' +
                'xml:space="preserve">' +
                '<defs>' +
                '<style type="text/css"><![CDATA[' +
                '#symbol-picture-no-border {' +
                '        transform-origin: 50% 50%;' +
                '        transform: scale(0.6, -0.6);' +
                '    }' +
                '        ]]></style>' +
                '        </defs>' +
                '<rect x="0" width="515" height="515"/>' +
                '<path id="symbol-picture-no-border" d="M120 325l136-102 69 33 136-82 0-54-410 0 0 136z m341 15c0-28-23-51-51-51-29 0-52 23-52 51 0 29 23 52 52 52 28 0 51-23 51-52z" />' +
                '</svg>';
            this.debounceCalculateResize = _.debounce(function () { _this.calculateResize(); }, 50);
        }
        CollageController.prototype.$postLink = function () {
            var _this = this;
            this.$scope.getElementDimensions = function () {
                var dimension = {
                    'h': _this.$element.height(),
                    'w': _this.$element.width()
                };
                return dimension;
            };
            this.$scope.$watch(this.$scope.getElementDimensions, function (newValue, oldValue) {
                if (newValue && oldValue && oldValue.h == newValue.h && oldValue.w == newValue.w)
                    return;
                _this.debounceCalculateResize();
            }, true);
            this.generateContent();
        };
        CollageController.prototype.$onChanges = function (changes) {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }
            if (changes.allowOpen && changes.allowOpen.currentValue !== changes.allowOpen.previousValue) {
                this.allowOpen = changes.allowOpen.currentValue;
            }
            var isChanged = false;
            if (this.pipRebind) {
                if (changes.pipSrcs && !_.isEqual(changes.pipSrcs.currentValue, changes.pipSrcs.previousValue)) {
                    this.pipSrcs = changes.pipSrcs.currentValue;
                    isChanged = true;
                }
                if (changes.pipPictureIds && !_.isEqual(changes.pipPictureIds.currentValue, changes.pipPictureIds.previousValue)) {
                    this.pipPictureIds = changes.pipPictureIds.currentValue;
                    isChanged = true;
                }
                if (changes.pipPictures && !_.isEqual(changes.pipPictures.currentValue, changes.pipPictures.previousValue)) {
                    this.pipPictures = changes.pipPictures.currentValue;
                    isChanged = true;
                }
            }
            if (isChanged) {
                this.generateContent();
            }
        };
        CollageController.prototype.calculateResize = function () {
            var ims = this.$element.find('img');
            var i = 0;
            for (i; i < ims.length; i++) {
                var container = angular.element(ims[i].parentElement);
                var image = angular.element(ims[i]);
                if (image.css('display') != 'none') {
                    this.pipPictureUtils.setImageMarginCSS(container, image);
                }
            }
            var icns = this.$element.find('md-icon');
            for (i; i < icns.length; i++) {
                var container = angular.element(icns[i].parentElement);
                var icn = angular.element(icns[i]);
                if (container.css('display') != 'none') {
                    this.pipPictureUtils.setIconMarginCSS(container[0], icn);
                }
            }
        };
        CollageController.prototype.onImageError = function ($event) {
            var image = $($event.target);
            var container = image.parent();
            var defaultBlock = container.children('div');
            var defaultIcon = image.parent().find('md-icon');
            defaultBlock.css('display', 'block');
            image.css('display', 'none');
            this.pipPictureUtils.setIconMarginCSS(container[0], defaultIcon);
            defaultIcon.empty().append(this.svgData);
        };
        CollageController.prototype.onImageLoad = function ($event) {
            var image = $($event.target);
            var container = image.parent();
            var defaultBlock = container.children('div');
            this.pipPictureUtils.setImageMarginCSS(container, image);
            defaultBlock.css('display', 'none');
        };
        CollageController.prototype.getScheme = function (count) {
            var schemes = this.collageSchemes[count - 1];
            if (schemes.length == 1)
                return schemes[0];
            var uniqueCode = this.uniqueCode ? this.uniqueCode : '';
            var hash = this.pipCodes.hash(uniqueCode);
            return schemes[hash % schemes.length];
        };
        CollageController.prototype.getImageUrls = function () {
            if (this.pipSrcs) {
                return _.clone(this.pipSrcs);
            }
            var i;
            var result = [];
            if (this.pipPictureIds) {
                for (i = 0; i < this.pipPictureIds.length; i++) {
                    result.push(this.pipPictureData.getPictureUrl(this.pipPictureIds[i]));
                }
            }
            else if (this.pipPictures) {
                for (i = 0; i < this.pipPictures.length; i++) {
                    var url = this.pipPictures[i].uri ? this.pipPictures[i].uri : this.pipPictureData.getPictureUrl(this.pipPictures[i].id);
                    result.push(url);
                }
            }
            return result;
        };
        CollageController.prototype.generatePicture = function (urls, scheme) {
            var url = urls[0];
            var containerClasses = '';
            var pictureClasses = '';
            urls.splice(0, 1);
            containerClasses += scheme.fullWidth ? ' pip-full-width' : '';
            containerClasses += scheme.fullHeight ? ' pip-full-height' : '';
            containerClasses += ' flex-' + scheme.flex;
            pictureClasses += scheme.leftPadding ? ' pip-left' : '';
            pictureClasses += scheme.rightPadding ? ' pip-right' : '';
            pictureClasses += scheme.topPadding ? ' pip-top' : '';
            pictureClasses += scheme.bottomPadding ? ' pip-bottom' : '';
            if (this.allowOpen) {
                return '<a class="pip-picture-container' + containerClasses + '" flex="' + scheme.flex + '" '
                    + 'href="' + url + '"  target="_blank">'
                    + '<div class="pip-picture' + pictureClasses + '"><img src="' + url + '"/>'
                    + '<div><md-icon class="collage-error-icon" md-svg-icon="icons:picture-no-border"></md-icon></div></div></a>';
            }
            return '<div class="pip-picture-container' + containerClasses + '" flex="' + scheme.flex + '">'
                + '<div class="pip-picture' + pictureClasses + '"><img src="' + url + '"/>'
                + '<div><md-icon class="collage-error-icon" md-svg-icon="icons:picture-no-border"></md-icon></div></div></div>';
        };
        CollageController.prototype.generatePictureGroup = function (urls, scheme) {
            var classes = '';
            var result;
            var i;
            classes += scheme.fullWidth ? ' pip-full-width' : '';
            classes += scheme.fullHeight ? ' pip-full-height' : '';
            classes += ' flex-' + scheme.flex;
            classes += ' layout-' + scheme.layout;
            result = '<div class="pip-picture-group layout' + classes + '" flex="'
                + scheme.flex + '" layout="' + scheme.layout + '">';
            for (i = 0; i < scheme.children.length; i++) {
                result += this.generate(urls, scheme.children[i]);
            }
            result += '</div>';
            return result;
        };
        CollageController.prototype.generate = function (urls, scheme) {
            if (scheme.group) {
                return this.generatePictureGroup(urls, scheme);
            }
            return this.generatePicture(urls, scheme);
        };
        CollageController.prototype.generateContent = function () {
            var _this = this;
            this.$element.find('img')
                .unbind('error')
                .unbind('load');
            this.$element.empty();
            var urls = this.getImageUrls();
            var scheme;
            var html;
            if (urls.length == 0) {
                this.$element.hide();
                return;
            }
            if (urls.length > 8) {
                if (!this.multiple) {
                    urls.length = 8;
                }
            }
            if (urls.length <= 8) {
                scheme = this.getScheme(urls.length);
                html = '<div class="pip-collage-section">' + this.generate(urls, scheme) + '</div>';
                html += '<div class="clearfix"></div>';
                this.$element.html(html);
            }
            else {
                html = '';
                while (urls.length > 0) {
                    var partialUrls = urls.splice(0, 8);
                    scheme = this.getScheme(partialUrls.length);
                    html += '<div class="pip-collage-section">' + this.generate(partialUrls, scheme) + '</div>';
                }
                html += '<div class="clearfix"></div>';
                this.$element.html(html);
            }
            this.$element.find('img')
                .bind('error', function (event) { _this.onImageError(event); })
                .bind('load', function (event) { _this.onImageLoad(event); });
            this.$element.show();
        };
        return CollageController;
    }());
    var CollageComponent = {
        bindings: CollageBindings,
        controller: CollageController
    };
    angular
        .module('pipCollage', [])
        .component('pipCollage', CollageComponent);
}
},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Attachment = (function () {
    function Attachment(id, uri, name) {
        this.id = id;
        this.uri = uri;
        this.name = name;
    }
    return Attachment;
}());
exports.Attachment = Attachment;
},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IAvatarDataService_1 = require("./IAvatarDataService");
var AvatarData = (function () {
    AvatarData.$inject = ['_config', 'pipRest'];
    function AvatarData(_config, pipRest) {
        "ngInject";
        this._config = _config;
        this.pipRest = pipRest;
    }
    Object.defineProperty(AvatarData.prototype, "AvatarRoute", {
        get: function () {
            return this._config.AvatarRoute;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AvatarData.prototype, "ShowOnlyNameIcon", {
        get: function () {
            return this._config.ShowOnlyNameIcon;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AvatarData.prototype, "DefaultInitial", {
        get: function () {
            return this._config.DefaultInitial;
        },
        enumerable: true,
        configurable: true
    });
    AvatarData.prototype.getAvatarUrl = function (id) {
        return this.pipRest.serverUrl + this._config.AvatarRoute + '/' + id;
    };
    AvatarData.prototype.postAvatarUrl = function () {
        return this.pipRest.serverUrl + this._config.AvatarRoute;
    };
    AvatarData.prototype.deleteAvatar = function (id, successCallback, errorCallback) {
        var params = {};
        params[this._config.AvatarFieldId] = id;
        this.pipRest.getResource(this._config.AvatarResource).remove(params, null, successCallback, errorCallback);
    };
    AvatarData.prototype.createAvatar = function (data, successCallback, errorCallback, progressCallback) {
    };
    return AvatarData;
}());
var AvatarDataProvider = (function () {
    AvatarDataProvider.$inject = ['pipRestProvider'];
    function AvatarDataProvider(pipRestProvider) {
        this.pipRestProvider = pipRestProvider;
        this._config = new IAvatarDataService_1.AvatarConfig();
        this._config.AvatarRoute = '/api/1.0/avatars';
        this._config.AvatarResource = 'avatars';
        this._config.AvatarFieldId = 'avatar_id';
        this._config.ShowOnlyNameIcon = false;
        this._config.DefaultInitial = '&';
    }
    Object.defineProperty(AvatarDataProvider.prototype, "AvatarRoute", {
        get: function () {
            return this._config.AvatarRoute;
        },
        set: function (value) {
            this._config.AvatarRoute = value;
            this.pipRestProvider.registerOperation('avatars', this._config.AvatarRoute + '/:avatar_id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AvatarDataProvider.prototype, "AvatarResource", {
        get: function () {
            return this._config.AvatarResource;
        },
        set: function (value) {
            this._config.AvatarResource = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AvatarDataProvider.prototype, "AvatarFieldId", {
        get: function () {
            return this._config.AvatarFieldId;
        },
        set: function (value) {
            this._config.AvatarFieldId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AvatarDataProvider.prototype, "ShowOnlyNameIcon", {
        get: function () {
            return this._config.ShowOnlyNameIcon;
        },
        set: function (value) {
            this._config.ShowOnlyNameIcon = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AvatarDataProvider.prototype, "DefaultInitial", {
        get: function () {
            return this._config.DefaultInitial;
        },
        set: function (value) {
            this._config.DefaultInitial = value;
        },
        enumerable: true,
        configurable: true
    });
    AvatarDataProvider.prototype.$get = ['pipRest', function (pipRest) {
        "ngInject";
        if (this._service == null) {
            this._service = new AvatarData(this._config, pipRest);
        }
        return this._service;
    }];
    return AvatarDataProvider;
}());
angular
    .module('pipAvatarData', ['pipRest'])
    .provider('pipAvatarData', AvatarDataProvider);
},{"./IAvatarDataService":18}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BlobInfo = (function () {
    function BlobInfo(id, group, name, size, content_type, create_time, expire_time, completed) {
        this.id = id;
        this.group = group;
        this.name = name;
        this.size = size;
        this.content_type = content_type;
        this.create_time = create_time;
        this.expire_time = expire_time;
        this.completed = completed;
    }
    return BlobInfo;
}());
exports.BlobInfo = BlobInfo;
},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataPage = (function () {
    function DataPage(data, total) {
        if (data === void 0) { data = null; }
        if (total === void 0) { total = null; }
        this.total = total;
        this.data = data;
    }
    return DataPage;
}());
exports.DataPage = DataPage;
},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AvatarConfig = (function () {
    function AvatarConfig() {
    }
    return AvatarConfig;
}());
exports.AvatarConfig = AvatarConfig;
exports.colorClasses = [
    'pip-avatar-color-0', 'pip-avatar-color-1', 'pip-avatar-color-2', 'pip-avatar-color-3',
    'pip-avatar-color-4', 'pip-avatar-color-5', 'pip-avatar-color-6', 'pip-avatar-color-7',
    'pip-avatar-color-8', 'pip-avatar-color-9', 'pip-avatar-color-10', 'pip-avatar-color-11',
    'pip-avatar-color-12', 'pip-avatar-color-13', 'pip-avatar-color-14', 'pip-avatar-color-15'
];
exports.colors = [
    'rgba(239,83,80,1)', 'rgba(236,64,122,1)', 'rgba(171,71,188,1)',
    'rgba(126,87,194,1)', 'rgba(92,107,192,1)', 'rgba(3,169,244,1)',
    'rgba(0,188,212,1)', 'rgba(0,150,136,1)', 'rgba(76,175,80,1)',
    'rgba(139,195,74,1)', 'rgba(205,220,57,1)', 'rgba(255,193,7,1)',
    'rgba(255,152,0,1)', 'rgba(255,87,34,1)', 'rgba(121,85,72,1)',
    'rgba(96,125,139,1)'
];
},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PictureConfig = (function () {
    function PictureConfig() {
    }
    return PictureConfig;
}());
exports.PictureConfig = PictureConfig;
},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Image = (function () {
    function Image() {
    }
    return Image;
}());
exports.Image = Image;
},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ImageSet = (function () {
    function ImageSet(id, title, picIds, create_time) {
        this.id = id;
        this.title = title;
        this.pics = [];
        this.create_time = create_time;
    }
    return ImageSet;
}());
exports.ImageSet = ImageSet;
},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ImageSetData = (function () {
    ImageSetData.$inject = ['pipRest', 'pipFormat'];
    function ImageSetData(pipRest, pipFormat) {
        "ngInject";
        this.pipRest = pipRest;
        this.pipFormat = pipFormat;
        this.RESOURCE = 'imagesets';
    }
    ImageSetData.prototype.readImageSets = function (params, successCallback, errorCallback) {
        params = params || {};
        return this.pipRest.getResource(this.RESOURCE).page(params, successCallback, errorCallback);
    };
    ImageSetData.prototype.readImageSet = function (id, successCallback, errorCallback) {
        return this.pipRest.getResource(this.RESOURCE).get({ imagesets_id: id }, successCallback, errorCallback);
    };
    ImageSetData.prototype.updateImageSet = function (id, data, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).update({ imagesets_id: id }, data, successCallback, errorCallback);
    };
    ImageSetData.prototype.createImageSet = function (data, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).save(null, data, successCallback, errorCallback);
    };
    ImageSetData.prototype.deleteImageSet = function (id, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).remove({ imagesets_id: id }, null, successCallback, errorCallback);
    };
    return ImageSetData;
}());
angular
    .module('pipImageSetData', ['pipRest'])
    .service('pipImageSetData', ImageSetData);
},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IPictureDataService_1 = require("./IPictureDataService");
var PictureData = (function () {
    PictureData.$inject = ['_config', 'pipFormat', 'pipRest'];
    function PictureData(_config, pipFormat, pipRest) {
        "ngInject";
        this._config = _config;
        this.pipFormat = pipFormat;
        this.pipRest = pipRest;
        this.RESOURCE = 'picture';
        this.RESOURCE_INFO = 'pictureInfo';
    }
    Object.defineProperty(PictureData.prototype, "PictureRoute", {
        get: function () {
            return this._config.PictureRoute;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PictureData.prototype, "ShowErrorIcon", {
        get: function () {
            return this._config.ShowErrorIcon;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PictureData.prototype, "DefaultErrorIcon", {
        get: function () {
            return this._config.DefaultErrorIcon;
        },
        enumerable: true,
        configurable: true
    });
    PictureData.prototype.getPictureUrl = function (id) {
        return this.pipRest.serverUrl + this._config.PictureRoute + '/' + id;
    };
    PictureData.prototype.postPictureUrl = function () {
        return this.pipRest.serverUrl + this._config.PictureRoute;
    };
    PictureData.prototype.readPictures = function (params, successCallback, errorCallback) {
        params = params || {};
        if (params.filter) {
            params.filer = this.pipFormat.filterToString(params.filer);
        }
        return this.pipRest.getResource(this.RESOURCE).page(params, successCallback, errorCallback);
    };
    PictureData.prototype.readPictureInfo = function (params, successCallback, errorCallback) {
        params = params || {};
        if (params.filter) {
            params.filer = this.pipFormat.filterToString(params.filer);
        }
        return this.pipRest.getResource(this.RESOURCE_INFO).get(params, successCallback, errorCallback);
    };
    PictureData.prototype.readPicture = function (id, successCallback, errorCallback) {
        return this.pipRest.getResource(this.RESOURCE).get({
            picture_id: id
        }, successCallback, errorCallback);
    };
    PictureData.prototype.deletePicture = function (id, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).remove({ picture_id: id }, null, successCallback, errorCallback);
    };
    return PictureData;
}());
var PictureDataProvider = (function () {
    PictureDataProvider.$inject = ['pipRestProvider'];
    function PictureDataProvider(pipRestProvider) {
        this.pipRestProvider = pipRestProvider;
        this._config = new IPictureDataService_1.PictureConfig();
        this._config.PictureRoute = '/api/1.0/blobs';
        this._config.ShowErrorIcon = true;
        this._config.DefaultErrorIcon = 'picture-no-border';
    }
    Object.defineProperty(PictureDataProvider.prototype, "PictureRoute", {
        get: function () {
            return this._config.PictureRoute;
        },
        set: function (value) {
            this._config.PictureRoute = value;
            this.pipRestProvider.registerOperation('pictures', this._config.PictureRoute + '/:picture_id');
        },
        enumerable: true,
        configurable: true
    });
    PictureDataProvider.prototype.getPictureUrl = function (id) {
        return this.pipRestProvider.serverUrl + this._config.PictureRoute + '/' + id;
    };
    Object.defineProperty(PictureDataProvider.prototype, "DefaultErrorIcon", {
        get: function () {
            return this._config.DefaultErrorIcon;
        },
        set: function (value) {
            this._config.DefaultErrorIcon = value;
            this.pipRestProvider.registerOperation('pictures', this._config.PictureRoute + '/:picture_id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PictureDataProvider.prototype, "ShowErrorIcon", {
        get: function () {
            return this._config.ShowErrorIcon;
        },
        set: function (value) {
            this._config.ShowErrorIcon = value;
        },
        enumerable: true,
        configurable: true
    });
    PictureDataProvider.prototype.$get = ['pipRest', 'pipFormat', function (pipRest, pipFormat) {
        "ngInject";
        if (this._service == null) {
            this._service = new PictureData(this._config, pipFormat, pipRest);
        }
        return this._service;
    }];
    return PictureDataProvider;
}());
angular
    .module('pipPictureData', ['pipRest'])
    .provider('pipPictureData', PictureDataProvider);
},{"./IPictureDataService":20}],25:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./Attachment");
require("./BlobInfo");
require("./DataPage");
require("./ImageSet");
require("./Image");
require("./AvatarDataService");
require("./IAvatarDataService");
require("./ImageSetDataService");
require("./IImageSetDataService");
require("./PictureDataService");
require("./IPictureDataService");
angular
    .module('pipPictures.Data', [
    'pipAvatarData',
    'pipPictureData',
    'pipImageSetData'
]);
__export(require("./Attachment"));
__export(require("./BlobInfo"));
__export(require("./DataPage"));
__export(require("./ImageSet"));
__export(require("./Image"));
__export(require("./IAvatarDataService"));
__export(require("./IPictureDataService"));
},{"./Attachment":14,"./AvatarDataService":15,"./BlobInfo":16,"./DataPage":17,"./IAvatarDataService":18,"./IImageSetDataService":19,"./IPictureDataService":20,"./Image":21,"./ImageSet":22,"./ImageSetDataService":23,"./PictureDataService":24}],26:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var IGallerySearchDialogService_1 = require("./IGallerySearchDialogService");
var ConfigGallerySearchDialogTranslations = function (pipTranslateProvider) {
    pipTranslateProvider.translations('en', {
        'IMAGE_GALLERY': 'Add from image gallery',
        'SEARCH_PICTURES': 'Search for pictures...',
        'IMAGE_START_SEARCH': 'Images will appear here once you start searching'
    });
    pipTranslateProvider.translations('ru', {
        'IMAGE_GALLERY': 'Добавить из галереи изображений',
        'SEARCH_PICTURES': 'Поиск изображений...',
        'IMAGE_START_SEARCH': 'Картинки появятся после начала поиска'
    });
};
ConfigGallerySearchDialogTranslations.$inject = ['pipTranslateProvider'];
var GallerySearchDialogImage = (function () {
    function GallerySearchDialogImage() {
    }
    return GallerySearchDialogImage;
}());
var GallerySearchDialogController = (function (_super) {
    __extends(GallerySearchDialogController, _super);
    GallerySearchDialogController.$inject = ['$log', '$mdDialog', '$rootScope', '$timeout', '$mdMenu', 'multiple', '$http', 'pipRest', 'pipTransaction', 'pipImageSetData', 'pipPictureData'];
    function GallerySearchDialogController($log, $mdDialog, $rootScope, $timeout, $mdMenu, multiple, $http, pipRest, pipTransaction, pipImageSetData, pipPictureData) {
        "ngInject";
        var _this = _super.call(this) || this;
        _this.$log = $log;
        _this.$mdDialog = $mdDialog;
        _this.$rootScope = $rootScope;
        _this.$timeout = $timeout;
        _this.$mdMenu = $mdMenu;
        _this.multiple = multiple;
        _this.$http = $http;
        _this.pipRest = pipRest;
        _this.pipTransaction = pipTransaction;
        _this.pipImageSetData = pipImageSetData;
        _this.pipPictureData = pipPictureData;
        _this.prevSearch = '';
        _this.images = [];
        _this.theme = _this.$rootScope[pip.themes.ThemeRootVar];
        _this.search = '';
        _this.imagesSearchResult = [];
        _this.transaction = _this.pipTransaction.create('search');
        _this.focusSearchText();
        return _this;
    }
    GallerySearchDialogController.prototype.onSearchClick = function () {
        var _this = this;
        if (this.transaction.busy())
            return;
        if (this.search == '' || this.search == this.prevSearch)
            return;
        this.prevSearch = this.search;
        this.imagesSearchResult = [];
        var transactionId = this.transaction.begin('ENTERING');
        if (!transactionId)
            return;
        this.pipImageSetData.readImageSets({
            Search: this.search
        }, function (result) {
            if (_this.transaction.aborted(transactionId))
                return;
            _.each(result.data, function (item) {
                _.each(item.pics, function (img) {
                    var newImage = {
                        checked: false,
                        url: img.uri ? img.uri : _this.pipPictureData.getPictureUrl(img.id),
                        item: img,
                        thumbnail: img.uri ? img.uri : _this.pipPictureData.getPictureUrl(img.id)
                    };
                    _this.imagesSearchResult.push(newImage);
                });
            });
            _this.transaction.end();
        }, function (error) {
            _this.transaction.end(error);
            _this.$log.error(error);
        });
    };
    GallerySearchDialogController.prototype.onStopSearchClick = function () {
        this.transaction.abort();
        this.prevSearch = '';
    };
    GallerySearchDialogController.prototype.onKeyPress = function ($event) {
        if ($event.keyCode === 13) {
            this.onSearchClick();
        }
    };
    GallerySearchDialogController.prototype.onImageClick = function (image) {
        if (this.transaction.busy()) {
            return;
        }
        image.checked = !image.checked;
        if (this.multiple) {
            if (image.checked) {
                this.images.push(image);
            }
            else {
                _.remove(this.images, { url: image.url });
            }
        }
        else {
            if (image.checked) {
                if (this.images.length > 0) {
                    this.images[0].checked = false;
                    this.images[0] = image;
                }
                else {
                    this.images.push(image);
                }
            }
            else {
                this.images = [];
            }
        }
    };
    GallerySearchDialogController.prototype.onAddClick = function () {
        if (this.transaction.busy()) {
            return;
        }
        var result = [];
        this.images.forEach(function (image) {
            if (image.checked) {
                result.push(image.item);
            }
        });
        this.$mdDialog.hide(result);
    };
    GallerySearchDialogController.prototype.onCancelClick = function () {
        this.$mdDialog.cancel();
    };
    GallerySearchDialogController.prototype.addButtonDisabled = function () {
        return this.images.length == 0 || this.transaction.busy();
    };
    GallerySearchDialogController.prototype.focusSearchText = function () {
        setTimeout(function () {
            var element = $('.pip-gallery-search-dialog .search-images');
            if (element.length > 0) {
                element.focus();
            }
        }, 0);
    };
    return GallerySearchDialogController;
}(IGallerySearchDialogService_1.GallerySearchDialogParams));
angular
    .module('pipGallerySearchDialog')
    .config(ConfigGallerySearchDialogTranslations)
    .controller('pipGallerySearchController', GallerySearchDialogController);
},{"./IGallerySearchDialogService":28}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GallerySearchDialogService = (function () {
    GallerySearchDialogService.$inject = ['$mdDialog'];
    function GallerySearchDialogService($mdDialog) {
        this._mdDialog = $mdDialog;
    }
    GallerySearchDialogService.prototype.show = function (params, successCallback, cancelCallback) {
        this._mdDialog.show({
            templateUrl: 'gallery_search_dialog/GallerySearchDialog.html',
            clickOutsideToClose: true,
            controller: 'pipGallerySearchController',
            controllerAs: '$ctrl',
            locals: params
        })
            .then(function (result) {
            if (successCallback) {
                successCallback(result);
            }
        });
    };
    return GallerySearchDialogService;
}());
angular
    .module('pipGallerySearchDialog')
    .service('pipGallerySearchDialog', GallerySearchDialogService);
},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GallerySearchDialogParams = (function () {
    function GallerySearchDialogParams() {
    }
    return GallerySearchDialogParams;
}());
exports.GallerySearchDialogParams = GallerySearchDialogParams;
},{}],29:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipGallerySearchDialog', ['ngMaterial', 'pipPictures.Templates', 'pipCommonRest']);
require("./IGallerySearchDialogService");
require("./GallerySearchDialogService");
require("./GallerySearchDialogController");
__export(require("./IGallerySearchDialogService"));
},{"./GallerySearchDialogController":26,"./GallerySearchDialogService":27,"./IGallerySearchDialogService":28}],30:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./data");
require("./rest");
require("./camera_dialog");
require("./add_image/AddImage");
require("./add_image/AddImageOption");
require("./add_image/AddImageResult");
require("./avatar/Avatar");
require("./avatar_edit/AvatarEdit");
require("./collage/Collage");
require("./gallery_search_dialog");
require("./picture/Picture");
require("./picture_edit/PictureEdit");
require("./picture_list_edit/PictureListEdit");
require("./picture_url_dialog");
require("./utilities");
angular
    .module('pipPictures', [
    'pipControls',
    'pipPictures.Data',
    'pipPictures.Rest',
    'pipCameraDialog',
    'pipGallerySearchDialog',
    'pipPictureUrlDialog',
    'pipAddImage',
    'pipAvatar',
    'pipPictureUtils',
    'pipPicturePaste',
    'pipAvatarEdit',
    'pipPicture',
    'pipPictureEdit',
    'pipCollage',
    'pipPictureListEdit',
]);
__export(require("./data"));
__export(require("./avatar_edit/AvatarEdit"));
__export(require("./add_image/AddImageOption"));
__export(require("./add_image/AddImageResult"));
__export(require("./gallery_search_dialog"));
__export(require("./picture_edit/PictureEdit"));
__export(require("./picture_list_edit/PictureListEdit"));
__export(require("./utilities"));
},{"./add_image/AddImage":4,"./add_image/AddImageOption":5,"./add_image/AddImageResult":6,"./avatar/Avatar":7,"./avatar_edit/AvatarEdit":8,"./camera_dialog":12,"./collage/Collage":13,"./data":25,"./gallery_search_dialog":29,"./picture/Picture":31,"./picture_edit/PictureEdit":32,"./picture_list_edit/PictureListEdit":33,"./picture_url_dialog":37,"./rest":41,"./utilities":45}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var PictureBindings = {
        src: '<?pipSrc',
        pictureId: '<?pipPictureId',
        pipPicture: '<?',
        defaultIcon: '<?pipDefaultIcon',
        pipRebind: '<?'
    };
    var PictureBindingsChanges = (function () {
        function PictureBindingsChanges() {
        }
        return PictureBindingsChanges;
    }());
    var PictureController = (function () {
        PictureController.$inject = ['$scope', '$rootScope', '$element', 'pipPictureUtils', 'pipPictureData'];
        function PictureController($scope, $rootScope, $element, pipPictureUtils, pipPictureData) {
            "ngInject";
            this.$scope = $scope;
            this.$rootScope = $rootScope;
            this.$element = $element;
            this.pipPictureUtils = pipPictureUtils;
            this.pipPictureData = pipPictureData;
            this.postLink = false;
            this.errorText = 'PICTURE_ERROR_LOAD';
            this.$element.addClass('pip-picture');
        }
        PictureController.prototype.$postLink = function () {
            this.imageElement = this.$element.children('img');
            this.defaultBlock = this.$element.children('div');
            this.defaultIcon = this.defaultIcon ? this.defaultIcon : this.pipPictureData.DefaultErrorIcon;
            this.postLink = true;
            this.bindControl();
        };
        PictureController.prototype.$onChanges = function (changes) {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }
            var isDataChange = false;
            if (this.pipRebind) {
                if (changes.src && changes.src.currentValue !== changes.src.previousValue) {
                    this.src = changes.src.currentValue;
                    isDataChange = true;
                }
                if (changes.pictureId && changes.pictureId.currentValue !== changes.pictureId.previousValue) {
                    this.pictureId = changes.pictureId.currentValue;
                    isDataChange = true;
                }
                if (changes.pipPicture && !_.isEqual(changes.pipPicture.currentValue, changes.pipPicture.previousValue)) {
                    this.pipPicture = changes.pipPicture.currentValue;
                    isDataChange = true;
                }
                if (changes.defaultIcon && changes.defaultIcon.currentValue !== changes.defaultIcon.previousValue) {
                    this.defaultIcon = changes.defaultIcon.currentValue;
                    this.defaultIcon = this.defaultIcon ? this.defaultIcon : this.pipPictureData.DefaultErrorIcon;
                }
            }
            if (isDataChange && this.postLink) {
                this.bindControl();
            }
        };
        PictureController.prototype.onImageError = function ($event) {
            var _this = this;
            if (this.pipPictureData.ShowErrorIcon) {
                this.$scope.$apply(function () {
                    _this.imageElement.css('display', 'none');
                    _this.defaultBlock.css('display', 'block');
                });
            }
            else {
                this.$scope.$apply(function () {
                    _this.defaultBlock.css('display', 'none');
                });
            }
        };
        PictureController.prototype.onImageLoad = function ($event) {
            var image = $($event.target);
            this.pipPictureUtils.setImageMarginCSS(this.$element, image);
            this.$element.children('div').css('display', 'none');
        };
        PictureController.prototype.bindControl = function () {
            var url;
            if (this.pictureId) {
                url = this.pipPictureData.getPictureUrl(this.pictureId);
                this.imageElement.attr('src', url);
            }
            else if (this.src) {
                this.imageElement.attr('src', this.src);
            }
            else if (this.pipPicture) {
                url = this.pipPicture.uri ? this.pipPicture.uri : this.pipPictureData.getPictureUrl(this.pipPicture.id);
                this.imageElement.attr('src', url);
            }
        };
        return PictureController;
    }());
    var PictureComponent = {
        bindings: PictureBindings,
        template: '<img ui-event="{ error: \'$ctrl.onImageError($event)\', load: \'$ctrl.onImageLoad($event)\' }"/>'
            + '<div class="pip-picture-error"><md-icon md-svg-icon="icons:{{$ctrl.defaultIcon}}"></md-icon><div class="pip-default-text"><span>{{ $ctrl.errorText | translate }}</span></div></div>',
        controller: PictureController
    };
    angular
        .module('pipPicture', [])
        .component('pipPicture', PictureComponent);
}
},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PicturePaste_1 = require("../utilities/PicturePaste");
var PictureEditControl = (function () {
    function PictureEditControl() {
        this.disabled = false;
        this.url = '';
        this.progress = 0;
        this.uploaded = false;
        this.uploading = false;
        this.upload = false;
        this.loaded = false;
        this.file = null;
        this.state = PictureStates.Original;
    }
    return PictureEditControl;
}());
exports.PictureEditControl = PictureEditControl;
var PictureStates = (function () {
    function PictureStates() {
    }
    return PictureStates;
}());
PictureStates.Original = 'original';
PictureStates.Copied = 'copied';
PictureStates.Changed = 'changed';
PictureStates.Deleted = 'deleted';
PictureStates.Error = 'error';
exports.PictureStates = PictureStates;
{
    var ConfigPictureEditTranslations = function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            ERROR_WRONG_IMAGE_FILE: 'Incorrect image file. Please, choose another one',
            PICTURE_EDIT_TEXT: 'Click here to upload a picture',
            PICTURE_ERROR_LOAD: 'Error image loading'
        });
        pipTranslateProvider.translations('ru', {
            ERROR_WRONG_IMAGE_FILE: 'Неправильный файл с изображением. Выберете другой файл',
            PICTURE_EDIT_TEXT: 'Нажмите сюда для загрузки картинки',
            PICTURE_ERROR_LOAD: 'Ошибка загрузки картинки'
        });
    };
    ConfigPictureEditTranslations.$inject = ['pipTranslateProvider'];
    var SenderEvent = (function () {
        function SenderEvent() {
        }
        return SenderEvent;
    }());
    var PictureEvent = (function () {
        function PictureEvent() {
        }
        return PictureEvent;
    }());
    var PictureEditBindings = {
        ngDisabled: '<?',
        pipCreated: '&?',
        pipChanged: '&?',
        pipPictureId: '=?',
        pipPicture: '=?',
        pipAddedPicture: '&?',
        text: '<?pipDefaultText',
        icon: '<?pipDefaultIcon',
        pipRebind: '<?',
    };
    var PictureEditBindingsChanges = (function () {
        function PictureEditBindingsChanges() {
        }
        return PictureEditBindingsChanges;
    }());
    var PictureEditController = (function () {
        PictureEditController.$inject = ['$log', '$scope', '$rootScope', '$element', 'pipPictureData', 'pipPictureUtils', '$timeout', 'pipFileUpload'];
        function PictureEditController($log, $scope, $rootScope, $element, pipPictureData, pipPictureUtils, $timeout, pipFileUpload) {
            "ngInject";
            var _this = this;
            this.$log = $log;
            this.$scope = $scope;
            this.$rootScope = $rootScope;
            this.$element = $element;
            this.pipPictureData = pipPictureData;
            this.pipPictureUtils = pipPictureUtils;
            this.$timeout = $timeout;
            this.pipFileUpload = pipFileUpload;
            this.pipPicturePaste = new PicturePaste_1.PicturePaste($timeout);
            this.pictureStartState = this.pipAddedPicture ? PictureStates.Copied : PictureStates.Original;
            this.text = this.text || 'PICTURE_EDIT_TEXT';
            this.icon = this.icon || 'picture-no-border';
            this.errorText = 'PICTURE_ERROR_LOAD';
            this.multiUpload = false;
            this.control = new PictureEditControl();
            this.control.state = this.pictureStartState;
            this.control.reset = function (afterDeleting) {
                _this.resetImage(afterDeleting);
            };
            this.control.save = function (successCallback, errorCallback) {
                _this.saveImage(successCallback, errorCallback);
            };
            this.control.abort = function () {
                _this.abort();
            };
            $element.addClass('pip-picture-edit');
        }
        PictureEditController.prototype.$postLink = function () {
            this.controlElement = this.$element.children('.pip-picture-upload');
            this.inputElement = this.controlElement.children('input[type=file]');
            this.control.reset();
            if (this.pipCreated) {
                this.pipCreated({
                    $event: { sender: this.control },
                    $control: this.control
                });
            }
        };
        PictureEditController.prototype.abort = function () {
            if (this.control.uploading) {
                this.control.uploaded = false;
                this.control.uploading = false;
                this.control.progress = 0;
                this.control.upload = null;
            }
        };
        PictureEditController.prototype.$onChanges = function (changes) {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }
            var change = false;
            if (changes.ngDisabled && changes.ngDisabled.currentValue !== changes.ngDisabled.previousValue) {
                this.ngDisabled = changes.ngDisabled.currentValue;
                this.control.disabled = this.ngDisabled;
                if (this.inputElement) {
                    this.inputElement.attr('disabled', this.control.disabled);
                }
            }
            if (this.pipRebind) {
                if (changes.pipPictureId && changes.pipPictureId.currentValue !== this.pipPictureId) {
                    this.pipPictureId = changes.pipPictureId.currentValue;
                    change = true;
                }
            }
            if (this.pipRebind) {
                if (changes.pipPicture && !_.isEqual(changes.pipPicture.currentValue, this.pipPicture)) {
                    this.pipPicture = changes.pipPicture.currentValue;
                    change = true;
                }
            }
            if (change) {
                this.control.reset();
            }
        };
        PictureEditController.prototype.resetImage = function (afterDeleting) {
            this.control.progress = 0;
            this.control.uploading = false;
            this.control.uploaded = false;
            this.control.file = null;
            this.control.state = this.pictureStartState;
            this.control.url = '';
            this.control.uri = null;
            this.control.name = null;
            this.control.uriData = null;
            this.control.id = null;
            var url = '';
            if (!afterDeleting) {
                if (this.pipPictureId) {
                    url = this.pipPictureData.getPictureUrl(this.pipPictureId);
                }
                else if (this.pipPicture) {
                    url = this.pipPicture.uri ? this.pipPicture.uri : this.pipPicture.id ? this.pipPictureData.getPictureUrl(this.pipPicture.id) : null;
                    this.control.uri = this.pipPicture.uri;
                    this.control.name = this.pipPicture.name;
                    this.control.id = this.pipPicture.id;
                }
                if (!url)
                    return;
                this.control.url = url;
                this.control.uploaded = true;
                this.onChange();
            }
            else {
                this.onChange();
            }
        };
        PictureEditController.prototype.onFocus = function () {
            var _this = this;
            this.pipPicturePaste.addPasteListener(function (item) {
                _this.readItemLocally(item.url, item.uriData, item.file, item.picture);
            });
        };
        PictureEditController.prototype.onBlur = function () {
            this.pipPicturePaste.removePasteListener();
        };
        ;
        PictureEditController.prototype.savePicture = function (successCallback, errorCallback) {
            var _this = this;
            if (this.control.id) {
                this.control.uploading = false;
                this.pipPicture = {
                    id: this.control.id,
                    uri: this.control.uri,
                    name: this.control.name
                };
                this.pictureStartState = PictureStates.Original;
                this.control.reset();
                if (successCallback) {
                    successCallback(this.pipPicture);
                }
            }
            else if (this.control.file !== null) {
                this.control.uploading = true;
                this.pipFileUpload.upload(this.control.file, this.pipPictureData.postPictureUrl(), function (data, error) {
                    if (!error) {
                        _this.pipPictureId = data.id;
                        _this.pipPicture = {
                            id: data.id,
                            uri: null,
                            name: data.name
                        };
                        _this.pictureStartState = PictureStates.Original;
                        _this.control.reset();
                        if (successCallback) {
                            successCallback(_this.pipPicture);
                        }
                    }
                    else {
                        _this.control.uploading = false;
                        _this.control.upload = false;
                        _this.control.progress = 0;
                        _this.pictureStartState = PictureStates.Error;
                        if (errorCallback) {
                            errorCallback(error);
                        }
                        else {
                            _this.$log.error(error);
                        }
                    }
                }, function (state, progress) {
                    _this.control.progress = progress;
                });
            }
            else if (this.control.uri && this.pipPicture) {
                this.control.uploading = false;
                if (this.control.uri) {
                    this.pipPicture = {
                        id: this.control.id,
                        uri: this.control.uri,
                        name: this.control.name
                    };
                    this.pictureStartState = PictureStates.Original;
                    this.control.reset();
                    if (successCallback) {
                        successCallback(this.pipPicture);
                    }
                }
            }
        };
        PictureEditController.prototype.deletePicture = function (successCallback, errorCallback) {
            var _this = this;
            if (this.pipPictureId) {
                this.pipPictureData.deletePicture(this.pipPictureId, function () {
                    _this.pipPictureId = null;
                    _this.control.reset(true);
                    if (successCallback)
                        successCallback();
                }, function (error) {
                    _this.control.uploading = false;
                    _this.control.upload = false;
                    _this.control.progress = 0;
                    _this.control.state = PictureStates.Error;
                    if (errorCallback) {
                        errorCallback(error);
                    }
                    else {
                        _this.$log.error(error);
                    }
                });
            }
            else {
                this.control.uploading = false;
                this.pipPicture = {
                    id: null,
                    uri: null,
                    name: null
                };
                this.control.reset(true);
                if (successCallback)
                    successCallback(this.pipPicture);
            }
        };
        PictureEditController.prototype.saveImage = function (successCallback, errorCallback) {
            if (this.control.state == PictureStates.Changed) {
                this.savePicture(successCallback, errorCallback);
            }
            else if (this.control.state == PictureStates.Deleted) {
                this.deletePicture(successCallback, errorCallback);
            }
            else if (this.control.state == PictureStates.Copied) {
                this.pipPicture = {
                    id: this.control.id,
                    name: this.control.name,
                    uri: this.control.uri
                };
                this.pictureStartState = PictureStates.Original;
                this.control.reset();
                successCallback(this.pipPicture);
            }
            else {
                if (successCallback) {
                    if (this.pipPicture) {
                        successCallback(this.pipPicture);
                    }
                    else {
                        successCallback(this.pipPictureId);
                    }
                }
            }
        };
        PictureEditController.prototype.empty = function () {
            return (this.control.url == '' && !this.control.uploading);
        };
        PictureEditController.prototype.isUpdated = function () {
            return this.control.state != PictureStates.Original;
        };
        PictureEditController.prototype.readItemLocally = function (url, uriData, file, picture) {
            if (picture) {
                this.control.file = null;
                this.control.name = picture.name;
                this.control.uri = picture.uri;
                this.control.id = picture.id;
                this.control.uriData = null;
                this.control.url = picture.uri ? picture.uri : picture.id ? this.pipPictureData.getPictureUrl(picture.id) : '';
                this.control.state == PictureStates.Copied;
            }
            else {
                this.control.file = file;
                this.control.name = file ? file.name : url ? url.split('/').pop() : null;
                this.control.url = !file && url ? url : uriData ? uriData : '';
                this.control.uri = !file && url ? url : null;
                this.control.uriData = uriData;
                this.control.id = null;
                this.control.state = PictureStates.Changed;
            }
            this.onChange();
        };
        PictureEditController.prototype.onDeleteClick = function ($event) {
            $event.stopPropagation();
            this.controlElement.focus();
            this.control.file = null;
            this.control.url = '';
            this.control.uri = null;
            this.control.uriData = null;
            this.control.name = null;
            this.control.id = null;
            if (this.control.state != PictureStates.Copied)
                this.control.state = PictureStates.Deleted;
            this.onChange();
        };
        PictureEditController.prototype.onKeyDown = function ($event) {
            var _this = this;
            if ($event.keyCode == 13 || $event.keyCode == 32) {
                setTimeout(function () {
                    _this.controlElement.trigger('click');
                }, 0);
            }
            else if ($event.keyCode == 46 || $event.keyCode == 8) {
                this.control.file = null;
                this.control.url = '';
                this.control.state = PictureStates.Deleted;
                this.onChange();
            }
            else if ($event.keyCode == 27) {
                this.control.reset();
            }
        };
        PictureEditController.prototype.onImageError = function ($event) {
            var _this = this;
            this.$scope.$apply(function () {
                _this.control.url = '';
                var image = $($event.target);
                _this.control.state = PictureStates.Error;
                _this.pipPictureUtils.setErrorImageCSS(image, { width: 'auto', height: '100%' });
            });
        };
        PictureEditController.prototype.onImageLoad = function ($event) {
            var image = $($event.target);
            var container = {};
            container.clientWidth = 80;
            container.clientHeight = 80;
            this.pipPictureUtils.setImageMarginCSS(container, image);
            this.control.uploading = false;
        };
        PictureEditController.prototype.onChange = function () {
            if (this.pipChanged) {
                this.pipChanged({
                    $event: { sender: this.control },
                    $control: this.control
                });
            }
        };
        return PictureEditController;
    }());
    var PictureEditComponent = {
        bindings: PictureEditBindings,
        templateUrl: 'picture_edit/PictureEdit.html',
        controller: PictureEditController
    };
    angular
        .module('pipPictureEdit', ['ui.event', 'pipPicturePaste',
        'pipTranslate', 'angularFileUpload', 'pipPictures.Templates'])
        .config(ConfigPictureEditTranslations)
        .component('pipPictureEdit', PictureEditComponent);
}
},{"../utilities/PicturePaste":43}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PicturePaste_1 = require("../utilities/PicturePaste");
var async = require('async');
var PictureListEditItem = (function () {
    function PictureListEditItem() {
    }
    return PictureListEditItem;
}());
exports.PictureListEditItem = PictureListEditItem;
var PictureListEditControl = (function () {
    function PictureListEditControl() {
        this.uploading = 0;
    }
    return PictureListEditControl;
}());
exports.PictureListEditControl = PictureListEditControl;
var PictureListEditStates = (function () {
    function PictureListEditStates() {
    }
    return PictureListEditStates;
}());
PictureListEditStates.Added = 'added';
PictureListEditStates.Original = 'original';
PictureListEditStates.Copied = 'copied';
PictureListEditStates.Changed = 'changed';
PictureListEditStates.Deleted = 'deleted';
PictureListEditStates.Error = 'error';
exports.PictureListEditStates = PictureListEditStates;
var PictureUploadErrors = (function () {
    function PictureUploadErrors() {
    }
    return PictureUploadErrors;
}());
exports.PictureUploadErrors = PictureUploadErrors;
{
    var ConfigPictureListEditTranslations = function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            'PICTURE_LIST_EDIT_TEXT': 'Click here to add a picture',
            'ERROR_TRANSACTION_IN_PROGRESS': 'Transaction is in progress. Please, wait until it is finished or abort',
            'ERROR_IMAGE_PRELOADING': 'Image loading error. The picture can not be saved'
        });
        pipTranslateProvider.translations('ru', {
            'PICTURE_LIST_EDIT_TEXT': 'Нажмите сюда чтобы добавить картинку',
            'ERROR_TRANSACTION_IN_PROGRESS': 'Транзакция еще не завершена. Подождите окончания или прервите её',
            'ERROR_IMAGE_PRELOADING': 'Ошибка при загрузки картинки. Картинка не сохранена.'
        });
    };
    ConfigPictureListEditTranslations.$inject = ['pipTranslateProvider'];
    var SenderEvent = (function () {
        function SenderEvent() {
        }
        return SenderEvent;
    }());
    var PictureEvent = (function () {
        function PictureEvent() {
        }
        return PictureEvent;
    }());
    var PictureListEditBindings = {
        ngDisabled: '<?',
        pipCreated: '&?',
        pipChanged: '&?',
        pictures: '=?pipPictures',
        pipAddedPicture: '&?',
        text: '<?pipDefaultText',
        icon: '<?pipDefaultIcon',
        pipRebind: '<?',
    };
    var PictureListEditBindingsChanges = (function () {
        function PictureListEditBindingsChanges() {
        }
        return PictureListEditBindingsChanges;
    }());
    var PictureListEditController = (function () {
        PictureListEditController.$inject = ['$log', '$scope', '$rootScope', '$element', 'pipPictureUtils', '$timeout', 'pipFileUpload', 'pipRest', 'pipPictureData'];
        function PictureListEditController($log, $scope, $rootScope, $element, pipPictureUtils, $timeout, pipFileUpload, pipRest, pipPictureData) {
            "ngInject";
            var _this = this;
            this.$log = $log;
            this.$scope = $scope;
            this.$rootScope = $rootScope;
            this.$element = $element;
            this.pipPictureUtils = pipPictureUtils;
            this.$timeout = $timeout;
            this.pipFileUpload = pipFileUpload;
            this.pipRest = pipRest;
            this.pipPictureData = pipPictureData;
            this.itemPin = 0;
            this.pipPicturePaste = new PicturePaste_1.PicturePaste($timeout);
            this.pictureStartState = this.toBoolean(this.pipAddedPicture) ? PictureListEditStates.Copied : PictureListEditStates.Original;
            this.text = this.text || 'PICTURE_LIST_EDIT_TEXT';
            this.icon = this.icon || 'picture-no-border';
            this.errorText = 'PICTURE_ERROR_LOAD';
            this.control = new PictureListEditControl();
            this.control.uploading = 0;
            this.control.items = [];
            this.control.reset = function () {
                _this.reset();
            };
            this.control.save = function (successCallback, errorCallback) {
                _this.save(successCallback, errorCallback);
            };
            this.control.abort = function () {
                _this.abort();
            };
            $element.addClass('pip-picture-list-edit');
        }
        PictureListEditController.prototype.toBoolean = function (value) {
            if (value == null) {
                return false;
            }
            if (!value) {
                return false;
            }
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        PictureListEditController.prototype.filterItem = function (item) {
            return item.state != PictureListEditStates.Deleted;
        };
        PictureListEditController.prototype.$postLink = function () {
            this.controlElement = this.$element.find('.pip-picture-drop');
            this.control.reset();
            if (this.pipCreated) {
                this.pipCreated({
                    $event: { sender: this.control },
                    $control: this.control
                });
            }
        };
        PictureListEditController.prototype.removeItem = function (item) {
            if (item.state === PictureListEditStates.Added || item.state === PictureListEditStates.Copied) {
                var index = _.findIndex(this.control.items, { pin: item.pin });
                if (index > -1) {
                    this.control.items.splice(index, 1);
                }
            }
            else {
                item.state = PictureListEditStates.Deleted;
            }
        };
        PictureListEditController.prototype.$onChanges = function (changes) {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }
            if (changes.ngDisabled && changes.ngDisabled.currentValue !== changes.ngDisabled.previousValue) {
                this.ngDisabled = changes.ngDisabled.currentValue;
            }
            if (this.pipRebind) {
                if (changes.pictures && !_.isEqual(changes.pictures.currentValue, this.pictures)) {
                    this.pictures = changes.pictures.currentValue;
                    this.control.reset();
                }
            }
            this.pictures = this.pictures ? this.pictures : [];
        };
        PictureListEditController.prototype.onImageError = function ($event, item) {
            item.state = PictureListEditStates.Error;
            item.url = '';
        };
        PictureListEditController.prototype.onFocus = function () {
            var _this = this;
            this.pipPicturePaste.addPasteListener(function (item) {
                _this.readItemLocally(item.url, item.uriData, item.file, item.picture);
            });
        };
        PictureListEditController.prototype.onBlur = function () {
            this.pipPicturePaste.removePasteListener();
        };
        PictureListEditController.prototype.getItems = function () {
            var items = [];
            var i;
            if (this.pictures == null || this.pictures.length == 0) {
                return items;
            }
            for (i = 0; i < this.pictures.length; i++) {
                var newItem = {
                    pin: this.itemPin++,
                    id: this.pictures[i].id,
                    name: this.pictures[i].name,
                    uri: this.pictures[i].uri,
                    uriData: null,
                    uploading: false,
                    uploaded: false,
                    progress: 0,
                    file: null,
                    url: this.pictures[i].id ? this.pipPictureData.getPictureUrl(this.pictures[i].id) : this.pictures[i].uri,
                    state: this.pictureStartState
                };
                items.push(newItem);
            }
            return items;
        };
        PictureListEditController.prototype.setItems = function () {
            var i;
            if (this.pictures && this.pictures.length > 0) {
                this.pictures.splice(0, this.pictures.length);
            }
            for (i = 0; i < this.control.items.length; i++) {
                var item = this.control.items[i];
                if ((item.id || item.uri) && item.state != PictureListEditStates.Deleted) {
                    var newPic = {
                        id: item.id,
                        name: item.name,
                        uri: item.uri
                    };
                    this.pictures.push(newPic);
                }
            }
        };
        PictureListEditController.prototype.reset = function () {
            if (!this.controlElement) {
                return;
            }
            this.control.uploading = 0;
            this.control.items = this.getItems();
        };
        PictureListEditController.prototype.addItem = function (oldItem, fileInfo, error) {
            var itemIndex = _.findIndex(this.control.items, { pin: oldItem.pin });
            if (itemIndex < 0)
                return;
            if (error) {
                this.control.items[itemIndex].uploaded = false;
                this.control.items[itemIndex].uploading = false;
                this.control.items[itemIndex].progress = 0;
                this.control.items[itemIndex].upload = null;
                this.control.items[itemIndex].state = PictureListEditStates.Error;
            }
            else {
                if (fileInfo) {
                    this.control.items[itemIndex].id = fileInfo.id;
                    this.control.items[itemIndex].name = fileInfo.name;
                    this.control.items[itemIndex].uploaded = true;
                    this.control.items[itemIndex].state = PictureListEditStates.Original;
                }
                else {
                    this.control.items[itemIndex].uploaded = false;
                }
                this.control.items[itemIndex].uploading = false;
                this.control.items[itemIndex].uriData = null;
                this.control.items[itemIndex].progress = 0;
                this.control.items[itemIndex].upload = null;
                this.control.items[itemIndex].file = null;
            }
        };
        PictureListEditController.prototype.deleteItem = function (item, callback) {
            if (item.upload) {
                item.upload.abort();
                item.upload = null;
            }
            if (item.state != PictureListEditStates.Deleted) {
                return;
            }
            this.removeItem(item);
            callback();
        };
        PictureListEditController.prototype.save = function (successCallback, errorCallback) {
            var _this = this;
            var item;
            var onItemCallback;
            var i;
            if (this.control.uploading) {
                if (errorCallback) {
                    errorCallback('ERROR_TRANSACTION_IN_PROGRESS');
                }
                return;
            }
            this.cancelQuery = null;
            this.control.error = null;
            this.control.uploading = 0;
            var addedBlobCollection = [];
            var addedUrlCollection = [];
            _.each(this.control.items, function (item) {
                if (item.state == 'added') {
                    if (item.file) {
                        addedBlobCollection.push(item);
                    }
                    else {
                        addedUrlCollection.push(item);
                    }
                }
            });
            var deletedCollection = _.filter(this.control.items, { state: 'deleted' });
            _.each(addedUrlCollection, function (item) {
                item.uploaded = true;
                item.uploading = false;
                item.progress = 0;
                item.upload = null;
                item.uriData = null;
                item.file = null;
                item.state = PictureListEditStates.Original;
            });
            if (!addedBlobCollection.length && !deletedCollection.length) {
                if (addedUrlCollection.length > 0) {
                    this.setItems();
                }
                this.control.uploading = 0;
                if (successCallback) {
                    successCallback(this.pictures);
                }
                return;
            }
            this.control.uploading = addedBlobCollection.length + deletedCollection.length;
            async.parallel([
                function (callbackAll) {
                    _.each(addedBlobCollection, function (item) {
                        item.uploading = true;
                        item.progress = 0;
                    });
                    _this.pipFileUpload.multiUpload(_this.pipPictureData.postPictureUrl(), addedBlobCollection, function (index, data, err) {
                        var item = addedBlobCollection[index];
                        _this.addItem(item, data, err);
                        if (err) {
                            _this.control.error = true;
                        }
                    }, function (index, state, progress) {
                        var item = addedBlobCollection[index];
                        item.progress = progress;
                    }, function (error, result, res) {
                        _this.cancelQuery = null;
                        callbackAll();
                    }, function (cancelQuery) {
                        _this.cancelQuery = cancelQuery;
                    }, false, 'pin');
                },
                function (callbackAll) {
                    if (deletedCollection.length) {
                        async.each(deletedCollection, function (item, callback) {
                            _this.deleteItem(item, function (error) { callback(); });
                        }, function (error, result) {
                            callbackAll();
                        });
                    }
                    else {
                        callbackAll();
                    }
                }
            ], function (error, results) {
                if (error && !_this.control.error) {
                    _this.control.error = error;
                }
                if (_this.control.error) {
                    _this.control.uploading = 0;
                    var errors = _this.getUploadErors();
                    if (errorCallback) {
                        errorCallback(errors);
                    }
                    else {
                        _this.$log.error(errors);
                    }
                }
                else {
                    _this.setItems();
                    _this.control.uploading = 0;
                    if (successCallback) {
                        successCallback(_this.pictures);
                    }
                }
            });
        };
        PictureListEditController.prototype.getUploadErors = function () {
            var errors = [];
            _.each(this.control.items, function (item) {
                if (item.state == PictureListEditStates.Error || item.state == PictureListEditStates.Error) {
                    errors.push({
                        id: item.id,
                        uri: item.uri,
                        name: item.name
                    });
                }
            });
            return errors;
        };
        PictureListEditController.prototype.abort = function () {
            var i;
            for (i = 0; i < this.control.items.length; i++) {
                var item = this.control.items[i];
                if (item.uploading) {
                    if (item.upload) {
                        item.upload.abort();
                    }
                    item.uploaded = false;
                    item.uploading = false;
                    item.progress = 0;
                    item.upload = null;
                }
            }
            if (this.cancelQuery) {
                this.cancelQuery.resolve();
            }
            this.control.uploading = 0;
            this.control.error = true;
        };
        PictureListEditController.prototype.readItemLocally = function (url, uriData, file, picture) {
            var item = new PictureListEditItem();
            item.pin = this.itemPin++;
            item.uploading = false;
            item.uploaded = false;
            item.progress = 0;
            if (picture) {
                item.file = null;
                item.name = picture.name;
                item.uri = picture.uri;
                item.id = picture.id;
                item.uriData = null;
                item.url = picture.uri ? picture.uri : picture.id ? this.pipPictureData.getPictureUrl(picture.id) : '';
                item.state == PictureListEditStates.Copied;
            }
            else {
                item.file = file;
                item.name = file ? file.name : url ? url.split('/').pop() : null;
                item.url = !file && url ? url : uriData ? uriData : '';
                item.uri = !file && url ? url : null;
                item.uriData = uriData;
                item.id = null;
                item.state = PictureListEditStates.Added;
            }
            this.control.items.push(item);
            this.onChange();
        };
        PictureListEditController.prototype.onSelectClick = function ($files) {
            var i;
            this.controlElement.focus();
            if ($files == null || $files.length == 0) {
                return;
            }
            for (i = 0; i < $files.length; i++) {
                var file = $files[i];
                if (file.type.indexOf('image') > -1) {
                    this.readItemLocally('', null, file, null);
                }
            }
        };
        PictureListEditController.prototype.onDeleteClick = function (item) {
            this.removeItem(item);
            this.onChange();
        };
        PictureListEditController.prototype.onKeyDown = function ($event, item) {
            var _this = this;
            if (item) {
                if ($event.keyCode == 46 || $event.keyCode == 8) {
                    if (item.state == PictureListEditStates.Added) {
                        this.removeItem(item);
                    }
                    else {
                        item.state = PictureListEditStates.Deleted;
                    }
                    this.onChange();
                }
            }
            else {
                if ($event.keyCode == 13 || $event.keyCode == 32) {
                    setTimeout(function () {
                        _this.controlElement.trigger('click');
                    }, 0);
                }
            }
        };
        PictureListEditController.prototype.onImageLoad = function ($event, item) {
            var _this = this;
            setTimeout(function () {
                var image = $($event.target);
                var container = {};
                container.clientWidth = 80;
                container.clientHeight = 80;
                _this.pipPictureUtils.setImageMarginCSS(container, image);
            }, 250);
            item.loaded = true;
        };
        PictureListEditController.prototype.onChange = function () {
            if (this.pipChanged) {
                this.pipChanged({
                    $event: { sender: this.control },
                    $control: this.control
                });
            }
        };
        return PictureListEditController;
    }());
    var PictureListEditComponent = {
        bindings: PictureListEditBindings,
        templateUrl: 'picture_list_edit/PictureListEdit.html',
        controller: PictureListEditController
    };
    angular
        .module('pipPictureListEdit', ['ui.event', 'pipPicturePaste',
        'pipFocused', 'angularFileUpload', 'pipPictures.Templates'])
        .config(ConfigPictureListEditTranslations)
        .component('pipPictureListEdit', PictureListEditComponent);
}
},{"../utilities/PicturePaste":43,"async":1}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],35:[function(require,module,exports){
var ConfigPictureUrlDialogTranslations = function (pipTranslateProvider) {
    pipTranslateProvider.translations('en', {
        'PICTURE_FROM_WEBLINK': 'Add from web link',
        'LINK_PICTURE': 'Link to the picture...'
    });
    pipTranslateProvider.translations('ru', {
        'PICTURE_FROM_WEBLINK': 'Добавить из веб ссылки',
        'LINK_PICTURE': 'Ссылка на изображение...'
    });
};
ConfigPictureUrlDialogTranslations.$inject = ['pipTranslateProvider'];
var PictureUrlDialogController = (function () {
    PictureUrlDialogController.$inject = ['$log', '$scope', '$mdDialog', '$rootScope', '$timeout', '$mdMenu', 'pipPictureUtils'];
    function PictureUrlDialogController($log, $scope, $mdDialog, $rootScope, $timeout, $mdMenu, pipPictureUtils) {
        "ngInject";
        this.$log = $log;
        this.$scope = $scope;
        this.$mdDialog = $mdDialog;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.$mdMenu = $mdMenu;
        this.pipPictureUtils = pipPictureUtils;
        this.url = '';
        this.invalid = true;
        this.theme = this.$rootScope[pip.themes.ThemeRootVar];
    }
    PictureUrlDialogController.prototype.setImageSize = function (img) {
        var imageWidth = img.width();
        var imageHeight = img.height();
        var cssParams = {};
        if ((imageWidth) > (imageHeight)) {
            cssParams['width'] = '250px';
            cssParams['height'] = 'auto';
        }
        else {
            cssParams['width'] = 'auto';
            cssParams['height'] = '250px';
        }
        img.css(cssParams);
    };
    PictureUrlDialogController.prototype.checkUrl = function () {
        var _this = this;
        var img = $("img#url_image")
            .on('error', function () {
            _this.invalid = true;
            _this.$scope.$apply();
        })
            .on('load', function (e) {
            _this.invalid = false;
            _this.setImageSize(img);
            _this.$scope.$apply();
        })
            .attr("src", this.url);
    };
    ;
    PictureUrlDialogController.prototype.onCancelClick = function () {
        this.$mdDialog.cancel();
    };
    ;
    PictureUrlDialogController.prototype.onAddClick = function () {
        this.$mdDialog.hide(this.url);
    };
    ;
    return PictureUrlDialogController;
}());
angular
    .module('pipPictureUrlDialog')
    .config(ConfigPictureUrlDialogTranslations)
    .controller('pipPictureUrlDialogController', PictureUrlDialogController);
},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PictureUrlDialogService = (function () {
    PictureUrlDialogService.$inject = ['$mdDialog'];
    function PictureUrlDialogService($mdDialog) {
        this._mdDialog = $mdDialog;
    }
    PictureUrlDialogService.prototype.show = function (successCallback, cancelCallback) {
        this._mdDialog.show({
            templateUrl: 'picture_url_dialog/PictureUrlDialog.html',
            clickOutsideToClose: true,
            controller: 'pipPictureUrlDialogController',
            controllerAs: '$ctrl'
        })
            .then(function (result) {
            if (successCallback) {
                successCallback(result);
            }
        });
    };
    return PictureUrlDialogService;
}());
angular
    .module('pipPictureUrlDialog')
    .service('pipPictureUrlDialog', PictureUrlDialogService);
},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipPictureUrlDialog', ['ngMaterial', 'pipPictures.Templates']);
require("./IPictureUrlDialogService");
require("./PictureUrlDialogService");
require("./PictureUrlDialogController");
},{"./IPictureUrlDialogService":34,"./PictureUrlDialogController":35,"./PictureUrlDialogService":36}],38:[function(require,module,exports){
configAvatarResources.$inject = ['pipRestProvider'];
function configAvatarResources(pipRestProvider) {
    pipRestProvider.registerOperation('avatars', '/api/1.0/avatars/:avatar_id');
}
angular
    .module('pipPictures.Rest')
    .config(configAvatarResources);
},{}],39:[function(require,module,exports){
configImageSetResources.$inject = ['pipRestProvider'];
function configImageSetResources(pipRestProvider) {
    pipRestProvider.registerPagedCollection('imagesets', '/api/1.0/imagesets/:imageset_id', { imageset_id: '@imageset_id' }, {
        page: { method: 'GET', isArray: false },
        update: { method: 'PUT' }
    });
}
angular
    .module('pipPictures.Rest')
    .config(configImageSetResources);
},{}],40:[function(require,module,exports){
configPictureResources.$inject = ['pipRestProvider'];
function configPictureResources(pipRestProvider) {
    pipRestProvider.registerPagedCollection('picture', '/api/1.0/blobs/:picture_id', { blob_id: '@picture_id' }, {
        page: { method: 'GET', isArray: false },
        update: { method: 'PUT' }
    });
    pipRestProvider.registerResource('picturesInfo', '/api/1.0/blobs/:picture_id/info');
}
angular
    .module('pipPictures.Rest')
    .config(configPictureResources);
},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipPictures.Rest', []);
require("./PictureResources");
require("./ImageSetResources");
require("./AvatarResources");
},{"./AvatarResources":38,"./ImageSetResources":39,"./PictureResources":40}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var imageCssParams = (function () {
    function imageCssParams() {
    }
    return imageCssParams;
}());
exports.imageCssParams = imageCssParams;
},{}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PicturePaste = (function () {
    PicturePaste.$inject = ['$timeout'];
    function PicturePaste($timeout) {
        "ngInject";
        this.$timeout = $timeout;
    }
    PicturePaste.prototype.addPasteListener = function (onPaste) {
        var _this = this;
        if (!window['Clipboard']) {
            if (this.pasteCatcher !== null && this.pasteCatcher !== undefined) {
                this.removePasteListener();
            }
            this.pasteCatcher = document.createElement("div");
            this.pasteCatcher.setAttribute("contenteditable", "true");
            $(this.pasteCatcher).css({
                "position": "absolute",
                "left": "-999",
                width: "0",
                height: "0",
                "overflow": "hidden",
                outline: 0
            });
            document.body.appendChild(this.pasteCatcher);
        }
        $(document).on('paste', function (event) {
            var localEvent;
            if (event['clipboardData'] == null && event.originalEvent) {
                localEvent = event.originalEvent;
            }
            else {
                localEvent = event;
            }
            if (localEvent.clipboardData) {
                var items = localEvent.clipboardData.items;
                _.each(items, function (item) {
                    if (item.type.indexOf("image") != -1) {
                        var file = item.getAsFile();
                        var fileReader = new FileReader();
                        fileReader.onload = function (e) {
                            _this.$timeout(function () {
                                onPaste({ url: e.target['result'], file: file });
                            });
                        };
                        fileReader.readAsDataURL(file);
                    }
                });
            }
            else if (window['clipboardData'] && window['clipboardData'].files) {
                _.each(window['clipboardData'].files, function (file) {
                    var fileReader = new FileReader();
                    fileReader.onload = function (e) {
                        _this.$timeout(function () {
                            onPaste({ url: e.target['result'], file: file });
                        });
                    };
                    fileReader.readAsDataURL(file);
                });
            }
        });
    };
    PicturePaste.prototype.removePasteListener = function () {
        if (!window['Clipboard']) {
            if (this.pasteCatcher !== null && this.pasteCatcher !== undefined) {
                document.body.removeChild(this.pasteCatcher);
                this.pasteCatcher = null;
            }
        }
        $(document).off('paste');
    };
    return PicturePaste;
}());
exports.PicturePaste = PicturePaste;
angular
    .module('pipPicturePaste', []);
},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var collageSchemes = [
    [
        { flex: 100, fullWidth: true, fullHeight: true }
    ],
    [
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 50, fullHeight: true, rightPadding: true },
                { flex: 50, fullHeight: true, leftPadding: true }
            ]
        }
    ],
    [
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 33, fullHeight: true, rightPadding: true },
                { flex: 33, fullHeight: true, leftPadding: true, rightPadding: true },
                { flex: 33, fullHeight: true, leftPadding: true }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 50, fullHeight: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, leftPadding: true, bottomPadding: true },
                        { flex: 50, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 70, fullHeight: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 30,
                    fullHeight: true,
                    children: [
                        { flex: 50, leftPadding: true, bottomPadding: true },
                        { flex: 50, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 50, fullWidth: true, bottomPadding: true },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, rightPadding: true, topPadding: true },
                        { flex: 50, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        }
    ],
    [
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 50, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 50, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 30, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 70,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 100, fullWidth: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 33, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        }
    ],
    [
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 33, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 50, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                            ]
                        },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 33, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 67,
                    fullHeight: true,
                    children: [
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                            ]
                        },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 100, fullWidth: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        }
    ],
    [
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 33, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 33, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 33, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 67,
                    fullHeight: true,
                    children: [
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                            ]
                        },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        }
    ],
    [
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 33, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 25, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 75,
                    fullHeight: true,
                    children: [
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, bottomPadding: true }
                            ]
                        },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    [
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            fullWidth: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullWidth: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullWidth: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        }
    ]
];
var PictureUtils = (function () {
    function PictureUtils() {
        "ngInject";
    }
    PictureUtils.prototype.getCollageSchemes = function () {
        return collageSchemes;
    };
    PictureUtils.prototype.setErrorImageCSS = function (image, params) {
        var cssParams = {
            'width': '',
            'margin-left': '',
            'height': '',
            'margin-top': ''
        };
        if (params) {
            cssParams = _.assign(cssParams, params);
        }
        if (image) {
            image.css(cssParams);
        }
    };
    PictureUtils.prototype.setImageMarginCSS = function ($element, image, params) {
        var containerWidth = $element.width ? $element.width() : $element.clientWidth;
        var containerHeight = $element.height ? $element.height() : $element.clientHeight;
        var imageWidth = image[0].naturalWidth || image.width;
        var imageHeight = image[0].naturalHeight || image.height;
        var margin = 0;
        var cssParams = {};
        if ((imageWidth / containerWidth) > (imageHeight / containerHeight)) {
            margin = -((imageWidth / imageHeight * containerHeight - containerWidth) / 2);
            cssParams['margin-left'] = '' + margin + 'px';
            cssParams['height'] = '' + containerHeight + 'px';
            cssParams['width'] = '' + imageWidth * containerHeight / imageHeight + 'px';
            cssParams['margin-top'] = '';
        }
        else {
            margin = -((imageHeight / imageWidth * containerWidth - containerHeight) / 2);
            cssParams['margin-top'] = '' + margin + 'px';
            cssParams['height'] = '' + imageHeight * containerWidth / imageWidth + 'px';
            cssParams['width'] = '' + containerWidth + 'px';
            cssParams['margin-left'] = '';
        }
        if (params) {
            cssParams = _.assign(cssParams, params);
        }
        image.css(cssParams);
    };
    PictureUtils.prototype.setIconMarginCSS = function (container, icon) {
        var containerWidth = container.clientWidth ? container.clientWidth : container.width;
        var containerHeight = container.clientHeight ? container.clientHeight : container.height;
        var margin = 0;
        var iconSize = containerWidth > containerHeight ? containerHeight : containerWidth;
        var cssParams = {
            'width': '' + iconSize + 'px',
            'margin-left': '',
            'height': '' + iconSize + 'px',
            'margin-top': ''
        };
        if ((containerWidth) > (containerHeight)) {
            margin = ((containerWidth - containerHeight) / 2);
            cssParams['margin-left'] = '' + margin + 'px';
        }
        else {
            margin = ((containerHeight - containerWidth) / 2);
            cssParams['margin-top'] = '' + margin + 'px';
        }
        icon.css(cssParams);
    };
    return PictureUtils;
}());
var PictureUtilsProvider = (function () {
    function PictureUtilsProvider() {
    }
    PictureUtilsProvider.prototype.$get = function () {
        "ngInject";
        if (this._service == null) {
            this._service = new PictureUtils();
        }
        return this._service;
    };
    return PictureUtilsProvider;
}());
angular
    .module('pipPictureUtils', [])
    .provider('pipPictureUtils', PictureUtilsProvider);
},{}],45:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./IPictureUtils");
require("./PictureUtils");
require("./PicturePaste");
__export(require("./IPictureUtils"));
__export(require("./PicturePaste"));
},{"./IPictureUtils":42,"./PicturePaste":43,"./PictureUtils":44}],46:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipPictures.Templates');
} catch (e) {
  module = angular.module('pipPictures.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('add_image/AddImage.html',
    '<md-menu><ng-transclude class="pip-add-image-open-button" ng-click="vm.openMenu($mdOpenMenu)" xxxng-click="vm.ngDisabled() ? \'\' : $mdOpenMenu()"></ng-transclude><md-menu-content width="4"><md-menu-item ng-if="vm.option.Upload"><md-button class="layout-row layout-align-start-center" accept="image/*" ng-keydown="vm.onKeyDown($event)" ng-multiple="vm.isMulti()" ng-file-select="" ng-file-change="vm.onFileChange($files)" ng-click="vm.hideMenu()" ng-file-drop=""><md-icon class="text-headline text-grey rm24-flex" md-svg-icon="icons:folder"></md-icon><span class="text-grey">{{ ::\'FILE\' | translate }}</span></md-button></md-menu-item><md-menu-item ng-if="vm.option.WebLink"><md-button class="layout-row layout-align-start-center" ng-click="vm.onWebLinkClick()"><md-icon class="text-headline text-grey rm24-flex" md-svg-icon="icons:weblink"></md-icon><span class="text-grey">{{ ::\'WEB_LINK\' | translate }}</span></md-button></md-menu-item><md-menu-item ng-if="vm.option.Camera"><md-button class="layout-row layout-align-start-center" ng-click="vm.onCameraClick()"><md-icon class="text-headline text-grey rm24-flex" md-svg-icon="icons:camera"></md-icon><span class="text-grey">{{ ::\'CAMERA\' | translate }}</span></md-button></md-menu-item><md-menu-item ng-if="vm.option.Galery"><md-button class="layout-row layout-align-start-center" ng-click="vm.onGalleryClick()"><md-icon class="text-headline text-grey rm24-flex" md-svg-icon="icons:images"></md-icon><span class="text-grey">{{ ::\'IMAGE_GALLERY\' | translate }}</span></md-button></md-menu-item></md-menu-content></md-menu>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipPictures.Templates');
} catch (e) {
  module = angular.module('pipPictures.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('camera_dialog/CameraDialog.html',
    '<md-dialog class="pip-dialog pip-picture-dialog pip-camera-dialog layout-column" md-theme="{{$ctrl.theme}}" ng-show="$ctrl.browser != \'android\'" ng-class="{\'pip-android-dialog\': $ctrl.browser == \'android\' || !$ctrl.browser}"><div class="pip-header"><md-button ng-click="$ctrl.onCancelClick()" class="md-icon-button" aria-label="{{ ::\'CANCEL\' | translate }}"><md-icon class="text-grey" md-svg-icon="icons:arrow-left"></md-icon></md-button><h3 class="m0 text-title">{{ ::\'TAKE_PICTURE\' | translate }}</h3></div><div class="pip-body"><div class="camera-stream" ng-hide="$ctrl.webCamError || $ctrl.browser == \'android\'"></div><div class="camera-error" ng-show="$ctrl.webCamError || $ctrl.browser == \'android\'"><span>{{ ::\'WEB_CAM_ERROR\' | translate }}</span></div></div><div class="pip-footer"><div class="w48"><md-button ng-click="$ctrl.onResetPicture()" ng-hide="!$ctrl.freeze || $ctrl.webCamError" class="md-icon-button" ng-disabled="transaction.busy()" aria-label="{{ ::\'REMOVE_PICTURE\' | translate }}"><md-icon class="text-grey" md-svg-icon="icons:refresh"></md-icon></md-button></div><div class="flex"></div><div class="w48"><md-button ng-click="$ctrl.onTakePictureClick()" ng-hide="$ctrl.webCamError" class="md-icon-button" aria-label="{{ ::\'TAKE_PICTURE\' | translate }}"><md-icon class="text-grey icon-button" md-svg-icon="icons:{{$ctrl.freeze ? \'check\' : \'camera\'}}"></md-icon></md-button></div><div class="flex"></div><div class="w48"><md-button ng-click="$ctrl.onCancelClick()" class="md-icon-button" aria-label="{{ ::\'CANCEL\' | translate }}"><md-icon class="text-grey" md-svg-icon="icons:cross"></md-icon></md-button></div></div></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipPictures.Templates');
} catch (e) {
  module = angular.module('pipPictures.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('gallery_search_dialog/GallerySearchDialog.html',
    '<md-dialog class="pip-dialog pip-gallery-search-dialog pip-picture-dialog layout-column" md-theme="{{ $ctrl.theme }}"><md-progress-linear ng-show="$ctrl.transaction.busy()" md-mode="indeterminate"></md-progress-linear><md-dialog-content class="pip-body lp0 rp0 tp0 pip-scroll flex layout-row"><div class="layout-column layout-align-start-start flex"><div class="pip-header w-stretch layout-column layout-align-start-start"><h3 class="w-stretch text-title m0 bp8"><md-button class="md-icon-button m0" ng-click="$ctrl.onCancelClick()" aria-label="{{ ::\'CANCEL\' | translate }}"><md-icon class="text-grey" md-svg-icon="icons:arrow-left"></md-icon></md-button>{{ ::\'IMAGE_GALLERY\' | translate }}</h3><div class="w-stretch divider-bottom layout-row layout-start-center"><input class="no-divider rm8 text-subhead1 flex" ng-disabled="$ctrl.transaction.busy()" ng-model="$ctrl.search" ng-keypress="$ctrl.onKeyPress($event)" placeholder="{{ ::\'SEARCH_PICTURES\' | translate }}" type="text" tabindex="1"><md-button class="md-icon-button md-icon-button-square p0 pip-search-button md-primary" ng-click="$ctrl.onSearchClick()" ng-hide="$ctrl.optionDefault" tabindex="-1" aria-label="SEARCH"><md-icon class="text-opacity md-primary" md-svg-icon="icons:search-square"></md-icon></md-button></div></div><div class="pip-content flex" ng-show="$ctrl.imagesSearchResult.length > 0"><div class="pip-image-container" ng-click="$ctrl.onImageClick(image)" ng-repeat="image in $ctrl.imagesSearchResult track by $index" ng-class="{\'checked\': image.checked}" tabindex="{{ $index + 2 }}"><pip-picture pip-src="image.thumbnail" pip-default-icon="icon-images" pip-rebind="true"></pip-picture><div class="pip-checked-cover"></div><div class="pip-checkbox-backdrop"><md-checkbox md-no-ink="" ng-model="image.checked" ng-click="image.checked = !image.checked" aria-label="CHECKED"></md-checkbox></div></div></div><div class="pip-no-images w-stretch layout-column layout-align-center-center flex" ng-show="$ctrl.imagesSearchResult.length == 0"><img src="images/add_from_image_library.svg" width="200" height="200"><p class="text-secondary opacity-secondary text-center">{{ ::\'IMAGE_START_SEARCH\' | translate }}</p></div></div></md-dialog-content><div class="pip-footer"><md-button ng-click="$ctrl.onCancelClick()" ng-hide="$ctrl.transaction.busy()" aria-label="{{ ::\'CANCEL\' | translate }}" tabindex="{{ $ctrl.imagesSearchResult.length + 3 }}"><span class="text-grey">{{ ::\'CANCEL\' | translate }}</span></md-button><md-button ng-if="transaction.busy()" ng-click="$ctrl.onStopSearchClick()" class="md-raised md-warn m0" tabindex="5" aria-label="ABORT" pip-test="button-cancel">{{ ::\'CANCEL\' | translate }}</md-button><md-button class="md-accent" ng-hide="$ctrl.transaction.busy()" ng-disabled="$ctrl.addButtonDisabled()" ng-click="$ctrl.onAddClick()" aria-label="{{ ::\'ADD\' | translate }}" tabindex="{{ $ctrl.imagesSearchResult.length + 4 }}">{{ ::\'ADD\' | translate }}</md-button></div></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipPictures.Templates');
} catch (e) {
  module = angular.module('pipPictures.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('picture_edit/PictureEdit.html',
    '<div class="pip-picture-upload pip-picture-drop md-focused" ng-keydown="$ctrl.onKeyDown($event)" ng-class="{\'pip-picture-error\': $ctrl.control.state == \'error\'}" tabindex="{{ $ctrl.ngDisabled || $ctrl.control.uploading ? -1 : 0 }}" pip-changed="$ctrl.readItemLocally(url, uriData, file, picture)" ng-disabled="$ctrl.ngDisabled" pip-multi="$ctrl.multiUpload" ng-focus="$ctrl.onFocus()" ng-blur="$ctrl.onBlur()" pip-option="$ctrl.option" pip-add-image=""><div class="pip-default-icon" ng-show="$ctrl.empty() || $ctrl.control.state == \'error\'"><md-icon class="pip-picture-icon" md-svg-icon="icons:{{ $ctrl.icon }}"></md-icon></div><div class="pip-default-text" ng-show="$ctrl.control.state == \'error\'"><span>{{ $ctrl.errorText | translate }}</span></div><div class="pip-default-text" ng-show="$ctrl.empty() && $ctrl.control.state != \'error\'"><span>{{ $ctrl.text | translate }}</span></div><img class="pip-picture-image" ng-src="{{ $ctrl.control.url }}" ng-show="!$ctrl.empty() && $ctrl.control.state != \'error\'" ng-class="{ \'pip-image-new\': $ctrl.isUpdated(), \'cursor-default\' : $ctrl.ngDisabled || $ctrl.control.uploading }" ui-event="{ error: \'$ctrl.onImageError($event)\', load: \'$ctrl.onImageLoad($event)\' }"><md-button class="md-icon-button" ng-click="$ctrl.onDeleteClick($event)" tabindex="-1" aria-label="delete" ng-hide="$ctrl.empty() || $ctrl.ngDisabled" ng-disabled="$ctrl.ngDisabled || $ctrl.control.uploading"><md-icon md-svg-icon="icons:cross"></md-icon></md-button><md-progress-linear ng-show="$ctrl.control.uploading" ng-value="$ctrl.control.progress"></md-progress-linear></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipPictures.Templates');
} catch (e) {
  module = angular.module('pipPictures.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('picture_list_edit/PictureListEdit.html',
    '<div pip-focused=""><div class="pip-picture-upload pointer pip-focusable" ng-class="{\'pip-picture-error\': item.state == \'error\'}" ng-keydown="$ctrl.onKeyDown($event, item)" tabindex="{{ $ctrl.ngDisabled ? -1 : 0 }}" ng-repeat="item in $ctrl.control.items | filter: $ctrl.filterItem"><div class="pip-default-icon" ng-hide="item.loaded || item.state == \'error\'"><md-icon pip-cancel-drag="true" class="pip-picture-icon" md-svg-icon="icons:{{ $ctrl.icon }}"></md-icon></div><div class="pip-default-text" ng-show="$ctrl.control.state == \'error\'"><span>{{ $ctrl.errorText | translate }}</span></div><img ng-src="{{ ::item.url }}" pip-cancel-drag="true" ng-hide="item.state == \'error\'" ng-class="{ \'pip-image-new\': item.state == \'added\' }" ui-event="{ error: \'$ctrl.onImageError($event, item)\', load: \'$ctrl.onImageLoad($event, item)\' }"><md-button ng-click="$ctrl.onDeleteClick(item)" ng-hide="$ctrl.ngDisabled || $ctrl.control.uploading" ng-disabled="$ctrl.ngDisabled || $ctrl.control.uploading" tabindex="-1" aria-label="delete" class="md-icon-button"><md-icon pip-cancel-drag="true" md-svg-icon="icons:cross"></md-icon></md-button><md-progress-linear md-mode="indeterminate" ng-show="item.uploading" value="{{ item.progress }}"></md-progress-linear></div><button class="pip-picture-upload pip-picture-drop pip-focusable" pip-add-image="" pip-multi="true" ng-focus="$ctrl.onFocus()" ng-blur="$ctrl.onBlur()" pip-changed="$ctrl.readItemLocally(url, uriData, file, picture)" ng-disabled="$ctrl.ngDisabled || $ctrl.control.uploading"><div class="pip-default-icon"><md-icon pip-cancel-drag="true" class="pip-picture-icon" md-svg-icon="icons:{{ $ctrl.icon }}"></md-icon></div><div class="pip-default-text"><span>{{ $ctrl.text | translate }}</span></div></button><div class="clearfix"></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipPictures.Templates');
} catch (e) {
  module = angular.module('pipPictures.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('picture_url_dialog/PictureUrlDialog.html',
    '<md-dialog class="pip-dialog pip-picture-url-dialog pip-picture-dialog layout-column" md-theme="{{ $ctrl.theme }}"><md-dialog-content class="pip-body lp0 rp0 tp0 pip-scroll"><div class="pip-header bm16 layout-row layout-align-start-center"><md-button ng-click="$ctrl.onCancelClick()" class="md-icon-button lm0" aria-label="{{ ::\'CANCEL\' | translate }}"><md-icon class="text-grey" md-svg-icon="icons:arrow-left"></md-icon></md-button><h3 class="text-title m0">{{ ::\'PICTURE_FROM_WEBLINK\' | translate}}</h3></div><div class="pip-content lm6 rm16"><md-input-container md-no-float="" class="w-stretch text-subhead1"><input type="text" ng-model="$ctrl.url" ng-change="$ctrl.checkUrl()" placeholder="{{ ::\'LINK_PICTURE\' | translate }}"></md-input-container><div class="w-stretch layout-row layout-align-center-center" ng-hide="$ctrl.invalid"><img id="url_image"></div><div class="pip-no-images layout-row layout-align-center-center" ng-show="$ctrl.invalid"><md-icon class="text-grey" md-svg-icon="icons:images"></md-icon></div></div></md-dialog-content><div class="pip-footer"><md-button ng-click="$ctrl.onCancelClick()" aria-label="{{ ::\'CANCEL\' | translate }}">{{ ::\'CANCEL\' | translate }}</md-button><md-button class="md-accent" ng-click="$ctrl.onAddClick()" ng-disabled="$ctrl.invalid" aria-label="{{ ::\'ADD\' | translate }}">{{ ::\'ADD\' | translate }}</md-button></div></md-dialog>');
}]);
})();



},{}]},{},[46,30])(46)
});

//# sourceMappingURL=pip-suite-pictures.js.map
