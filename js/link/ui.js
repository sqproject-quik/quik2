const { dcate, enabledCateSi, cateWidthShiPei } = require('./ui/cate');
const { dsize, linkSizeSi } = require('./ui/link');
let { initsto } = require('./_core');
const { init} = require('./ui/z');
require('./draglink');

init();

module.exports = {
  isShowCate() {
    return initsto.get('enabledCate');
  },
  setShowCate(v) {
    initsto.set('enabledCate', v);
    dcate(v);
    enabledCateSi.reGet();
  },
  getLinkSize() {
    return initsto.get('linksize');
  },
  setLinkSize(v) {
    if (['xs', 's', 'm', 'l', 'xl'].indexOf(v) != -1) {
      initsto.set('linksize', v);
      dsize(v);
      linkSizeSi.reGet();
    }
  },
  cateWidthShiPei
}