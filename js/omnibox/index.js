var core = require('./_core.js')
var ui = require('./_ui.js')

var _isen = core.initsto.get('ob_enable')
if (_isen && !core.isInit()) {
  core.initNative();
}
core.initSett(_isen);
ui.uiEnable(_isen);

module.exports= {
  value: ui.setValue,
  focus: ui.focus,
  blur: ui.blur,
  isblur: ui.isblur,
  addNewSug: core.addNewSA,
  addNewType: core.addNewType,
  on:core.on,
  off:core.off,
  getSearchType: core.searchUtil.getSearchType,
  getSearchTypeList: core.searchUtil.getSearchTypeList,
  getSearchTypeIndex: core.searchUtil.getSearchTypeIndex,
  setSearchType: core.searchUtil.setSearchType,
  setSearchList: core.searchUtil.setSearchList,
  keywordText: core.searchUtil.keywordText,
  neizhi: core.searchUtil.neizhi,
  search: {
    on: core.searchUtil.on
  },
  sg:core.sg,
  setAutoFocus: ui.setAutoFocus,
  setJustSearch: ui.setJustSearch
}