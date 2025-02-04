const guidecreator = require("../guidecreator");
const link = require("../link/index");
const { initsto } = require("../omnibox/_core");
const { SettingItem, tyGroup } = require("../setting/index");
const util = require("../util");

util.initSet(initsto, 'linkblur', true);
var si = new SettingItem({
  index: 2,
  title: "极简模式",
  message: "(Alt+X)隐藏所有图标和链接，点击LOGO显示",
  type: "boolean",
  get() {
    return !!initsto.get('lite');
  },
  callback(v) {
    initsto.set('lite', v);
    d(v);
  }
})
var si2 = new SettingItem({
  index: 3,
  title: "链接页面背景模糊",
  message: "链接页面背景一般模糊显示，关闭后正常显示",
  type: "boolean",
  get() {
    return initsto.get('linkblur');
  },
  callback(v) {
    initsto.set('linkblur', v);
    linkblur(v);
  }
})

tyGroup.addNewItem(si);
tyGroup.addNewItem(si2);
var liteBack = util.element('div', {
  class: "liteback"
});

liteBack.innerHTML = util.getGoogleIcon('e5ce');
document.querySelector('main .center').appendChild(liteBack);
liteBack.addEventListener('click', () => {
  document.body.classList.remove('showall');
  document.body.classList.add('hiden');
})

function d(v) {
  document.body.classList.remove('hiden');
  document.body.classList.remove('showall');
  if (v) {
    document.body.classList.add('lite');
    document.body.classList.add('hiden');
    si2.show();
    if (!initsto.get('lite_firsted')) {
      var imglogopos = document.querySelector('main .logo .imglogo').getBoundingClientRect();
      guidecreator.create([{
        text: "点击LOGO就可以显示链接和所有图标",
        offset: window.innerWidth > 600 ? {
          top: imglogopos.top,
          left: imglogopos.left + imglogopos.width + 10
        } : {
          top: imglogopos.top + imglogopos.height + 10,
          left: imglogopos.left
        }
      }], function () {
        initsto.set('lite_firsted', true)
      })
    }
  } else {
    document.body.classList.remove('lite');
    link.cateWidthShiPei();
    si2.hide();
  }
}

function linkblur(v) {
  if (v) {
    document.querySelector('main').classList.remove('noblur');
  } else {
    document.querySelector('main').classList.add('noblur');
  }
}

document.querySelector("main .center .logo").addEventListener('click', () => {
  document.body.classList.add('showall');
  document.body.classList.remove('hiden');
  link.cateWidthShiPei();
})

d(initsto.get('lite'));
linkblur(initsto.get('linkblur'));
module.exports = {
  set(a) {
    a = !!a;
    initsto.set('lite', a);
    d(a);
    si.reGet();
  },
  get() {
    return initsto.get('lite');
  }
};
