const { icon } = require("../iconc");
var core = require('./_core.js');
const { alert } = require("../dialog/dialog_utils");
const {storage}=require('../storage');
const util = require("../util");
var coreup=require('./core_up.js');

var addon_dialog;
var addon_icon = new icon({
  offset: "tr",
  content: util.getGoogleIcon("e87b", { type: "fill" })
});
addon_icon.getIcon().onclick = () => {
  if (!storage.checkIDB()) {
    alert('浏览器版本过低，无法使用插件功能！')
    return;
  }
  if (!addon_dialog) {
    drawAll();
    setTimeout(() => {
      addon_dialog.open();
    }, 10)
  } else {
    addon_dialog.open();
  }
}
if (!storage.checkIDB()) return;

function drawAll() {
  require('./xrmenu.js');
  require('./xrlist.js');
  require('./xrmarket.js');
  addon_dialog=require('./xrcore').addon_dialog;
}

if (window.addon_) {
  alert('已在安全模式下运行，插件功能已关闭！')
}

core=coreup(core);
module.exports= core;
