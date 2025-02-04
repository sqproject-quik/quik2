const dialog = require("../dialog");
const {alert, confirm}=require('../dialog/dialog_utils')
const getEventHandle = require("../event");
const { SettingGroup, SettingItem, mainSetting } = require("../setting/index");
const { storage } = require("../storage");
const util = require("../util");
const mainmenu=require('../menu/mainmenu');
const addon =require('../addon');

var backgroundsg = new SettingGroup({
  title: "背景",
  index: 3
});

var backgroundsi = new SettingItem({
  title: "背景设置",
  message: "点击设置背景",
  index: 0,
  type: 'null',
  callback: opendia
})

mainSetting.addNewGroup(backgroundsg);
backgroundsg.addNewItem(backgroundsi);


var eventHandle = getEventHandle();
var on = eventHandle.on;
var off = eventHandle.off;
var doevent = eventHandle.doevent;
var bgf = util.element('div', {
  class: "bgf"
});
util.query(document, 'body').appendChild(bgf);
var initsto = storage('background', {
  sync: true,
  get() {
    return new Promise((resolve, reject) => {
      var a = initsto.getAll();
      delete a.upload;
      if (a.bg.type != 'default') {
        a.requireAddon = addon.getAddonBySessionId(a.bg.type).url;
      } else {
        if (a.bg.data.type == 'userbg' && a.userbg.useidb) {
          a.bg = {
            type: "default",
            data: {
              type: "color",
              light: "#fff",
              dark: "#333"
            }
          }
        }
      }
      if (a.userbg && a.userbg.useidb) {
        delete a.userbg;
        alert('不支持同步用户上传的背景', function () {
          resolve(a);
        })
      } else {
        resolve(a);
      }
    });
  },
  rewrite(ast, k, a) {
    return new Promise((resolve, reject) => {
      if (a.requireAddon) {
        var raddon = addon.getAddonByUrl(a.requireAddon);
        if (raddon) {
          a.bg.type = raddon.session.id;
          ast[k] = a;
          resolve();
        } else {
          confirm('该背景数据需要安装插件以同步，是否安装？', (v) => {
            if (v) {
              var p = addon.installAddon(a.requireAddon);
              p.on('error', e => {
                alert('插件安装失败，同步取消', () => {
                  resolve();
                })
              });
              p.on('wait', r => {
                r(true);
              });
              p.on('done', e => {
                a.bg.type = e.id;
                ast[k] = a;
                resolve();
              });

            } else {
              alert('已取消背景同步', () => {
                resolve();
              })
            }
          })
        }
      } else {
        ast[k] = a;
        resolve();
      }
    })

  },
  title: "背景",
  desc: "QUIK起始页背景相关配置"
});
var tabindexCount = 0;

// 避免缓存（用于图片API）
function urlnocache(url) {
  return url + (url.indexOf('?') > -1 ? '&' : '?') + 't=' + new Date().getTime();
}


var bg_set_d, tab_con, scroll_con, d;

function drawDialog() {
  // 背景设置对话框
  bg_set_d = new dialog({
    content: `<div class="actionbar"><h1>背景设置</h1><div class="closeBtn">${util.getGoogleIcon('e5cd')}</div></div><div class="tab_con"></div><div class="scroll_con"></div>`,
    class: "bg_d auto-size",
    mobileShowtype: dialog.SHOW_TYPE_FULLSCREEN
  });

  // 背景设置对话框Dom
  d = bg_set_d.getDialogDom();

  // 关闭按钮
  util.query(d, '.closeBtn').onclick = () => {
    bg_set_d.close();
  }

  // 背景设置对话框Tab
  tab_con = util.query(d, 'div.tab_con');

  // 背景设置对话框内容
  scroll_con = util.query(d, 'div.scroll_con');
  drawers.forEach((drawer) => {
    dodrawer(drawer);
  })
}

// 初始化用户存储
util.initSet(initsto, 'bg', {
  type: "default",
  data: {
    type: "color",
    light: "#fff",
    dark: "#333"
  }
});


