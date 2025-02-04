const dialog = require('../dialog');
const util = require('../util');

var addon_dialog = new dialog({
    content: (require('./mb/addon_list.mb.html'))
        .replace('{{close-btn}}', util.getGoogleIcon('e5cd'))
        .replace('{{search}}', util.getGoogleIcon('e8b6'))
        .replace('{{add-btn}}', util.getGoogleIcon('e145')),
    mobileShowtype: dialog.SHOW_TYPE_FULLSCREEN,
    class: "addon-dialog"
});

var addon_dialog_d = addon_dialog.getDialogDom();
util.query(addon_dialog_d, '.closeBtn').addEventListener('click', () => {
    addon_dialog.close();
});

module.exports={
    addon_dialog,
    addon_dialog_d
}

