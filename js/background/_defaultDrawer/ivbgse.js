const { SettingItem, Setting, SettingGroup } = require("../../setting/index");
const util = require("../../util");
const { initsto, backgroundsg } = require("../core");
util.initSet(initsto, 'ivsetting', {
  mb: 50,
  isbr: false,
  br: 6,
  th: 1
})
var ImgOrVideoSi = new SettingItem({
  title: "背景图片/视频显示设置",
  message: "设置背景图片/视频显示的蒙版和模糊等",
  type: "null",
  callback() {
    ImgOrVideoSe.open();
  }
});

backgroundsg.addNewItem(ImgOrVideoSi);

var ImgOrVideoSe = new Setting({
  title: "背景图片/视频显示设置",
});

var ivsg = new SettingGroup({
  title: "通用",
  index: 0
});

var ivse_th = new SettingItem({
  title: "背景蒙版颜色主题",
  index: 0,
  type: "select",
  init() {
    return {
      0: "跟随主题",
      1: "黑色",
      2: "白色"
    }
  },
  get() {
    var k = initsto.get('ivsetting').th;
    if (typeof k == 'undefined') {
      return 1;
    }
    return k;
  },
  callback(v) {
    var o = initsto.get('ivsetting');
    o.th = parseInt(v);
    initsto.set('ivsetting', o);
    r();
  }
})

var ivse_mb = new SettingItem({
  title: "背景蒙版浓度",
  index: 1,
  type: "range",
  init() {
    return [0, 90]
  },
  get() {
    return initsto.get('ivsetting').mb;
  },
  callback(v) {
    var o = initsto.get('ivsetting');
    o.mb = v;
    initsto.set('ivsetting', o);
    r();
  }
})

var ivse_isbr = new SettingItem({
  title: "背景模糊",
  message: "可能会影响性能",
  type: "boolean",
  index: 2,
  get() {
    return initsto.get('ivsetting').isbr;
  },
  callback(v) {
    if (v) {
      ivse_br.show();
    } else {
      ivse_br.hide();
    }
    var o = initsto.get('ivsetting');
    o.isbr = v;
    initsto.set('ivsetting', o);
    r();
  }
});


var ivse_br = new SettingItem({
  title: "背景模糊程度",
  index: 3,
  type: "range",
  init() {
    return [1, 20]
  },
  get() {
    return initsto.get('ivsetting').br;
  },
  callback(v) {
    var o = initsto.get('ivsetting');
    o.br = v;
    initsto.set('ivsetting', o);
    r();
  }
});

ImgOrVideoSe.addNewGroup(ivsg);
ivsg.addNewItem(ivse_th);
ivsg.addNewItem(ivse_mb);
ivsg.addNewItem(ivse_isbr);
ivsg.addNewItem(ivse_br);
if (!initsto.get('ivsetting').isbr) {
  ivse_br.hide();
}

function r() {
  // create Style
  if (!document.querySelector('.bgf .img-sp') && !document.querySelector('.bgf .video-sp')) return;

  var o = initsto.get('ivsetting');
  var s = document.querySelector("#ivbgse");
  if (!s) {
    s = document.createElement('style');
    s.id = 'ivbgse';
    document.head.append(s);
  }
  var h = '';
  var b = '';
  if (o.th == 1) {
    flisten();
    b = '0,0,0';
    document.body.classList.add('t-dark')
    document.body.classList.remove('t-light')
  } else if (o.th == 2) {
    flisten();
    b = '255,255,255'
    document.body.classList.remove('t-dark')
    document.body.classList.add('t-light')
  } else if (o.th == 0) {
    glisten();
    if (custom.getColor() == 'dark') {
      document.body.classList.add('t-dark')
      document.body.classList.remove('t-light')
      b = '0,0,0';
    } else {
      document.body.classList.remove('t-dark')
      document.body.classList.add('t-light')
      b = '255,255,255';
    }
  }
  h += '.img-sp .cover,.video-sp .cover{background-color:rgba(' + b + ',' + (o.mb / 100) + ')}';
  if (o.isbr) {
    h += '.img-sp .cover,.video-sp .cover{backdrop-filter:blur(' + o.br + 'px)}'
  }
  s.innerHTML = h;
}

var listened = false;
function glisten() {
  if (listened) return;
  listened = true;
  setTimeout(() => {
    quik.custom.on('colorchange', _colorchange)
  })
}
function flisten() {
  if (!listened) return;
  listened = false;
  setTimeout(() => {
    quik.custom.off('colorchange', _colorchange)
  })
}
function _colorchange(d) {
  var o = initsto.get('ivsetting');
  var s = document.querySelector("#ivbgse");
  var b = '', h = '';
  if (d == 'dark') {
    document.body.classList.add('t-dark')
    document.body.classList.remove('t-light')
    b = '0,0,0';
  } else {
    document.body.classList.remove('t-dark')
    document.body.classList.add('t-light')
    b = '255,255,255';
  }
  h += '.img-sp .cover,.video-sp .cover{background-color:rgba(' + b + ',' + (o.mb / 100) + ')}';
  if (o.isbr) {
    h += '.img-sp .cover,.video-sp .cover{backdrop-filter:blur(' + o.br + 'px)}'
  }
  s.innerHTML = h;
}

r();
module.exports= { ImgOrVideoSi, checkBgCoverStyle: r };
