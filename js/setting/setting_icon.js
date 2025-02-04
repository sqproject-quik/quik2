const { icon } = require("../iconc/index");
const util = require("../util");
const mainSetting = require("./main_setting");

var setting_icon = new icon({
  content: util.getGoogleIcon('e8b8', { type: "fill" }),
  offset: "bl"
});
setting_icon.getIcon().title = "(Alt+S) 打开设置"
setting_icon.getIcon().onclick = () => {
  mainSetting.open();
}