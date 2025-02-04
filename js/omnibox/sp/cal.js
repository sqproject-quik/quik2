const { SettingItem } = require("../../setting/index");
const util = require("../../util");
const { addNewSA, initsto, sg } = require("../_core");
const { setValue } = require("../_ui");

var si = new SettingItem({
    title: "自动计算",
    index: 2,
    type: 'boolean',
    message: "搜索框输入=自动计算后面的内容",
    get() {
        return !!initsto.get('ob_cal');
    },
    callback(value) {
        initsto.set('ob_cal', value);
        return true;
    }
})

sg.addNewItem(si);
addNewSA({
    check(text) {
        return (!!initsto.get('ob_cal')) && text[0] == '='
    },
    get(text, getsa) {
        var a = getsa();
        try {
            text = text.substr(1);
            if (!text) return a;
            var e = Math.E;
            var PI = Math.PI;
            var ln = Math.log;
            var lg = Math.log10;
            var sin = Math.sin;
            var cos = Math.cos;
            var tan = Math.tan;
            var asin = Math.asin;
            var acos = Math.acos;
            var atan = Math.atan;
            var sqrt = Math.sqrt;
            var abs = Math.abs;
            text = text.replaceAll('^', '**')
                .replaceAll('π', 'PI')
                .replaceAll('[', '(')
                .replaceAll(']', ')')
                .replaceAll('{', '(')
                .replaceAll('}', ')');
            var result = eval(text);
            result = result.toString().replace('e+', '*10^')
            a.unshift({
                icon: util.getGoogleIcon('ea5f'),
                text: result,
                click() {
                    setValue(result);
                }
            });
        } catch (e) { }

        return a;
    }
});

module.exports = si;