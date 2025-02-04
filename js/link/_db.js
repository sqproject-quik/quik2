let { initsto, doevent, on, off,writeLink,pushLink } = require('./_core');
let util = require('../util');
const { confirm } = require('../dialog/dialog_utils');
initsto.set('storage-mode', 'db');

var defLinks = [{
  title: "百度翻译",
  url: "https://fanyi.baidu.com/"
}, {
  title: "哔哩哔哩",
  url: "https://www.bilibili.com/"
}, {
  title: "知乎",
  url: "https://www.zhihu.com/"
}, {
  title: "网易云音乐",
  url: "https://music.163.com/"
}, {
  title: "Github",
  url: "https://github.com/"
}];

// 初始化进度，2为初始化完毕
var initState = 0, readySatae = 3;
var readyfn = [];
function init() {
  // 初始化默认分组
  if (!initsto.get('links')) {
    initsto.set('links', defLinks, true, () => {
      initState++;
      if (initState == readySatae) {
        readyfn.forEach(a => a());
      }
    })
  } else {
    initState++;
    if (initState == readySatae) {
      readyfn.forEach(a => a());
    }
  }

  // 初始化分组
  if (!initsto.get('cate')) {
    initsto.set('cate', {}, true, () => {
      initState++;
      initsto.set('catelist', []);
      initState++;
      if (initState == readySatae) {
        readyfn.forEach(a => a());
      }
    });
  } else {
    initState++;
    if (!initsto.get('catelist')) {
      initsto.get('cate', true, cates => {
        initsto.set('catelist', Object.keys(cates));
        initState++;
        if (initState == readySatae) {
          readyfn.forEach(a => a());
        }
      })
    } else {
      initState++
      if (initState == readySatae) {
        readyfn.forEach(a => a());
      }
    }
  }
}

init();
if (initState == readySatae) {
  readyfn.forEach(a => a());
}

