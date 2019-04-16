var express = require('express')
var router = express.Router()
var wechat = require('wechat')
var WechatAPI = require('wechat-api')
var mysql = require('mysql')
var schedule = require('node-schedule')

var config = {
  // 微信公众号配置信息
  token: 'wechat',
  appid: 'wx68b18f787f9878cd',
  appsecret: '056b3b767a368f84fac584456111ad7f',
  encodingAESKey: ''
}

var heatVal = ''
var spo2Val = ''
var nowtime = ''

var sql = 'SELECT * FROM my_test'

var api = new WechatAPI(config.appid, '056b3b767a368f84fac584456111ad7f')

// 定时读取数据库任务
setInterval(function() {
  var connection = mysql.createConnection({
    // 数据库配置信息   每次关闭连接都要重新创建一个连接
    host: '47.100.28.6',
    user: 'root',
    password: 'LL960220',
    port: '3306',
    database: 'test',
    charset: 'utf8'
  })

  //mysql 数据库处理 start
  connection.connect()

  connection.query(sql, function(err, result) {
    // 异步执行，执行完后返回回调函数
    if (err) {
      // console.log('[SELECT ERROR] - ', err.message)
      return
    }

    heatVal = result[result.length - 1].heart
    spo2Val = result[result.length - 1].blood
    nowtime = result[result.length - 1].time
  })

  connection.end()

  // 数据库处理 end
}, 2000)

// 定时任务 end

function checktime(t) {
  // 时间格式修正
  if (t < 10) {
    t = '0' + t
  }
  return t
}

router.use(express.query())

router.use(
  '/',
  wechat(config, function(req, res, next) {
    console.log(req.weixin)
    var message = req.weixin

    //文本    可换成switch
    if (message.Content === '查询') {
      res.reply(
        '当前心率为: ' +
          heatVal +
          ', 血氧浓度为: ' +
          spo2Val +
          ', 时间: ' +
          nowtime
      )
    }
  })
)

module.exports = router
