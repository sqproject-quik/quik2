const card = require("./card");
const util = require("./util");

module.exports = {
    create(steps, cb, istopper){
        if (steps.length == 0) { cb(); return; }
        var _card = new card({
            content: "<div class=\"guide-text\"></div><div class=\"btn ok\">确定</div>",
            class: "guide-card",
            offset: { top: 0, left: 0 },
            width: 200,
            topper: istopper
        });
        var _cd = _card.getCardDom();
        var j = 0;
        function dostep() {
            util.query(_cd, '.guide-text').innerHTML = steps[j].text;
            if (_card.isShow) {
                _card.setOffset(steps[j].offset, 300);
            } else {
                _card.setOffset(steps[j].offset);
                _card.show(300);
            }
        }
        dostep();
        util.query(_cd, '.btn.ok').addEventListener('click', () => {
            j++;
            if (j >= steps.length) {
                _card.hide(300);
                cb();
            } else {
                dostep(j);
            }
        })
    }
}