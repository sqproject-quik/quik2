(function(){
  var {addEventListener,removeEventListener,doevent}=getEventHandle();
  var sg=new SettingGroup({
    title:"搜索框",
    index:1
  });
  mainSetting.addNewGroup(sg);
  var core=_REQUIRE_('./_core.js')
  var ui=_REQUIRE_('./_ui.js')

  _REQUIRE_('./sp/cal.js');
  _REQUIRE_('./sp/translate.js');

  return{
    value:ui.setValue,
    focus:ui.focus,
    blur:ui.blur,
    isblur:ui.isblur,
    addNewSug:core.addNewSA,
    addEventListener,
    removeEventListener,
    getSearchType:core.searchUtil.getSearchType,
    getSearchTypeList:core.searchUtil.getSearchTypeList,
    getSearchTypeIndex:core.searchUtil.getSearchTypeIndex,
    setSearchType:core.searchUtil.setSearchType,
    setSearchList:core.searchUtil.setSearchList,
    search:{
      addEventListener:core.searchUtil.addEventListener
    },
    sg,
    setAutoFocus:ui.setAutoFocus,
    setJustSearch:ui.setJustSearch
  }
})()