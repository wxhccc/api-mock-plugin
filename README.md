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
- **options.index** {String}   the entry file in mockDir, default `'index.js'`
  入口文件，默认为mockDir目录下的index.js
- **options.routes** {String/String Array}    the base route(s) of api request, default `'/api-mock'`. for detail [express](https://www.npmjs.com/package/express)
  
  基础路由字符串或路由字符串数组，参见[express](https://www.npmjs.com/package/express)
- **options.minDelay** {Number}   the min delay millisecond before response, default `0`
  接口响应前的最低延时，默认为0
- **options.maxDelay** {Number}   the max delay millisecond before response, default `1000`.
  
  接口响应前的最高延时，默认为1000，设置为0时无主动延时
  > the actual delay will between minDelay an maxDelay

  > 实际延迟时间介于minDelay和maxDelay之间
- **options.suffix** {String}   the suffix of api files, default `'json'`
  
  接口文件的后缀，默认为'json'
- **options.readFiles** {Array}   the url-filePath config. 
  
  请求路径和静态文件的映射数组

- **options.appHanlder** {Function(app)}   the custom handler for `app`. 
  
  自定义的app处理逻辑

  > `app` is express application

**returns**: function (给devServer的before的处理函数)


## detail description for `options.readFiles`

readFiles is an array of get request and static mock file. for example:
```javascript
readFiles: ['/config.js', ['/apiconfig.js', 'api/config.js']]

/*
`[domain]/config.js` will read mockDir + '/config.js' file an return.

`[domain]/apiconfig.js` will read mockDir + '/api/config.js' file an return
*/
```


## License
MIT