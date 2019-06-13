'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));
var fs = _interopDefault(require('fs'));
var pathToRegexp = _interopDefault(require('path-to-regexp'));
var bodyParser = _interopDefault(require('body-parser'));

/** check whether the param provided is plain object  **/

function isPlainObject(obj) {
  return obj instanceof Object || Object.getPrototypeOf(obj) === null;
}
/** transform dir array to map object  **/


function getFileDirMap(dirArr) {
  let fileDirMap = {};
  dirArr.forEach(item => {
    if (typeof item === 'string') {
      fileDirMap[item] = item;
    } else if (Array.isArray(item) && item.length >= 2) {
      fileDirMap[item[0]] = item[1];
    }
  });
  return fileDirMap;
}
/** get mock data from apiHanlde  **/


function checkHandleHasMethod(apiHanlde) {
  const keys = Object.keys(apiHanlde);
  return ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE'].some(method => keys.includes('$' + method));
}
/** get mock data from apiHanlde  **/


function getApiMockData(apiHanlde, req, regexp, regKeys) {
  const {
    method,
    path: urlPath
  } = req;
  const handler = isPlainObject(apiHanlde) && checkHandleHasMethod(apiHanlde) ? apiHanlde['$' + method] : apiHanlde;
  return typeof handler === 'function' ? handler(req, getApiParams(regexp, regKeys, urlPath)) : handler;
}
/** get route params  **/


function getApiParams(regexp, regKeys, urlPath) {
  const paramArr = regexp.exec(urlPath);
  let params = {};

  for (let i = 1; i < paramArr.length; i++) {
    regKeys[i - 1] && (params[regKeys[i - 1].name] = paramArr[i]);
  }

  return params;
}
/** handle api request  **/


function requestHanlder(req, res, next) {
  const {
    MOCKDIR,
    index: INDEX,
    minDelay,
    maxDelay,
    suffix
  } = this.options;
  res.header('Access-Control-Allow-Origin', '*');
  const {
    path: urlPath,
    method
  } = req;
  const indexPath = path.join(MOCKDIR, INDEX);

  const delayRes = fn => maxDelay === 0 ? fn() : setTimeout(fn, minDelay + (maxDelay - minDelay) * Math.random());

  delete require.cache[indexPath];

  const apiHandles = require(indexPath);

  let resData = '';

  if (isPlainObject(apiHandles)) {
    for (let i in apiHandles) {
      const keys = [];
      const reg = pathToRegexp(i, keys);

      if (reg.test(urlPath)) {
        resData = getApiMockData(apiHandles[i], req, reg, keys);
        break;
      }
    }
  } else if (typeof apiHandles === 'function') {
    resData = apiHandles(method, urlPath, req);
  }

  if (!resData) {
    if (urlPath && urlPath !== '/') {
      const fileDir = path.join(MOCKDIR, urlPath + (suffix ? `.${suffix}` : ''));
      res.sendFile(fileDir, err => {
        delayRes(() => {
          err && res.status(err.status).end();
        });
      });
    }
  } else {
    delayRes(() => res.send(resData));
  }
}
/** readfile to utf-8 character string **/


function fileReader(req, res, next) {
  const {
    options: {
      MOCKDIR
    },
    fileDirMap
  } = this;
  fs.readFile(path.join(MOCKDIR, fileDirMap[req.path]), 'utf-8', (error, result) => {
    res.send(result);
  });
}
/** export plugin main function **/


function index (mockDir, options = {}) {
  const opts = Object.assign({
    index: 'index.js',
    routes: '/api-mock',
    minDelay: 0,
    maxDelay: 1000,
    suffix: 'json'
  }, options, {
    MOCKDIR: typeof mockDir === 'string' ? mockDir : null
  });
  const {
    MOCKDIR,
    appHanlder,
    readFiles,
    routes
  } = opts;

  if (!MOCKDIR || fs.accessSync(MOCKDIR)) {
    throw new Error('valid mockDir is missing');
  }

  return app => {
    try {
      if (Array.isArray(readFiles) && readFiles.length) {
        const fileDirMap = getFileDirMap(readFiles);
        const paths = Object.keys(fileDirMap);
        paths.length && app.get(paths, fileReader.bind({
          fileDirMap,
          options: opts
        }));
      }

      const workRequestHanlder = requestHanlder.bind({
        options: opts
      });
      app.use(routes, bodyParser.json(), bodyParser.urlencoded({
        extended: false
      }), workRequestHanlder);
      typeof appHanlder === 'function' && appHanlder(app, workRequestHanlder);
    } catch (e) {
      console.log(e);
    }
  };
}

module.exports = index;
