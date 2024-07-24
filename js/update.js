!function(){
  window.version_code = '${VERSION_CODE}';
  window.version={
    version:'2.0.1-beta',
    version_code:window.version_code,
    updateTime:'2024/7/24',
    log:[
      {
        "tag": "fix",
        "content": "修复设置中的一个小BUG"
      },{
        "tag": "fix",
        "content": "修复搜索框中搜索联想文字超出的样式问题"
      },{
        "tag": "fix",
        "content": "修复通知中按钮渲染问题"
      },{
        "tag": "fix",
        "content": "修复插件商店安装插件时，百分比显示异常的问题"
      },{
        "tag": "new",
        "content": "在搜索时按“Tab”“Shift+Tab”切换搜索引擎"
      },{
        "tag": "fix",
        "content": "修复一些小BUG，优化用户体验。"
      }
    ]
  }
  if ('serviceWorker' in navigator&&!window._dev) {
    navigator.serviceWorker.ready.then(function (registration) {
      window.swReg=registration;
      quik.util.xhr('./version', function (r) {
        var nv = parseInt(r);
        if (nv > version_code) {
          registration.active.postMessage('update');
        }
      }, function () {
        console.log('获取版本失败');
      })
    });
    navigator.serviceWorker.addEventListener('message', function (e) {
      if (e.data == 'updated') {
        quik.confirm('新版本已准备就绪，是否刷新页面', function (v) {
          if (v) {
            localStorage.setItem('__q__s__','1');
            location.reload();
          }
        })
      }
    });
  }
  var version_dia=null;
  function showVersion(){
    if(!version_dia){
      version_dia=new dialog({
        content:`<h1>版本更新</h1><div class="version_item">
<div class="version_item_title">版本号：${window.version.version}</div>
<div class="version_item_update_time">发布时间：${window.version.updateTime}</div>
<div class="version_update">${formatVersion(window.version.log)}</div>
</div><div class="footer"><div class="btn ok">我知道了</div></div>`,
        class:"update_dialog"
      });
      util.query(version_dia.getDialogDom(),'.btn.ok').onclick=function(){
        version_dia.close();
      }
    }
    
    setTimeout(function(){
      version_dia.open();
    })
  }
  if(localStorage.getItem('__q__s__')){
    showVersion();
    localStorage.removeItem('__q__s__');
  }

  function formatVersion(fv){
    var str='',gl={
      "new":"新增",
      "del":"删除",
      "fix":"修复",
      "change":"修改",
      "thanks":"感谢"
    };
    for(var i=0;i<fv.length;i++){
      str+='<div class="update_item"><div class="update_item_tag '+fv[i].tag+'"><div>'+gl[fv[i].tag]+'</div></div><div class="update_item_content">'+fv[i].content+'</div></div>'
    }
    return str;
  }
}();
