let {storage}=require('../storage');
var link;
if (storage.checkIDB()) {
    // 支持数据库
    link = require('./_db.js');
} else {
    // 不支持数据库，使用localStorage
    link = require('./_localstorage.js');
}
module.exports = link;