module.exports = {
  setAll(link, cate, cb) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    if (Array.isArray(link) && typeof cate == 'object') {
      if (link) {
        initsto.set('links', link, true, () => {
          cb && cb('link');
          doevent('change', {
            type: "all",
            links: link
          })
        })
      }

      if (cate) {
        initsto.set('cate', cate, true, () => {
          initsto.set('catelist', Object.keys(cate));
          cb && cb('cate');
          doevent('change', {
            type: "all",
            cate: cate
          })
        })

      }

    }
  },
  addLink(detail, callback) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    if (!util.checkDetailsCorrect(detail, ['title', 'url'])) {
      throw '参数不正确';
    }
    if (detail.cate) {
      // 包含分类 
      initsto.get('cate', true, c => {
        if (!c[detail.cate]) {
          callback && callback({
            code: -1,
            msg: "分组不存在"
          })
        } else {
          c[detail.cate] = pushLink(detail, c[detail.cate]);
          initsto.set('cate', c, true, () => {
            callback && callback({
              code: 0,
              msg: "添加成功"
            });
            doevent('change', {
              cate: detail.cate,
              type: 'add',
              detail: detail
            });
          });
        }
      })
    } else {
      // 不包含分类，即为默认分组

      initsto.get('links', true, l => {
        l = pushLink(detail, l);
        initsto.set('links', l, true, () => {
          callback && callback({
            code: 0,
            msg: "添加成功"
          });
          doevent('change', {
            cate: null,
            type: 'add',
            detail: detail
          });
        });
      })
    }
  },
  changeLink(cate, index, detail, callback, other = {}) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    if (!util.checkDetailsCorrect(detail, ['title', 'url']) || typeof index != 'number') {
      throw '参数错误';
    }
    if (cate) {
      // 包含分类
      initsto.get('cate', true, c => {
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
        initsto.set('cate', c, true, () => {
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
        })
      })
    } else {
      // 不包含分类
      initsto.get('links', true, links => {
        var r = writeLink(index, detail, links);
        if (!r) {
          callback && callback({
            code: -2,
            msg: "链接不存在"
          });
          return;
        }
        links = r;
        initsto.set('links', links, true, () => {
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
        });
      });
    }
  },
  deleteLink(cate, index, callback) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    if (cate) {
      // 包含分类
      initsto.get('cate', true, c => {
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
        initsto.set('cate', c, true, () => {
          callback && callback({
            code: 0,
            msg: "删除成功"
          });
          doevent('change', {
            cate: cate,
            index: index,
            type: 'delete',
          });
        });
      });
    } else {
      // 不包含分类
      initsto.get('links', true, r => {
        if (!r[index]) {
          callback && callback({
            code: -2,
            msg: "链接不存在"
          });
          return;
        }
        r.splice(index, 1);
        initsto.set('links', r, true, () => {
          callback && callback({
            code: 0,
            msg: "删除成功"
          });
          doevent('change', {
            cate: null,
            index: index,
            type: 'delete',
          });
        });
      });
    }
  },
  addCate(cate, callback, index) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    initsto.get('cate', true, c => {
      if (c[cate]) {
        callback && callback({
          code: -1,
          msg: "分组已存在"
        });
        return;
      }
      c[cate] = [];
      initsto.set('cate', c, true, () => {
        var o = initsto.get('catelist');
        if (typeof index == 'undefined') {
          o.splice(index, 0, cate);
        } else {
          o.push(cate);
        }
        initsto.set('catelist', o);
        callback && callback({
          code: 0,
          msg: "添加成功"
        });
        doevent('change', {
          cate: cate,
          type: 'cateadd',
        });
      });
    });
  },
  renameCate(cate, catename, callback, index) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    var o = initsto.get('catelist');
    if (o.indexOf(cate) < 0) {
      callback && callback({
        code: -1,
        msg: "分组不存在"
      });
      return;
    }
    if (cate == catename) {
      o.splice(o.indexOf(cate), 1);
      o.splice(index, 0, cate);
      initsto.set('catelist', o);
      callback && callback({
        code: 0,
        msg: "修改成功"
      });
      doevent('change', {
        cate: cate,
        catename: catename,
        type: 'caterename',
      });
      return;
    }
    initsto.get('cate', true, c => {
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
      initsto.set('cate', c, true, () => {
        if (typeof index != 'number') {
          index = o.indexOf(cate);
        }
        o.splice(o.indexOf(cate), 1);
        o.splice(index, 0, catename);
        initsto.set('catelist', o);
        callback && callback({
          code: 0,
          msg: "修改成功"
        });
        doevent('change', {
          cate: cate,
          catename: catename,
          type: 'caterename',
        });
      });
    });
  },
  deleteCate(cate, callback) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    var o = initsto.get('catelist');
    if (o.indexOf(cate) < 0) {
      callback && callback({
        code: -1,
        msg: "分组不存在"
      });
      return;
    } else {
      o.splice(o.indexOf(cate), 1);
      initsto.set('catelist', o);
    }
    initsto.get('cate', true, c => {

      if (!c[cate]) {
        callback && callback({
          code: -1,
          msg: "分组不存在"
        });
        return;
      }
      if (c[cate].length <= 0) {
        delete c[cate];
        initsto.set('cate', c, true, () => {
          callback && callback({
            code: 0,
            msg: "删除成功"
          });
          doevent('change', {
            cate: cate,
            type: 'catedelete',
          });
        });
      } else {
        confirm('确定要删除分组吗？无法恢复！', r => {
          if (r) {
            delete c[cate];
            initsto.set('cate', c, true, () => {
              callback && callback({
                code: 0,
                msg: "删除成功"
              });
              doevent('change', {
                cate: cate,
                type: 'catedelete',
              });
            });
          } else {
            callback && callback({
              code: -2,
              msg: "用户取消删除"
            });
          }
        })
      }

    });
  },
  getLinks(cate, callback) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    if (cate) {
      initsto.get('cate', true, c => {
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
      });
    } else {
      initsto.get('links', true, c => {
        callback && callback({
          code: 0,
          msg: "获取成功",
          data: c
        });
      });
    }
  },
  getCates(callback) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }

    callback && callback({
      code: 0,
      msg: "获取成功",
      data: initsto.get('catelist')
    });
  },
  getCateAll(callback) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    initsto.get('cate', true, c => {
      callback && callback({
        code: 0,
        msg: "获取成功",
        data: c
      });
    });
  },
  ready(fn) {
    if (initState == readySatae) {
      fn();
    } else {
      readyfn.push(fn);
    }
  },
  on, off
}