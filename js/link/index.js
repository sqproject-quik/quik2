(()=>{
  _REQUIRE_('./_core.js');
  var link;
  if (storage.checkIDB()) {
    // 支持数据库
    link=_REQUIRE_('./_db.js');
  } else {
    // 不支持数据库，使用localStorage
    link=_REQUIRE_('./_localstorage.js');
  }
  var ui=_REQUIRE_('./ui.js');
  link.on('change',function(e){
    console.log('cahnge');
    initsto.websync(e);
  });
  return util.joinObj(link,ui);
})();