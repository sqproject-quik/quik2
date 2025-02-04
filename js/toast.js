const util = require("./util");

var to = util.element('div', {
  class: "toast"
})

var g = null, g2 = null;
util.query(document, 'body').append(to);
module.exports= {
  show(value, time) {
    to.innerHTML = value;
    to.classList.add('show');
    to.style.animation = "toastin .3s";
    clearTimeout(g);
    clearTimeout(g2);
    g = setTimeout(() => {
      to.style.animation = "toastout .3s";
      g2 = setTimeout(() => {
        to.classList.remove('show');
      }, 298);
    }, time ? time : 2000);
  }
}