'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Transport = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _transport = require('lokka/transport');

var _transport2 = _interopRequireDefault(_transport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// In some envionment like in ReactNative, we don't need fetch at all.
// Technically, this should be handle by 'isomorphic-fetch'.
// But it's not happening. So this is the fix

var fetchUrl = void 0; /* global fetch */

if (typeof fetch === 'function') {
  // has a native fetch implementation
  fetchUrl = fetch;
} else {
  // for the browser
  require('whatwg-fetch');
  fetchUrl = fetch;
}

// the default error handler
function handleErrors(errors, data) {
  var message = errors[0].message;
  var error = new Error('GraphQL Error: ' + message);
  error.rawError = errors;
  error.rawData = data;
  throw error;
}

var Transport = exports.Transport = function (_LokkaTransport) {
  (0, _inherits3.default)(Transport, _LokkaTransport);

  function Transport(endpoint) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Transport);

    if (!endpoint) {
      throw new Error('endpoint is required!');
    }
    if (options.mode && !['same-origin', 'cors', 'no-cors', 'navigate'].includes(options.mode)) {
      throw new Error('unknown mode: ' + options.mode);
    }

    var _this = (0, _possibleConstructorReturn3.default)(this, (Transport.__proto__ || (0, _getPrototypeOf2.default)(Transport)).call(this));

    _this._httpOptions = {
      auth: options.auth,
      headers: options.headers || {},
      credentials: options.credentials,
      mode: options.mode
    };
    _this.endpoint = endpoint;
    _this.handleErrors = options.handleErrors || handleErrors;
    return _this;
  }

  (0, _createClass3.default)(Transport, [{
    key: '_buildOptions',
    value: function _buildOptions(payload) {
      var options = {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: (0, _stringify2.default)(payload),
        // To pass cookies to the server. (supports CORS as well)
        credentials: 'include',
        mode: this._httpOptions.mode || 'cors'
      };

      // use delete property for backward compatibility
      if (this._httpOptions.credentials === false) {
        delete options.credentials;
      }

      (0, _assign2.default)(options.headers, this._httpOptions.headers);
      return options;
    }
  }, {
    key: 'send',
    value: function send(query, variables, operationName) {
      var _this2 = this;

      var payload = { query: query, variables: variables, operationName: operationName };
      var options = this._buildOptions(payload);

      return fetchUrl(this.endpoint, options).then(function (response) {
        // 200 is for success
        // 400 is for bad request
        if (response.status !== 200 && response.status !== 400) {
          throw new Error('Invalid status code: ' + response.status);
        }

        return response.json();
      }).then(function (_ref) {
        var data = _ref.data,
            errors = _ref.errors;

        if (errors) {
          _this2.handleErrors(errors, data);
          return null;
        }

        return data;
      });
    }
  }]);
  return Transport;
}(_transport2.default);

exports.default = Transport;