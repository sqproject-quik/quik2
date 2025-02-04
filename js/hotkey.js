let { mainSetting } = require('./setting/index.js');
let {setLite,isLite}=require('./custom/index.js');
let {setShowCate,isShowCate}=require('./link/index.js');

document.addEventListener('keydown', function (e) {
    if (e.key == 's' && e.altKey) {
        e.preventDefault();
        mainSetting.open();
    } else if (e.key == 'x' && e.altKey) {
        e.preventDefault();
        setLite(!isLite());
    } else if (e.key == 'g' && e.altKey) {
        e.preventDefault();
        setShowCate(!isShowCate());
    }
});