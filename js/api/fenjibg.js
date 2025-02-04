
module.exports = {
  getImg(cb) {
    cb({
      url: 'https://tu.ltyuanfang.cn/api/fengjing.php?_=' + Date.now(),
      candoanload: false
    })
  }
}