(()=>{
  function showOpenFilePicker(){
    return new Promise((resolve,reject)=>{
      var inp=document.createElement('input');
      inp.type='file';
      document.body.append(inp);
      inp.style.display='none';
      inp.click();
      inp.onchange=()=>{
        resolve(inp.files);
        inp.remove();
      }
    })
  }

  var onshows_fns=[];
  function Onshow(f){
    onshows_fns.push(f)
  }

  // (function(){
  //   function bodyResizer(){
  //     document.body.style.width=window.innerWidth+'px';
  //     document.body.style.height=window.innerHeight+'px';
  //   }
  //   window.addEventListener('resize',bodyResizer);
  //   bodyResizer();
  // })()
  

  var getEventHandle=_REQUIRE_('./js/event.js');
  var util=_REQUIRE_('./js/util.js');
  var toast=_REQUIRE_('./js/toast.js');
  var iconc=_REQUIRE_('./js/iconc/index.js');
  var {storage,getStorageList,getAllStorage,dbTool}=_REQUIRE_('./js/storage.js');
  var dialog=_REQUIRE_('./js/dialog/index.js');
  let {alert,confirm,prompt}=_REQUIRE_('./js/dialog/dialog_utils.js');
  var menu=_REQUIRE_('./js/menu/index.js');
  var mainmenu=_REQUIRE_('./js/menu/mainmenu.js');
  var setting=_REQUIRE_('./js/setting/index.js');
  var Setting=setting.Setting;
  var SettingGroup=setting.SettingGroup;
  var SettingItem=setting.SettingItem;
  var mainSetting=setting.mainSetting;
  var tyGroup=setting.tyGroup;
  var omnibox=_REQUIRE_('./js/omnibox/index.js');
  var link=_REQUIRE_('./js/link/index.js');
  var says=_REQUIRE_('./js/says/index.js');
  var card=_REQUIRE_('./js/card/index.js');
  var guidecreator=_REQUIRE_('./js/guidecreator.js');
  var fcard=_REQUIRE_('./js/fcard/index.js');
  var custom=_REQUIRE_('./js/custom/index.js');
  var background=_REQUIRE_('./js/background/index.js');
  var searchEditor=_REQUIRE_('./js/search/editor.js');
  var notice=_REQUIRE_('./js/notice/index.js');
  _REQUIRE_('./js/safe.js');
  var addon=_REQUIRE_('./js/addon/index.js');
  var sync=_REQUIRE_('./js/sync/index.js');
  var hotkey=_REQUIRE_('./js/hotkey.js');

  var ignores=_REQUIRE_('./js/ignores/index.js');
  _REQUIRE_('./js/update.js');
  _REQUIRE_('./js/oobe/index.js');
  _REQUIRE_('./js/rainbowegg/index.js');
  _REQUIRE_('./js/hello/index.js');


  var _upaddon={};
  var pbls=['runAddon','enable','disable','upupdate','upinstallByUrl','upinstallByOfficialMarket','upuninstall','installByLocal'];
  for(var k in addon){
    if(pbls.indexOf(k)==-1){
      _upaddon[k]=addon[k];
    }
  }
  _upaddon.update=addon.upupdate;
  _upaddon.installByUrl=addon.upinstallByUrl;
  _upaddon.installByOfficialMarket=addon.upinstallByOfficialMarket;
  _upaddon.uninstall=addon.upuninstall;


  window.quik={
    searchEditor,
    guidecreator,
    fcard,
    custom,
    sync,
    addon:_upaddon,
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
  window.util=util;
  if(localStorage.__quik_egg__){
    delete localStorage.__quik_egg__;
    window.eggnow__=true;
    clearTimeout(loadingtimeout);
    document.querySelector(".loading-f").style.display='block';
  }else{
    custom.waitdotheme(()=>{
      showmain();
    });
    setTimeout(()=>{
      showmain();
    },500);
  }

  var isshowmain=false;
  function showmain(){
    if(isshowmain)return;
    clearTimeout(loadingtimeout);
    document.querySelector(".loading-f").classList.add('h');
    document.querySelector(".loading-f").style.display='none';
    document.querySelector("main").style.display='block';
    document.querySelector("main").style.opacity='1';
    onshows_fns.forEach(f=>f());
    link.cateWidthShiPei();
    isshowmain=true;
    setTimeout(()=>{
        document.querySelector("main").classList.add('sicon');
    },360)
  }
  
  

  var f=`@font-face {
    font-family: 'Material Symbols Outlined';
    font-style: normal;
    font-weight: 100 700;
    src: url($0) format('woff2');
  }`
  if(window.isExt){
    util.addStyle(f.replace('$0','chrome-extension://'+window.extid+'/assets/google-icon.woff2'))
  }else{
    util.addStyle(f.replace('$0','https://fonts.gstatic.com/s/materialsymbolsoutlined/v213/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2'))
  }
})();