var drawers = [];

function pushBgTab(item) {
  var tab = item.tab; // tab标题

  // 一个tab标签
  var tabitem = util.element('div', {
    class: 'tabitem',
    'data-tab': tabindexCount.toString() //TabID，方便控制
  });
  tab_con.appendChild(tabitem);
  tabitem.innerHTML = tab;
  // 点击时跳转至该Tab
  tabitem.onclick = function () {
    activeTab(this.getAttribute('data-tab'));
  }

  // 内容
  var scrollitem = util.element('div', {
    class: 'scrollitem',
    'data-tab': tabindexCount.toString() //对应TabID，方便控制
  });
  scroll_con.appendChild(scrollitem);
  scrollitem.innerHTML = item.content;
  tabindexCount++;
  return scrollitem;
}

// activeTab
function activeTab(i) {
  util.query(d, '.tabitem', true).forEach(t => {
    t.classList.remove('active');
  });
  util.query(d, '.scrollitem', true).forEach(t => {
    t.style.display = '';
  });
  util.query(d, '.tabitem[data-tab="' + i + '"]').classList.add('active');
  util.query(d, '.scrollitem[data-tab="' + i + '"]').style.display = 'block';
}


var idmax = 0;
function pushBgDrawer(drawer) {
  var session = drawer.session;
  try {
    if (!util.checkSession(session)) {
      throw 'session error';
    }
  } catch (e) {
    throw new Error('背景Drawer注册失败，Session校验错误。')
  }
  var bgdrawerid = 'bgdrawer-' + idmax;
  idmax++;
  drawer.type = bgdrawerid;
  drawers.push(drawer);
  dodrawer(drawer);
  onbgdrawersign(drawer);
  return bgdrawerid;
}

function dodrawer(drawer) {
  if (bg_set_d) {
    drawer.init({
      bgf: bgf,
      pushBgTab: pushBgTab,
      setbg: setbg,
      type: drawer.type
    });
  }

}

var waitdraw = null;
function onbgdrawersign(drawer) {
  if (waitdraw) {
    if (drawer.type == waitdraw.type) {
      drawer.draw({
        bgf: bgf, data: waitdraw.data
      })
      waitdraw = null;
    }
  }
}

addon.on('allrun', () => {
  console.log('allrun');
  if (waitdraw) {
    waitdraw = null;
    initsto.set('bg', {
      type: "default",
      data: {
        type: "color",
        light: "#fff",
        dark: "#333"
      }
    })
    drawbg(initsto.get('bg'));
    alert('您的背景数据由于插件缺失无法显示，已为您切换为默认。')
  }
})

var nowdraw = null;
function drawbg(data) {
  for (var i = 0; i < drawers.length; i++) {
    if (data.type == drawers[i].type) {
      if (nowdraw && nowdraw.type != drawers[i].type) {
        nowdraw.cancel({ bgf: bgf });
        nowdraw = drawers[i];
      }
      drawers[i].draw({
        bgf: bgf, data: data.data
      })
      return;
    }
  }
  waitdraw = data;
}

function setbg(data) {
  initsto.set('bg', data);
  drawbg(data);
  doevent('change', [data]);
}




function getbg() {
  return initsto.get('bg');
}

mainmenu.pushMenu({
  icon: util.getGoogleIcon('e1bc'),
  title: '背景设置',
  click: opendia
}, mainmenu.MAIN_MENU_TOP)


function opendia() {
  if (!bg_set_d) {
    drawDialog();
    setTimeout(() => {
      bg_set_d.open();
      //开始activeTab0
      activeTab('0');
    }, 10)
  } else {
    bg_set_d.open();
  }
}

module.exports= {
  pushBgDrawer,
  getbg,
  setbg,
  on,
  off,
  
  _setDrawerList(d){
    drawers=d;
  },
  dodrawer,
  initsto,
  urlnocache,
  backgroundsg,
  drawbg,
  getd:()=>d
}
