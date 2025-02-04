
var idmax = 0;
function SettingItem(details) {
  this.title = details.title;
  this.index = details.index;
  this.type = details.type;
  this.init = details.init;
  this.check = details.check;
  this.callback = details.callback;
  this.message = details.message;
  this.get = details.get;
  this._show = true;
  this.id = 'sei_' + idmax;
  idmax++;
  this._events = {
    change: []
  }
}

SettingItem.prototype = {
  reInit() {
    this._dochange({
      attr: "reinit"
    })
  },
  reGet() {
    this._dochange({
      attr: "reget"
    })
  },
  setTitle(title) {
    this.title = title;
    this._dochange({
      attr: "title",
      content: title
    })
  },
  setIndex(index) {
    this.index = index;
    this._dochange({
      attr: "index",
      content: index
    })
  },
  setMessage(message) {
    this.message = message;
    this._dochange({
      attr: "message",
      content: message
    })
  },
  show() {
    this._show = true;
    this._dochange({
      attr: "show",
      content: true
    })
  },
  hide() {
    this._show = false;
    this._dochange({
      attr: "show",
      content: false
    })
  },
  on(event, callback) {
    if (this._events[event]) {
      this._events[event].push(callback);
    }
  },
  _dochange(dt) {
    var _ = this;
    this._events.change.forEach(function (callback) {
      callback(dt, _);
    });
  }
}
module.exports = SettingItem;