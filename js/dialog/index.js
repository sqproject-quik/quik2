const util = require("../util");

var allDialog = [], d_index = 1, idmax = 0;

/**
 * @class dialog
 * @param {Object} options 
 * @param {String} options.content
 * @param {String} options.clickOtherToClose
 * @param {Number} options.mobileShowtype?
 * @param {String} options.class?
 */
var dialog = function (options) {
  this.options = options;
  var dialogF = util.element('div', {
    class: "dialog",
  });
  dialogF.innerHTML = `<div class="d-b"></div><div class="d-c">${options.content}</div>`;
  util.query(document, '.dialogs').append(dialogF);
  var dialogC = util.query(dialogF, '.d-c');
  if (options.class) {
    dialogC.className += ' ' + options.class;
  }
  if (options.mobileShowtype == 1) {
    dialogF.classList.add('mobile-show-full');
  }
  this.element = dialogF;
  this.id = idmax;
  idmax++;
  dialogF.setAttribute('data-id', this.id);
  if (typeof options.clickOtherToClose == 'undefined') {
    this.clickOtherToClose = true;
  } else {
    this.clickOtherToClose = options.clickOtherToClose;
  }
  if (this.clickOtherToClose) {
    dialogF.querySelector('.d-b').addEventListener('click', function () {
      getDialogById(this.parentElement.getAttribute('data-id')).close();
    })
  }

  allDialog.push(this);
}

function getDialogById(id) {
  var d = null;
  allDialog.forEach((dd) => {
    if (dd.id == id) {
      d = dd;
    }
  })
  return d;
}

dialog.SHOW_TYPE_FULLSCREEN = 1;
dialog.SHOW_TYPE_DIALOG = 2;

dialog.iframeDialogBuilder = function (url, mobileShowtype = 1) {
  var d = new dialog({
    content: `<div class="material-symbols-outlined closebtn">&#xE5CD;</div><iframe src="${url}" class="dialog-iframe"></iframe>`,
    class: "iframe-dialog",
    mobileShowtype: mobileShowtype
  });
  var q = d.getDialogDom();
  util.query(q, '.closebtn').onclick = () => {
    d.close();
  }
  this.closed = true;
  return d;
}
dialog.getDialogById = getDialogById;

dialog.prototype = {
  open() {
    this.element.classList.add('show');
    this.element.style.zIndex = d_index;
    d_index++;
    this.closed = false;
    if (this.onopen) {
      this.onopen();
    }
    util.query(this.element, 'img[data-src]', true).forEach(function (lazyimg) {
      lazyimg.src = lazyimg.getAttribute('data-src');
      lazyimg.removeAttribute('data-src');
    })
  },
  close() {
    this.element.classList.remove('show');
    this.closed = true;
    if (this.onclose) {
      this.onopen();
    }
  },
  destroy() {
    this.element.remove();
    allDialog.splice(allDialog.indexOf(this), 1);
  },
  getDialogDom() {
    return util.query(this.element, '.d-c');
  }
}
module.exports= dialog;