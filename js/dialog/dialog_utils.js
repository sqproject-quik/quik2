const dialog = require("./index");
const util = require("../util");

var base = `<div class="def_dialog"><h1>提示</h1><div class="content">$0</div><div class="footer">$1<button class="ok btn">确定</button></div></div>`
var emptyFn = () => { };
function alert(text, cb) {
  if (!cb) cb = emptyFn;
  var d = new dialog({
    content: base.replace('$0', '').replace('$1', ''),
    clickOtherToClose: false
  });
  setTimeout(() => { d.open() }, 10)
  var dd = d.getDialogDom();
  util.query(dd, '.content').innerText = text;
  util.query(dd, '.ok').onclick = () => {
    cb();
    d.close();
    setTimeout(() => { d.destroy() }, 299);
  }
}
function confirm(text, cb) {
  if (!cb) cb = emptyFn;
  var d = new dialog({
    content: base.replace('$0', '').replace('$1', '<button class="cancel btn">取消</button>'),
    clickOtherToClose: false
  });
  setTimeout(() => { d.open() }, 10)
  var dd = d.getDialogDom();
  util.query(dd, '.content').innerText = text;
  util.query(dd, '.ok').onclick = () => {
    cb(true);
    d.close();
    setTimeout(() => { d.destroy() }, 299);
  }
  util.query(dd, '.cancel').onclick = () => {
    cb(false);
    d.close();
    setTimeout(() => { d.destroy() }, 299);
  }
}
function prompt(text, cb) {
  if (!cb) cb = emptyFn;
  var d = new dialog({
    content: base.replace('$0', '<p class="c"></p><p><input type="text"/></p>').replace('$1', '<button class="cancel btn">取消</button>'),
    clickOtherToClose: false
  });
  setTimeout(() => { d.open() }, 10)
  var dd = d.getDialogDom();
  util.query(dd, '.content .c').innerText = text;
  util.query(dd, '.ok').onclick = () => {
    cb(util.query(dd, '.content input').value);
    d.close();
    setTimeout(() => { d.destroy() }, 299);
  }
  util.query(dd, '.cancel').onclick = () => {
    cb('');
    d.close();
    setTimeout(() => { d.destroy() }, 299);
  }
  util.query(dd, '.content input').focus();
  util.query(dd, '.content input').addEventListener('keydown', function (e) {
    if (e.key == 'Enter') {
      cb(this.value);
      d.close();
      setTimeout(() => { d.destroy() }, 299);
    }
  })
}

module.exports = {
  alert,
  confirm,
  prompt
}