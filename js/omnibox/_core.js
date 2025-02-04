const { mainSetting, settingSto,SettingGroup,SettingItem } = require("../setting/index");
const getEventHandle = require("../event");
const util = require("../util");
var searchUtil = require("../search/util.js");
let ui;
setTimeout(function(){
  ui=require('./_ui');
})

var initsto = settingSto;
var { on, off, doevent } = getEventHandle();
var sg = new SettingGroup({
  title: "搜索框",
  index: 1
});
mainSetting.addNewGroup(sg);
var k = {
  SA: [],
  enter: [],
}

if (initsto.get('ob_justsearch') == undefined) {
  initsto.set('ob_justsearch', false);
}
if (initsto.get('ob_http') == undefined) {
  initsto.set('ob_http', false);
}
if (initsto.get('ob_enable') == undefined) {
  initsto.set('ob_enable', true);
}
var sawait = [], sis = [];


/**
 * @param {String} text
 * @param {Function} updateFn(salist:{icon:String,text:String,click}[])
 */
var getSA = function (text, updateFn) {
  if (sawait.length > 0) {
    sawait.forEach(function (v) {
      k.SA[v].interrupt();
    })
  }
  var sa = [];
  var a = k.SA.length;
  for (var i = 0; i < a; i++) {
    if (k.SA[i].check(text)) {
      var b = k.SA[i].get(text, function () {
        return sa;
      })
      if (b instanceof Promise) {
        sawait.push(i);
        (function (i) {
          b.then(function (res) {
            sa = res;
            sawait.splice(sawait.indexOf(i), 1);
            updateFn(sa);
          });
        })(i);

      } else {
        sa = b;
        updateFn(sa);
      }
    }
  }
}

// 回车事件
var enter = function (text) {
  doevent('beforeenter', [text])
  getType(text).enter(text);
  doevent('afterenter', [text])
}

// 获取类型
var getType = function (text) {
  for (var i = 0; i < k.enter.length; i++) {
    if (k.enter[i].check(text)) {
      return k.enter[i];
    }
  }
}

var addNewType = function (options) {
  k.enter.unshift(options);
}

var addNewSA = function (options) {
  k.SA.push(options);
}



function checkUrl(text) {
  if (initsto.get('ob_justsearch')) {
    return false;
  }
  return util.checkUrl(text);
};

function initNative() {
  addNewType({
    check() {
      return true;
    },
    enter(text) {
      open(searchUtil.getSearchType().replace(searchUtil.keywordText, encodeURIComponent(text)));
    },
    icon: ":searchtype",
    submit: util.getGoogleIcon('E8B6')
  });

  addNewType({
    check: checkUrl,
    enter(text) {
      if (text.indexOf('://') == -1) {
        text = ((!!initsto.get('ob_http')) ? 'https://' : 'http://') + text;
      }
      open(text);
    },
    icon: util.getGoogleIcon('E80B'),
    submit: util.getGoogleIcon('E89E')
  });

  addNewSA({
    check(text) {
      return !!text;
    },
    get(text, getsa) {
      var a = getsa();
      a.unshift({
        icon: util.getGoogleIcon('E8B6'),
        text: text,
        click() {
          open(searchUtil.getSearchType().replace(searchUtil.keywordText, encodeURIComponent(text)));
        }
      });
      return a;
    }
  })


  var searchfetch = null;
  addNewSA({
    check(text) {
      return !!text;
    },
    get(text, getsa) {
      return new Promise(function (r, j) {
        searchfetch = util.jsonp('https://www.baidu.com/sugrec?pre=1&p=3&ie=utf-8&json=1&prod=pc&from=pc_web&wd=' + encodeURIComponent(text), function (res) {
          var a2 = getsa();
          searchfetch = null;
          if (!res.g) {
            r(a2);
            return;
          }
          res.g.forEach(function (item) {
            a2.push({
              icon: util.getGoogleIcon('E8B6'),
              text: item.q,
              click() {
                open(searchUtil.getSearchType().replace(searchUtil.keywordText, encodeURIComponent(item.q)));
              }
            });
          })
          r(a2);
        }, 'cb');
      })
    },
    interrupt() {
      if (searchfetch) {
        searchfetch.abort();
        searchfetch = null;
      }
    }
  });

  addNewSA({
    check: checkUrl,
    get(text, getsa) {
      return new Promise(function (r, j) {
        var a = getsa();
        a.unshift({
          icon: util.getGoogleIcon('E80B'),
          text: text,
          click() {
            if (text.indexOf('://') == -1) {
              text = ((!!initsto.get('ob_http')) ? 'https://' : 'http://') + text;
            }
            open(text);
          }
        });
        r(a);
      })
    }
  });
  var cal = require('./sp/cal.js');
  var tr = require('./sp/translate.js');
  sis.push(cal);
  sis.push(tr);
  init_state = true;
}

var init_state = false;
function isInit() {
  return init_state;
}



var sic = new SettingItem({
  title: "启用搜索框",
  index: 1,
  type: 'boolean',
  message: "关闭将不显示搜索框",
  get() {
    return !!initsto.get('ob_enable');
  },
  callback(value) {
    initsto.set('ob_enable', value);
    if (value && !init_state) {
      initNative();
    }
    initSett(value);
    ui.uiEnable(value);
    return true;
  }
})

var si = new SettingItem({
  title: "搜索框仅搜索",
  index: 1,
  type: 'boolean',
  message: "打开后，搜索框将失去打开链接的功能",
  get() {
    return !!initsto.get('ob_justsearch');
  },
  callback(value) {
    initsto.set('ob_justsearch', value);
    if (value) {
      ui.getInput().placeholder = '搜索'
    } else {
      ui.getInput().placeholder = '搜索或输入网址'
    }
    return true;
  }
})

var si2 = new SettingItem({
  title: "默认HTTPS打开链接",
  index: 1,
  type: 'boolean',
  message: "打开后，搜索框打开链接在默认情况下使用HTTPS",
  get() {
    return !!initsto.get('ob_http');
  },
  callback(value) {
    initsto.set('ob_http', value);
    return true;
  }
})
sg.addNewItem(sic);
sg.addNewItem(si);
sg.addNewItem(si2);
sis.push(si);
sis.push(si2);

function initSett(a) {
  if (a) {
    sis.forEach(si => si.show());
  } else {
    sis.forEach(si => si.hide());
  }
}
module.exports = {
  getSA: getSA,
  enter: enter,
  getType: getType,
  addNewType: addNewType,
  addNewSA: addNewSA,
  searchUtil: searchUtil,
  initsto: initsto,
  setJustSearch(value) {
    initsto.set('ob_justsearch', value);
    si.reGet();
  },
  isInit,
  initNative,
  initSett,
  on,
  off,
  doevent,
  sg
}