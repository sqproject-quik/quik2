const util = require("../util");

var icners = {
  tl: util.query(document, '.topper .left'),
  tr: util.query(document, '.topper .right'),
  bl: util.query(document, '.bottomer .left'),
  br: util.query(document, '.bottomer .right'),
}

/**
 * @class icon
 * @param {Object} options 
 * @param {String} options.content
 * @param {Boolean} options.important?
 * @param {String} options.class?
 * @param {Number} options.width?
 * @param {'tl'|'tr'|'bl'|'br'} options.offset
 */
var icon = function (options) {
  this.content = options.content;
  this.width = options.width;
  var ic = util.element('div', {
    class: "item" + (options.class ? (' ' + options.class) : '') + (options.important ? ' important' : ''),
  });
  icners[options.offset].append(ic);
  ic.innerHTML = this.content;
  this.element = ic;
  if (this.width) {
    ic.style.width = this.width + 'px';
  }
}
icon.prototype = {
  getIcon() {
    return this.element;
  },
  setIcon(content) {
    this.content = content;
    this.element.innerHTML = this.content;
  },
  setWidth(w) {
    this.width = w;
    if (this.width) {
      ic.style.width = this.width + 'px';
    }
  },
  getWidth() {
    return this.width;
  },
  show() {
    this.element.classList.remove('hide');
    this.element.classList.add('show');
  },
  hide() {
    this.element.classList.add('hide');
    this.element.classList.remove('show');
  }
}
module.exports.icon = icon;