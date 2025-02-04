const { _addSayType, getNowSay, setSayType, addSayType, initsto, getSayTypes, set_key, sayF, typesi, sayMenu, sayI, refsay } = require('./core.js');

_addSayType(require('./saydep/user.js'));
_addSayType(require('./saydep/yiyan.js'));
_addSayType(require('./saydep/shici.js'));

if (initsto.get('enabled')) {
    var __key = initsto.get('saytype');
    var sayTypes=getSayTypes();
    if (sayTypes[__key]) {
      sayMenu.setList(sayTypes[__key].menu);
      sayI.onclick = sayTypes[__key].click
      refsay(__key);
    } else {
      set_key(__key)
    }
  } else {
    sayF.style.display = 'none';
    typesi.hide();
  }

module.exports={
    getNowSay:getNowSay,
    setSayType:setSayType,
    addSayType:addSayType
}
