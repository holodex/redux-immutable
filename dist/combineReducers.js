'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashEvery = require('lodash.every');

var _lodashEvery2 = _interopRequireDefault(_lodashEvery);

var _lodashIsplainobject = require('lodash.isplainobject');

var _lodashIsplainobject2 = _interopRequireDefault(_lodashIsplainobject);

var _lodashIsfunction = require('lodash.isfunction');

var _lodashIsfunction2 = _interopRequireDefault(_lodashIsfunction);

var _lodashForeach = require('lodash.foreach');

var _lodashForeach2 = _interopRequireDefault(_lodashForeach);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _canonical = require('canonical');

var isActionMap = undefined,
    isDomainMap = undefined,
    iterator = undefined;

/**
 * @param {Object.<string, Object>} map
 * @return {Boolean} If every object property value is a plain object.
 */
isDomainMap = function (map) {
    return (0, _lodashEvery2['default'])(map, _lodashIsplainobject2['default']);
};

/**
 * @param {Object.<string, Function>} map
 * @return {Boolean} If every object property value is a function.
 */
isActionMap = function (map) {
    return (0, _lodashEvery2['default'])(map, _lodashIsfunction2['default']);
};

/**
 * @param {Object} domain
 * @param {Object} action
 * @param {String} action.type
 * @param {Object} collection
 * @param {Object} tapper
 * @return {Object}
 */
iterator = function (domain, action, collection, tapper) {
    var newDomain = undefined;

    if (!_immutable2['default'].Iterable.isIterable(domain)) {
        throw new Error('Domain must be an instance of Immutable.Iterable.');
    }

    newDomain = domain;
    // console.log(`domain`, domain, `action`, action, `definition`, collection);

    (0, _lodashForeach2['default'])(collection, function (value, domainName) {
        // console.log(`value`, value, `domain`, domainName, `isActionMap`, isActionMap(value), `isDomainMap`, isDomainMap(value));

        if (isActionMap(value)) {
            // console.log(`action.type`, action.type, `value[action.type]`, typeof value[action.type]);

            if (value[action.type]) {
                var result = undefined;

                tapper.isActionHandled = true;

                result = value[action.type](newDomain.get(domainName), action);

                if (!_immutable2['default'].Iterable.isIterable(result)) {
                    throw new Error('Reducer must return an instance of Immutable.Iterable. "' + domainName + '" domain "' + action.type + '" action handler result is "' + typeof result + '".');
                }

                newDomain = newDomain.set(domainName, result);
            }
        } else if (isDomainMap(value)) {
            newDomain = newDomain.set(domainName, iterator(newDomain.get(domainName), action, value, tapper));
        }
    });

    return newDomain;
};

/**
 * @param {Object} reducer
 * @return {Function}
 */

exports['default'] = function (reducer) {
    (0, _canonical.validateReducer)(reducer);

    /**
     * @param {Immutable.Iterable} state
     * @param {Object} action
     * @return {Immutable.Iterable}
     */
    return function (state, action) {
        var newState = undefined,
            tapper = undefined;

        if (!action) {
            throw new Error('Action parameter value must be an object.');
        }

        if (action.type && action.type.indexOf('@@') === 0) {
            console.info('Ignoring private action "' + action.type + '". redux-immutable does not support state inflation. Refer to https://github.com/gajus/canonical-reducer-composition/issues/1.');

            return state;
        }

        (0, _canonical.validateAction)(action);

        // Tapper is an object that tracks execution of the action.
        // @todo Make this an opt-in.
        tapper = {
            isActionHandled: false
        };

        newState = iterator(state, action, reducer, tapper);

        if (!tapper.isActionHandled && action.type !== 'CONSTRUCT') {
            console.warn('Unhandled action "' + action.type + '".', action);
        }

        return newState;
    };
};

module.exports = exports['default'];
//# sourceMappingURL=combineReducers.js.map