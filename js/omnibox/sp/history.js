const { SettingItem } = require("../../setting/index");
const { storage } = require("../../storage");
const util = require("../../util");
const { addNewSA, initsto, sg } = require("../_core");
const { setValue } = require("../_ui");

var si = new SettingItem({
    title: "历史记录",
    index: 2,
    type: 'boolean',
    message: "开启后，搜索框为空时将显示历史记录（300字以上不计入，最多15条）",
    get() {
        return !!initsto.get('ob_his');
    },
    callback(value) {
        initsto.set('ob_his', value);
        return true;
    }
})

var hissto=storage('omhis');
if(hissto.get('his')==undefined){
    hissto.set('his',[]);
}

sg.addNewItem(si);
addNewSA({
    check(text) {
        console.log((!!initsto.get('ob_his')) , !text);
        return (!!initsto.get('ob_his')) && !text;
    },
    get(text, getsa) {
        var a = getsa();
        var his = hissto.get('his');
        console.log(his);
        for (let i = 0; i < his.length; i++) {
            a.push({
                icon:util.getGoogleIconByString('history'),
                text:his[i],
                click(){
                    setValue(his[i]);
                }
            })
        }
        return a;
    }
});

module.exports = si;