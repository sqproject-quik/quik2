const { getShowFns } = require('./js/base.js');
require('./js/requirein.js');
var { waitdotheme }= require('./js/custom/index.js');
var { cateWidthShiPei } = require('./js/link/index.js');


if (localStorage.__quik_egg__) {
  delete localStorage.__quik_egg__;
  window.eggnow__ = true;
  clearTimeout(loadingtimeout);
  document.querySelector(".loading-f").style.display = 'block';
} else {
  waitdotheme(() => {
    showmain();
  });
  setTimeout(() => {
    showmain();
  }, 500);
}

var isshowmain = false;
function showmain() {
  if (isshowmain) return;
  clearTimeout(loadingtimeout);
  document.querySelector(".loading-f").classList.add('h');
  document.querySelector(".loading-f").style.display = 'none';
  document.querySelector("main").style.display = 'block';
  document.querySelector("main").style.opacity = '1';
  getShowFns().forEach(f => f());
  cateWidthShiPei();
  isshowmain = true;
  setTimeout(() => {
    document.querySelector("main").classList.add('sicon');
  }, 360)
}



var f = `@font-face {
    font-family: 'Material Symbols Outlined';
    font-style: normal;
    font-weight: 100 700;
    src: url($0) format('woff2');
  }`
if (window.isExt) {
  util.addStyle(f.replace('$0', 'chrome-extension://' + window.extid + '/assets/google-icon.woff2'))
} else {
  util.addStyle(f.replace('$0', 'https://fonts.gstatic.com/s/materialsymbolsoutlined/v213/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2'))
}