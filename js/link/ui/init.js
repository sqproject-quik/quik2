let {SettingGroup, mainSetting}=require('../../setting/index');
let util=require('../../util');

var linkF = util.element('div', {
    class: "links"
});

util.query(document, 'main .center').append(linkF);

var linksg = new SettingGroup({
    title: "链接",
});


mainSetting.addNewGroup(linksg);

function getIndex(a, b) {
    for (var i = 0; i < b.length; i++) {
      if (b[i].isSameNode(a)) {
        return i;
      }
    }
    return -1;
}

var linklist = [];

module.exports = {
    linkF,
    linksg,
    getIndex,
    getLinklist: () => {
        return linklist;
    },
    setLinklist: (list) => {
        linklist = list;
    }
}