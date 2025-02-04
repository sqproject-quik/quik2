const dialog = require("../dialog");

function Setting(details) {
  this.title = details.title;
  this.ifo = false;
  this.groups = [];
  this._events = {
    change: []
  }
}

Setting.prototype = {
  drawAll() {
    if (this.ifo) return;
    this.ifo = true;
    this.dialog = new dialog({
      content: `<div class="actionbar"><h1>设置</h1><div class="closeBtn">${util.getGoogleIcon('e5cd')}</div></div><ul class="setting-root"></ul>`,
      class: "setting_dia auto-size",
      mobileShowtype: dialog.SHOW_TYPE_FULLSCREEN
    });
    this.dialogDom = this.dialog.getDialogDom();
    util.query(this.dialogDom, '.closeBtn').addEventListener('click', () => {
      this.dialog.close();
    });
    util.query(this.dialogDom, '.actionbar h1').innerText = this.title;
    var _ = this;
    this.groups.forEach(group => {
      _._drawGroup(group);
    })
  },
  addNewGroup(group) {
    this.groups.push(group);
    var _ = this;
    group.on('change', (dt, _this) => {
      _._dochange({
        type: dt.type,
        details: dt.details,
        id: dt.id
      })
      if (dt.type == 'it') {
        _._dochangeGroup(_this, dt.details);
      } else if (dt.type == 'add') {
        _._drawItem(_this, _this.items[_this.items.length - 1])
      } else if (dt.type == 'change') {
        if (dt.details.attr == 'reinit') {
          _._reinitItem(_this, _this.items.find(item => item.id == dt.id), dt.details);
        } else if (dt.details.attr == 'reget') {
          _._regetItem(_this.items.find(item => item.id == dt.id), dt.details);
        } else {
          _._dochangeItem(_this, _this.items.find(item => item.id == dt.id), dt.details);
        }
      }
    })
    _._dochange({
      type: "addgroup",
    })
    _._drawGroup(group);
  },
  setTitle(title) {
    this.title = title;
    if (this.ifo) {
      util.query(this.dialogDom, '.actionbar h1').innerText = title;
    }
    _._dochange({
      type: "changetitle",
      title: title
    })
  },
  open() {
    var _ = this;
    if (!_.ifo) {
      _.drawAll();
      setTimeout(() => {
        _.dialog.open();
      }, 10);
    } else {
      _.dialog.open();
    }
  },
  close() {
    this.dialog.close();
  },
  on(event, callback) {
    if (this._events[event]) {
      this._events[event].push(callback);
    }
  },
  _dochange(dt) {
    var _ = this;
    this._events.change.forEach((callback) => {
      callback(dt, _);
    });
  },
  _drawGroup(group) {
    if (!this.ifo) return;
    var _ = this;
    var groupEle = util.element('li', {
      class: 'setting-group',
      'data-index': group.index,
      'data-id': group.id
    });
    groupEle.innerHTML = `<div class="setting-group-title"></div><ul class="setting-tree"></ul>`;
    var sr = util.query(this.dialogDom, '.setting-root');
    var srls = sr.children;
    var q = true;
    for (var i = 0; i < srls.length; i++) {
      if (parseInt(srls[i].getAttribute('data-index')) > group.index) {
        sr.insertBefore(groupEle, srls[i]);
        q = false;
        break;
      }
    }
    if (q) sr.appendChild(groupEle);
    util.query(groupEle, '.setting-group-title').innerText = group.title;
    group.items.forEach((item) => {
      _._drawItem(group, item);
    })
  },
  _drawItem(group, item) {
    if (!this.ifo) return;
    var itemEle = util.element('li', {
      class: 'setting-item',
      'data-index': item.index,
      'data-id': item.id
    });
    if (!item._show) {
      itemEle.style.display = 'none';
    }
    itemEle.innerHTML = `<div class="setting-item-left"><div class="setting-item-title"></div><div class="setting-item-message"></div></div><div class="setting-item-right"></div>`;
    var sr = util.query(this.dialogDom, '.setting-group[data-id=' + group.id + '] .setting-tree');
    var srls = sr.children;
    var q = true;
    for (var i = 0; i < srls.length; i++) {
      if (parseInt(srls[i].getAttribute('data-index')) > item.index) {
        sr.insertBefore(itemEle, srls[i]);
        q = false;
        break;
      }
    }
    if (q) sr.appendChild(itemEle);
    util.query(itemEle, '.setting-item-title').innerText = item.title;
    if (item.message) {
      util.query(itemEle, '.setting-item-message').innerText = item.message;
    } else {
      itemEle.classList.add('no-message');
    }
    var elr = util.query(itemEle, '.setting-item-right');
    var cb = () => { };
    var types = {
      string() {
        elr.innerHTML = `<input type="text" class="setting-item-input">`;
        cb = (v) => {
          util.query(elr, '.setting-item-input').value = v;
        }
      },
      number() {
        elr.innerHTML = `<input type="number" class="setting-item-input">`;
        cb = (v) => {
          util.query(elr, '.setting-item-input').value = v;
        }
      },
      boolean() {
        elr.innerHTML = `<div class="check-box"><div class="check-box-inner"></div></div><input type="checkbox" class="setting-item-input">`;
        cb = (v) => {
          util.query(elr, '.setting-item-input').checked = v;
          if (v) {
            util.query(elr, '.check-box').classList.add('checked');
          } else {
            util.query(elr, '.check-box').classList.remove('checked');
          }
        }
        util.query(elr, '.check-box').addEventListener('click', function () {
          util.query(elr, '.setting-item-input').click();
          console.log(util.query(elr, '.setting-item-input').checked);
          if (util.query(elr, '.setting-item-input').checked) {
            this.classList.add('checked');
          } else {
            this.classList.remove('checked');
          }
        })
      },
      range() {
        elr.innerHTML = `<input type="range" class="setting-item-input">`;
        cb = (v) => {
          util.query(elr, '.setting-item-input').value = v;
        }
        var l = item.init()
        if (l instanceof Promise) {
          l.then(_init)
        } else {
          _init(l);
        }
        function _init(inited) {
          util.query(elr, '.setting-item-input').max = inited[1];
          util.query(elr, '.setting-item-input').min = inited[0];
        }
      },
      select() {
        elr.innerHTML = `<input class="setting-item-input" type="text" style="display:none"></input><div class="qui-select"></div><div class="qui-options"></div>`;
        util.query(elr, '.qui-select').onclick = function (e) {
          e.stopPropagation();
          var acted = util.query(document, '.qui-options.active');
          if (acted) {
            acted.classList.remove('active');
          }
          util.query(elr, '.qui-options').classList.add('active');
        }
        var guaqi;
        cb = (v) => {
          guaqi = v;
        }
        var l = item.init()
        if (l instanceof Promise) {
          l.then(_init)
        } else {
          _init(l);
        }
        function _init(inited) {
          initSelect(elr, inited, item);
          cb = (v) => {
            util.query(elr, '.setting-item-input').value = v;
            util.query(elr, '.qui-select').innerText = inited[v];
            var acted = util.query(elr, '.qui-options .qui-option.selected');
            if (acted) {
              acted.classList.remove('selected');
            }
            try {
              util.query(elr, '.qui-options .qui-option[data-value="' + v + '"]').classList.add('selected');
            } catch (error) {
              util.query(elr, '.qui-select').innerText = '';
            }
          }
          if (guaqi) cb(guaqi);
        }
      },
      'null'() {
        elr.innerHTML = `<div class="setting-item-input null-click">${util.getGoogleIcon('e5e1')}</div>`;
        itemEle.classList.add('just-callback-item');
        itemEle.onclick = () => {
          item.callback();
        }
      }
    }
    types[item.type]();
    function getacb() {
      if (item.type == 'null') return;
      var l = item.get();
      if (l instanceof Promise) {
        l.then(cb);
      } else {
        cb(l);
      }
    }
    getacb();
    item.getacb = getacb;
    util.query(elr, '.setting-item-input').addEventListener((() => {
      if (item.type == 'range') {
        return 'input'
      } else if (item.type == 'null') {
        return 'click'
      } else {
        return 'change'
      }
    })(), function () {
      doCallback.call(this, item);
    });
  },
  _dochangeGroup(group, dt) {
    if (!this.ifo) return;
    var g = util.query(this.dialogDom, '.setting-group[data-id=' + group.id + ']');
    if (dt.attr == 'title') {
      util.query(g, '.setting-group-title').innerText = dt.content;
    } else if (dt.attr == 'index') {
      g.setAttribute('data-index', dt.content);
      var sr = util.query(this.dialogDom, '.setting-root');
      var srls = sr.children;
      var q = true;
      for (var i = 0; i < srls.length; i++) {
        if (srls[i].isSameNode(g)) continue;
        if (parseInt(srls[i].getAttribute('data-index')) > dt.content) {
          sr.insertBefore(g, srls[i]);
          q = false
          break;
        }
      }
      if (q) sr.appendChild(g);
    } else if (dt.attr == 'show') {
      g.style.display = dt.content ? 'block' : 'none';
    }
  },
  _dochangeItem(group, item, dt) {
    if (!this.ifo) return;
    var g = util.query(this.dialogDom, '.setting-group[data-id=' + group.id + '] .setting-item[data-id=' + item.id + ']');
    if (dt.attr == 'title') {
      util.query(g, '.setting-group-title').innerText = dt.content;
    } else if (dt.attr == 'message') {
      if (dt.content) {
        util.query(g, '.setting-item-message').innerText = dt.content;
        g.classList.remove('no-message');
      } else {
        g.classList.add('no-message');
      }
    } else if (dt.attr == 'index') {
      g.setAttribute('data-index', dt.content);
      var sr = util.query(this.dialogDom, '.setting-group[data-id=' + group.id + '] .setting-tree');
      var srls = sr.children;
      var q = true;
      for (var i = 0; i < srls.length; i++) {
        if (srls[i].isSameNode(g)) continue;
        if (parseInt(srls[i].getAttribute('data-index')) > dt.content) {
          sr.insertBefore(g, srls[i]);
          q = false
          break;
        }
      }
      if (q) sr.appendChild(g);
    } else if (dt.attr == 'show') {
      g.style.display = dt.content ? 'block' : 'none';
    }
  },
  _reinitItem(group, item) {
    if (!this.ifo) return;
    console.log(item);
    var _init;
    var itemEle = util.query(this.dialogDom, '.setting-group[data-id=' + group.id + '] .setting-item[data-id=' + item.id + ']');
    var elr = util.query(itemEle, '.setting-item-right')
    if (item.type == 'range') {
      _init = (inited) => {
        util.query(elr, '.setting-item-input').max = inited[1];
        util.query(elr, '.setting-item-input').min = inited[0];
      }
    } else if (item.type == 'select') {
      _init = (inited) => {
        initSelect(elr, inited, item);
        cb = (v) => {
          util.query(elr, '.setting-item-input').value = v;
          util.query(elr, '.qui-select').innerText = inited[v];
          var acted = util.query(elr, '.qui-options .qui-option.selected');
          if (acted) {
            acted.classList.remove('selected');
          }
          try {
            util.query(elr, '.qui-options .qui-option[data-value="' + v + '"]').classList.add('selected');
          } catch (error) {

          }
        }
        var l = item.get();
        if (l instanceof Promise) {
          l.then(cb);
        } else {
          cb(l);
        }
      }
    } else {
      return;
    }
    var l = item.init()
    if (l instanceof Promise) {
      l.then(_init)
    } else {
      _init(l);
    }
  },
  _regetItem(item) {
    if (!this.ifo) return;
    item.getacb();
  }
}

