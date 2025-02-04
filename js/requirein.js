var getEventHandle = require('./event.js');
var util = require('./util.js');
var toast = require('./toast.js');
var iconc = require('./iconc/index.js');
var { storage } = require('./storage.js');
var dialog = require('./dialog/index.js');
let { alert, confirm, prompt } = require('./dialog/dialog_utils.js');
var menu = require('./menu/index.js');
var mainmenu = require('./menu/mainmenu.js');
var setting = require('./setting/index.js');
var Setting = setting.Setting;
var SettingGroup = setting.SettingGroup;
var SettingItem = setting.SettingItem;
var mainSetting = setting.mainSetting;
var tyGroup = setting.tyGroup;
var omnibox = require('./omnibox/index.js');
var link = require('./link/index.js');
var says = require('./says/index.js');
var card = require('./card/index.js');
var guidecreator = require('./guidecreator.js');
var fcard = require('./fcard/index.js');
var custom = require('./custom/index.js');
var background = require('./background/index.js');
var searchEditor = require('./search/editor.js');
var notice = require('./notice/index.js');
require('./notice/tuisong');
require('./safe.js');
var addon = require('./addon/index.js');
var sync = require('./sync/index.js');
require('./hotkey.js'); 
require('./ignores/index.js');
require('./update.js');
require('./oobe/index.js');
require('./rainbowegg/index.js');
require('./hello/index.js');


var _upaddon = {};
var pbls = ['runAddon', 'enable', 'disable', 'upupdate', 'upinstallByUrl', 'upinstallByOfficialMarket', 'upuninstall', 'installByLocal'];
for (var k in addon) {
  if (pbls.indexOf(k) == -1) {
    _upaddon[k] = addon[k];
  }
}
_upaddon.update = addon.upupdate;
_upaddon.installByUrl = addon.upinstallByUrl;
_upaddon.installByOfficialMarket = addon.upinstallByOfficialMarket;
_upaddon.uninstall = addon.upuninstall;


window.quik = {
  searchEditor,
  guidecreator,
  fcard,
  custom,
  sync,
  addon: _upaddon,
  storage,
  omnibox,
  util,
  link,
  dialog,
  toast,
  says,
  menu,
  iconc,
  background,
  mainmenu,
  Setting,
  SettingGroup,
  SettingItem,
  mainSetting,
  notice,
  tyGroup,
  alert,
  confirm,
  prompt,
  card,
  getEventHandle
}
window.util = util;