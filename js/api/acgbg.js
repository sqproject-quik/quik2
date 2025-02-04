const util = require("../util");

function ce(cb) {
  var u = '';
  if (window.innerWidth <= 500) {
    u = 'https://img.loliapi.cn/i/pe/img' + (parseInt(Math.random() * 3095) + 1) + '.webp'
  } else {
    u = 'https://img.loliapi.cn/i/pc/img' + (parseInt(Math.random() * 696) + 1) + '.webp'
  }
  util.loadimg(u, ok => {
    if (ok) {
      cb({
        url: u,
        candownload: true
      });
    } else {
      u = "https://loliapi.com/acg/?_=" + Date.now();
      util.loadimg(u, () => {
        cb({
          url: u,
          candoanload: false
        })
      })
    }
  })
}

module.exports = {
  getImg: ce
}