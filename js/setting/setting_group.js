
var idmax = 0;
function SettingGroup(details) {
  this.title = details.title;
  this.index = details.index;
  if (this.index < 0) this.index = 0
  this.items = [];
  this.id = 'seg_' + idmax;
  idmax++;
  this._events = {
    change: []
  }
}

SettingGroup.prototype = {
  addNewItem(item) {
    this.items.push(item);
    var _ = this;
    item.on('change', (dt, _this) => {
      _._dochange({
        type: "change",
        details: dt,
        id: _this.id
      })
    });
    _._dochange({
      type: "add"
    })
  },
  setTitle(title) {
    this.title = title;
    this._dochange({
      type: "it",
      details: {
        attr: "title",
        content: title
      }
    })
  },
  setIndex(index) {
    this.index = index;
    this._dochange({
      type: "it",
      details: {
        attr: "index",
        content: index
      }
    })
  },
  on(event, callback) {
    if (this._events[event]) {
      this._events[event].push(callback);
    }
  },
  show() {
    this.show = true;
    this._dochange({
      type: "it",
      details: {
        attr: "show",
        content: true
      }
    })
  },
  hide() {
    this.show = false;
    this._dochange({
      type: "it",
      details: {
        attr: "show",
        content: false
      }
    })
  },
  _dochange(dt) {
    var _ = this;
    this._events.change.forEach((callback) => {
      callback(dt, _);
    });
  }
}
module.exports = SettingGroup;