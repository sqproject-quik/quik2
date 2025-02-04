const util = require('../../util');
const { initsto } = require('../_core');
const link = require('../_link');
const { getMenuedCate, observeCate, dcate } = require('./cate');
const { linkF } = require('./init');
const { getMenuedLi, dsize, dstyle } = require('./link');

document.addEventListener('click', resetmenued)
document.addEventListener('contextmenu', resetmenued)

function resetmenued() {
    getMenuedCate() && getMenuedCate().classList.remove('menued');
    getMenuedLi() && getMenuedLi().classList.remove('menued');
}


function init() {
    linkF.innerHTML = require('../htmls/linkinit.html')
        .replace('{{cate-left}}', util.getGoogleIcon('e314'))
        .replace('{{cate-right}}', util.getGoogleIcon('e315'))
        .replace('{{cate-add}}', util.getGoogleIcon('e145'))
        .replace('{{mr}}', util.getGoogleIcon('e838', { type: 'fill' }))
    link.ready(() => {
        dcate(initsto.get('enabledCate'));
        dsize(initsto.get('linksize'));
        dstyle(initsto.get('linkstyle'));
        setTimeout(function () {
            linkF.style.opacity = 1;
        }, 300)
    })
    observeCate();
}

module.exports={
    resetmenued,
    init
}