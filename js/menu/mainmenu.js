const menu = require(".");
const { icon } = require("../iconc");
const util = require("../util");

var mainmenu_icon = new icon({
  class: "main_menu",
  content: util.getGoogleIcon('e5d2'),
  offset: "tr"
});

var mainmenulist_top = [];
var mainmenulist_bottom = [];

var main_menu = new menu({
  list: [],
  offset: {
    top: 40,
    right: 15
  }
});

function glist() {
  main_menu.setList(mainmenulist_top.concat([{ type: "hr" }], mainmenulist_bottom));
}

mainmenu_icon.getIcon().onclick = e => {
  e.stopPropagation();
  main_menu.show();
}
var MAIN_MENU_TOP = 0;
var MAIN_MENU_BOTTOM = 1;

function pushMenu(a, b) {
  if (b == MAIN_MENU_BOTTOM) {
    mainmenulist_bottom.push(a);
  } else {
    mainmenulist_top.push(a);
  }
  glist();
}


module.exports = {
  pushMenu,
  MAIN_MENU_BOTTOM,
  MAIN_MENU_TOP
}