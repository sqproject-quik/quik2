const initsto = require("./core");

var Setting = require('./setting.js');
var SettingGroup = require('./setting_group.js');
var SettingItem = require('./setting_item.js');
var mainSetting = require('./main_setting.js');
require('./setting_icon.js');
// @note 添加通用SettingGroup，方便添加设置
// @edit at 2024/1/31 10:22
var tyGroup = new SettingGroup({
  title: "通用",
  index: 0
});
mainSetting.addNewGroup(tyGroup);

module.exports= {
  Setting,
  SettingGroup,
  SettingItem,
  mainSetting,
  tyGroup,
  settingSto: initsto
}