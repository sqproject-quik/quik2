const { SettingItem, tyGroup } = require("../setting/index");
const { initsto } = require("./core");

var si = new SettingItem({
  index: 3,
  title: "毛玻璃效果",
  message: "为所有内容开启毛玻璃效果，可能会影响性能。",
  type: "boolean",
  get() {
    return !!initsto.get('dialogblur');
  },
  callback(v) {
    initsto.set('dialogblur', v);
    d(v);
  }
})

tyGroup.addNewItem(si);

function d(v) {
  if (v) {
    document.body.classList.add('dialogblur');
  } else {
    document.body.classList.remove('dialogblur');
  }
}

d(initsto.get('dialogblur'));
module.exports = {
  set(a) {
    a = !!a;
    initsto.set('dialogblur', a);
    d(a);
    si.reGet();
  },
  get() {
    return initsto.get('dialogblur');
  }
};