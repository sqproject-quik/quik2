const mainmenu= require("../menu/mainmenu");
const util = require("../util");
const Setting = require("./setting");

var mainSetting = new Setting({
  title: "设置"
});
mainmenu.pushMenu({
  icon: util.getGoogleIcon('e8b8', { type: "fill" }),
  title: '主设置',
  click() {
    mainSetting.open();
  }
}, mainmenu.MAIN_MENU_TOP)
module.exports = mainSetting;