let { initsto, doevent, on, off,pushLink,writeLink,limitURL } = require('./_core');
let util = require('../util');
const { confirm } = require('../dialog/dialog_utils');
console.warn('浏览器不支持indexedDB，将在限制模式下使用');

initsto.set('storage-mode', 'localstorage');
// 初始化默认分组
if (!initsto.get('links')) {
  initsto.set('links', [])
}

// 初始化分组
if (!initsto.get('cate')) {
  initsto.set('cate', {});
  initsto.set('catelist', []);
} else {
  if (!initsto.get('catelist')) {
    initsto.set('catelist', Object.keys(initsto.get('cate')));
  }
}


module.exports = {
  setAll(link, cate, cb) {
    if (Array.isArray(link) && typeof cate == 'object') {
      initsto.set('links', link)
      initsto.set('cate', cate);
      initsto.set('catelist', Object.keys(cate));
      cb && cb();
      doevent('change', {
        type: "all",
        links: link,
        cate: cate
      })
    }
  },
  addLink(detail, callback) {
    if (!util.checkDetailsCorrect(detail, ['title', 'url'])) {
      throw '参数不正确';
    }
    var lm = limitURL(detail);
    if (lm) {
      callback && callback({
        code: -3,
        msg: "受限模式下，" + lm + "长度过长",
        lm: lm
      });
      return;
    }
    if (detail.cate) {
      // 包含分类 
      var c = initsto.get('cate');
      if (!c[detail.cate]) {
        callback && callback({
          code: -1,
          msg: "分组不存在"
        })
      } else {
        if (c[detail.cate].length > 100) {
          callback && callback({
            code: -4,
            msg: "受限模式下，分组下已超过100条链接，无法添加"
          })
          return;
        }
        c[detail.cate] = pushLink(detail, c[detail.cate]);
        initsto.set('cate', c);
        callback && callback({
          code: 0,
          msg: "添加成功"
        });
        doevent('change', {
          cate: detail.cate,
          type: 'add',
          detail: detail
        });
      }
    } else {
      // 不包含分类，即为默认分组

      var l = initsto.get('links');
      if (l.length > 100) {
        callback && callback({
          code: -4,
          msg: "受限模式下，分组下已超过100条链接，无法添加"
        })
        return;
      }
      l = pushLink(detail, l);
      initsto.set('links', l);
      callback && callback({
        code: 0,
        msg: "添加成功"
      });
      doevent('change', {
        cate: null,
        type: 'add',
        detail: detail
      });

    }
  },
  changeLink(cate, index, detail, callback, other = {}) {
    if (!util.checkDetailsCorrect(detail, ['title', 'url']) || typeof index != 'number') {
      throw '参数错误';
    }
    var lm = limitURL(detail);
    if (lm) {
      callback && callback({
        code: -3,
        msg: "受限模式下，" + lm + "长度过长",
        lm: lm
      });
      return;
    }
    if (cate) {
      // 包含分类
      var c = initsto.get('cate');
      if (!c[cate]) {
        callback && callback({
          code: -1,
          msg: "分组不存在"
        })
        return;
      }

      var r = writeLink(index, detail, c[cate]);
      if (!r) {
        callback && callback({
          code: -2,
          msg: "链接不存在"
        });
        return;
      }
      c[cate] = r;
      initsto.set('cate', c);
      callback && callback({
        code: 0,
        msg: "修改成功"
      });
      doevent('change', {
        cate: cate,
        index: index,
        type: 'change',
        detail: detail,
        other: other
      });
    } else {
      // 不包含分类
      var links = initsto.get('links');
      var r = writeLink(index, detail, links);
      if (!r) {
        callback && callback({
          code: -2,
          msg: "链接不存在"
        });
        return;
      }
      links = r;
      initsto.set('links', links);
      callback && callback({
        code: 0,
        msg: "修改成功"
      });
      doevent('change', {
        cate: null,
        index: index,
        type: 'change',
        detail: detail,
        other: other
      });
    }
  },
  deleteLink(cate, index, callback) {
    if (cate) {
      // 包含分类
      var c = initsto.get('cate');
      if (!c[cate]) {
        callback && callback({
          code: -1,
          msg: "分组不存在"
        });
        return;
      }
      if (!c[cate][index]) {
        callback && callback({
          code: -2,
          msg: "链接不存在"
        });
        return;
      }
      c[cate].splice(index, 1);
      initsto.set('cate', c);
      callback && callback({
        code: 0,
        msg: "删除成功"
      });
      doevent('change', {
        cate: cate,
        index: index,
        type: 'delete',
      });
    } else {
      // 不包含分类
      var r = initsto.get('links');
      if (!r[index]) {
        callback && callback({
          code: -2,
          msg: "链接不存在"
        });
        return;
      }
      r.splice(index, 1);
      initsto.set('links', r);
      callback && callback({
        code: 0,
        msg: "删除成功"
      });
      doevent('change', {
        cate: null,
        index: index,
        type: 'delete',
      });
    }
  },
  addCate(cate, callback) {
    var c = initsto.get('cate');
    if (c[cate]) {
      callback && callback({
        code: -1,
        msg: "分组已存在"
      });
      return;
    }
    if (Object.keys(c).length >= 20) {
      callback && callback({
        code: -2,
        msg: "受限模式下，分组数量不能超过20个"
      });
      return;
    }
    c[cate] = [];
    initsto.set('cate', c);
    callback && callback({
      code: 0,
      msg: "添加成功"
    });
    doevent('change', {
      cate: cate,
      type: 'cateadd',
    });
  },
  renameCate(cate, catename, callback) {
    var c = initsto.get('cate');
    if (!c[cate]) {
      callback && callback({
        code: -1,
        msg: "分组不存在"
      });
      return;
    }
    if (c[catename]) {
      callback && callback({
        code: -2,
        msg: "分组重名"
      });
    }
    c[catename] = c[cate];
    delete c[cate];
    initsto.set('cate', c);
    callback && callback({
      code: 0,
      msg: "修改成功"
    });
    doevent('change', {
      cate: cate,
      catename: catename,
      type: 'caterename',
    });
  },
  deleteCate(cate, callback) {
    var c = initsto.get('cate');
    if (!c[cate]) {
      callback && callback({
        code: -1,
        msg: "分组不存在"
      });
      return;
    }
    if (c[cate].length <= 0) {
      delete c[cate];
      initsto.set('cate', c);
      callback && callback({
        code: 0,
        msg: "删除成功"
      });
    } else {
      confirm('确定要删除分组吗？无法恢复！', r => {
        if (r) {
          delete c[cate];
          initsto.set('cate', c);
          callback && callback({
            code: 0,
            msg: "删除成功"
          });
          doevent('change', {
            cate: cate,
            type: 'catedelete',
          });
        } else {
          callback && callback({
            code: -2,
            msg: "用户取消删除"
          });
        }
      })
    }
  },
  getLinks(cate, callback) {
    if (cate) {
      var c = initsto.get('cate');
      if (!c[cate]) {
        callback && callback({
          code: -1,
          msg: "分组不存在"
        });
        return;
      }
      callback && callback({
        code: 0,
        msg: "获取成功",
        data: c[cate]
      });
    } else {
      var c = initsto.get('links');
      callback && callback({
        code: 0,
        msg: "获取成功",
        data: c
      });
    }
  },
  getCates(callback) {
    var c = initsto.get('catelist');
    callback && callback({
      code: 0,
      msg: "获取成功",
      data: c
    });
  },
  getCateAll(callback) {
    var c = initsto.get('cate');
    callback && callback({
      code: 0,
      msg: "获取成功",
      data: c
    });
  },
  ready(fn) {
    fn();
  },
  on, off
}