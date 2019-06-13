## api-mock-plugin

This is a api mock plugin for `webpack-dev-server`, it will use application's node servers to mock api. you can use json files or `mockjs` to generate mock data

这是一个用于`webpack-dev-server`的接口mock插件，插件利用devServer的before参数来共享页面应用的服务器。你可以用json文件和`mockjs`包来生成mock数据


# Installation

#### npm
```shell
$ npm install @wxhccc/api-mock-plugin -D
```

# Usage

#### config in webpack

```javascript
/*
* pure plugin without 'path-to-regexp'
* 不包含'path-to-regexp'模块的简洁包，需要自己安装
*/
const apiMock = require('@wxhccc/api-mock-plugin')
/* or
 * complete plugin within 'path-to-regexp'
 * 包含'path-to-regexp'模块的完整包
 */
// const apiMock = require('@wxhccc/api-mock-plugin/index.complete')

/*
 * in vue.config.js(vue-cli3) 
 */
module.exports = {
  devServer: {
    before: apiMock(path.join(__dirname, 'apiMock/'))
  }
}
```


# API

## apiMock(mockDir, options)

**parameters:**
- **mockDir**            {String}    The base dir of mock files, required.
  存放mock数据的目录，必需参数，确实时会报错
- **options**    {Object}    The options.
- **options.index** {String}   the entry file in mockDir, default `'index.js'`. see [`index-content`](#index-content)
  
  入口文件，默认为mockDir目录下的index.js。文件具体内容格式见[`index-content`](#index-content)
- **options.routes** {String/String Array}    the base route(s) of api request, default `'/api-mock'`. see [express](https://www.npmjs.com/package/express)
  
  基础路由字符串或路由字符串数组，参阅[express](https://www.npmjs.com/package/express)
- **options.minDelay** {Number}   the min delay millisecond before response, default `0`
  接口响应前的最低延时，默认为0
- **options.maxDelay** {Number}   the max delay millisecond before response, default `1000`.
  
  接口响应前的最高延时，默认为1000，设置为0时无主动延时
  > the actual delay will between minDelay an maxDelay

  > 实际延迟时间介于minDelay和maxDelay之间
- **options.suffix** {String}   the suffix of api files, default `'json'`
  
  接口文件的后缀，默认为'json'
- **options.readFiles** {Array}   the url-filePath config. see [`readFiles`](#readFiles)
  
  请求路径和静态文件的映射数组

- **options.appHanlder** {Function(app)}   the custom handler for `app`. 
  
  自定义的app处理逻辑

  > `app` is express application

**returns**: function (给devServer的before的处理函数)


## `readFiles`

readFiles is an array of get request and static mock file. for example:
```javascript
readFiles: ['/config.js', ['/apiconfig.js', 'api/config.js']]

/*
`[domain]/config.js` will read mockDir + '/config.js' file an return.

`[domain]/apiconfig.js` will read mockDir + '/api/config.js' file an return
*/
```
## `index-content`

The entry file(default `index.js`) should export an `object` or a `function` through 'cjs' format, recommend `object`.

入口文件需要导出一个对象或函数，推荐导出对象形式，函数形式需要你自己处理request请求

#### Example:
```javascript
'use strict'
/* object
 * object keys will use `path-to-regexp` to match request path(not originUrl, path not include base path)
 * 对象的键值字符串会用`path-to-regexp`去匹配请求地址的path部分（path不包含基础路径，比如不包含'/api-mock',具体见express文档）
 */
module.exports = {
  /* value is plain object */
  /* 值可以是简单json对象 */
  '/aaa': { a: 1 },
  /* value is function */
  /* 值可以是一个函数，参数是请求对象和路径参数对象 */
  '/bbb/:id': (req, params) => {
    // params is `{ id: 1 }` is request url is '/api-mock/bbb/1'
    return params
  },
  /* value is special object contains $[method] keys. request will auto match method。used for restful apis */
  /* 值也可以是一个包含$[method]这种特殊key的对象。对象的键名会自动匹配请求方式。对应请求方式的值可以是对象和函数。这种方式适合restful风格的接口 */
  '/ccc/:id': {
    '$GET': (req, params) => (params),
    '$POST': { result: true }
  }
}

// or function
module.exports = function (method, path, req) {
  const { path, method } = req
  if (path === 'xxx') {
    return { data: 1 }
  }
}
```

## License
MIT