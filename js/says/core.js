const dialog = require("../dialog");
const menu = require("../menu");
const { SettingGroup, SettingItem, mainSetting } = require("../setting/index");
const {storage} = require("../storage");
const util = require("../util");
const {alert, confirm} =require('../dialog/dialog_utils');
const addon =require('../addon');

var initsto = storage('says', {
  sync: true,
  title: "一言",
  desc: "QUIK起始页一言相关配置",
  get: async () => {
    var a = initsto.getAll();
    var ra = addon.getAddonBySessionId(a.saytype);
    if (ra) {
      a.requireAddon = ra.url;
    }
    return a;
  },
  rewrite(ast, k, a) {
    return new Promise((resolve, reject) => {
      if (a.requireAddon) {
        var raddon = addon.getAddonByUrl(a.requireAddon);
        if (raddon) {
          a.saytype = raddon.session.id;
          ast[k] = a;
          resolve();
        } else {
          confirm('该一言数据需要安装插件以同步，是否安装？', (v) => {
            if (v) {
              addon.installAddon(a.requireAddon).then((_addon) => {
                a.saytype = _addon.session.id;
                ast[k] = a;
                resolve();
              }).catch((code) => {
                if (code == 0) {
                  alert('插件取消安装，同步取消', () => {
                    resolve();
                  })
                } else {
                  alert('插件安装失败，同步取消', () => {
                    resolve();
                  })
                }
              });
            } else {
              alert('已取消一言同步', () => {
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
  }
});

//   var sayTypes=['user','jinrishici','hitokoto'];

var sayF = util.element('div', {
  class: "says"
});

util.query(document, 'main').appendChild(sayF);

sayF.innerHTML = `<div class="say-inner"></div><div class="say-control">${util.getGoogleIcon('e5d4')}</div>`;

var sayI = util.query(sayF, 'div.say-inner');
var sayC = util.query(sayF, 'div.say-control');
var sayMenu = new menu({
  list: [],
});

var sayinfoDialog = new dialog({
  content: `<div class="closeBtn">${util.getGoogleIcon('e5cd')}</div><ul></ul>`,
  class: "says_info"
});

var infd = sayinfoDialog.getDialogDom();
util.query(infd, 'div.closeBtn').onclick = () => {
  sayinfoDialog.close();
}

var sayTypes = {}, nowSay = {};
function _addSayType(details) {
  sayTypes[details.key] = {
    name: details.name,
    callback: details.callback,
    click: details.click || (() => { }),
    menu: details.menu || [
      {
        icon: util.getGoogleIcon('e14d'),
        title: '复制',
        click() {
          var value = nowSay.say;
          util.copyText(value);
        }
      }
    ]
  }
}

function addSayType(details) {
  if (!util.checkSession(details.session)) {
    throw "错误的session";
  }
  details.key = details.session.id;
  _addSayType(details)
  typesi.reInit();
  waitfn(details.key);
}

addon.on('allrun', () => {
  if (_key) {
    initsto.set('saytype', 'user');
    refsay('user');
    alert('您的一言数据由于插件缺失无法显示，已为您切换为默认。');
  }
})

function setSayType(key, cb) {
  if (util.checkSession(key)) {
    key = key.id;
  }
  if (!sayTypes[key]) {
    throw 'type不存在 type:' + key;
  }

  initsto.set('saytype', key);
  sayMenu.setList(sayTypes[key].menu);
  sayI.onclick = sayTypes[key].click

  refsay(key, cb);
  typesi.reGet();
}

function refsay(key, cb) {
  if (util.checkSession(key)) {
    key = key.id;
  }
  if (!sayTypes[key]) {
    throw 'key不存在';
  }
  sayI.innerText = '...';
  sayI.title = '加载中';
  sayTypes[key].callback().then((say) => {
    sayI.innerText = say.say;
    sayI.setAttribute('title', say.title);
    nowSay = say;
    cb && cb();
  })
}

function getNowSay() {
  return nowSay;
}

function openSayDetailsDialog(op) {
  util.query(infd, 'ul').innerHTML = (() => {
    var str = '';
    for (var k in op) {
      str += '<li><b>' + k + ':</b> ' + op[k] + '</li>';
    }
    return str;
  })();
  sayinfoDialog.open();
}

sayC.onclick = (e) => {
  e.stopPropagation();
  var bo = sayC.getBoundingClientRect()
  sayMenu.setOffset({
    bottom: window.innerHeight - bo.top,
    left: bo.left - 90 + bo.width
  });
  sayMenu.show();
}

if (!initsto.get('saytype')) {
  initsto.set('saytype', 'user');
}


if (initsto.get('enabled') == undefined) {
  initsto.set('enabled', true);
}


var sg = new SettingGroup({
  title: "一言",
  index: 3
});
var typesi = new SettingItem({
  title: "一言类型",
  type: 'select',
  index: 1,
  message: "页面底部显示的一言类型",
  init() {
    var ks = {};
    for (var k in sayTypes) {
      ks[k] = sayTypes[k].name;
    }
    return ks;
  },
  callback(v) {
    setSayType(v);
  },
  get() {
    return initsto.get('saytype');
  }
})
var showsi = new SettingItem({
  title: "显示一言",
  type: 'boolean',
  message: "是否页面底部显示的一言",
  index: 0,
  callback(v) {
    initsto.set('enabled', v);
    if (v) {
      setSayType(initsto.get('saytype'));
      sayF.style.display = '';
      typesi.show();
    } else {
      sayF.style.display = 'none';
      typesi.hide();
    }
  },
  get() {
    return initsto.get('enabled');
  }
})
mainSetting.addNewGroup(sg);
sg.addNewItem(typesi);
sg.addNewItem(showsi);
var _key;
function waitfn(id) {
  if (id == _key) {
    sayMenu.setList(sayTypes[id].menu);
    sayI.onclick = sayTypes[id].click
    refsay(id);
    _key = null;
  }
}

module.exports = {
  getNowSay,
  setSayType,
  addSayType,
  _addSayType,
  refsay,
  initsto,
  openSayDetailsDialog,
  sayMenu,
  sayI,
  sayF,
  typesi,
  getSayTypes:()=>sayTypes,
  set_key:(_k)=>{_key=_k}
}