document.addEventListener('click', () => {
  var acted = util.query(document, '.qui-options.active');
  if (acted) {
    acted.classList.remove('active');
  }
})


function initSelect(elr, inited, item) {
  util.query(elr, '.qui-options').innerHTML = (() => {
    var html = '';
    for (var k in inited) {
      html += `<div class="qui-option" data-value="${k}">${inited[k]}</div>`;
    }
    return html;
  })();
  util.query(elr, '.qui-options .qui-option', true).forEach((op) => {
    op.onclick = () => {
      var v = op.getAttribute('data-value');
      util.query(elr, '.setting-item-input').value = v;
      util.query(elr, '.qui-select').innerText = inited[v];
      var acted = util.query(elr, '.qui-options .qui-option.selected');
      if (acted) {
        acted.classList.remove('selected');
      }
      op.classList.add('selected');
      doCallback.call(util.query(elr, '.setting-item-input'), item);
    }

  })
}

function doCallback(item) {
  if (this.classList.contains('null-click')) return;
  var v;
  if (this.type == 'checkbox') {
    v = this.checked;
  } else {
    v = this.value;
  }
  //@note 判断check方法是否存在，check是可选参数
  //@edit at 2023/1/30 15:12
  if (typeof item.check == 'function') {
    if (item.check(v)) {
      item.callback(v)
    } else {
      item.getacb();
    }
  } else {
    item.callback(v);
  }

}
module.exports = Setting;