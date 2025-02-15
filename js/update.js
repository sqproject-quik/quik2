const dialog = require("./dialog");
const { alert, confirm } = require("./dialog/dialog_utils");
const toast = require("./toast");
const util = require("./util");

window.version_code = '${VERSION_CODE}';
window.version = {
  version: '2.7.1',
  version_code: window.version_code,
  updateTime: '2025/2/15',
  log: [
    {
      tag: "new",
      content: "搜索框可以设置与链接部分对齐"
    },
    {
      tag: "new",
      content: "链接允许自定义图标（Beta）"
    }
  ]
}
if ('serviceWorker' in navigator && !window._dev) {
  navigator.serviceWorker.ready.then(registration => {
    window.swReg = registration;
    if (window.location.href.indexOf('://quik.42web.io/') != -1) {
      var ifr = util.element('iframe', {
        src: './version',
        style: "opacity:0"
      });
      document.body.appendChild(ifr);
      var i = 0;
      ifr.onload = function () {
        i++;
        if (i >= 2) {
          updateBySW(registration)
        }
      }
      setTimeout(() => {
        updateBySW(registration);
      }, 4000)
    } else {
      updateBySW(registration);
    }

  });
  function updateBySW(registration) {
    util.xhr('./version', r => {
      var nv = parseInt(r);
      if (nv > version_code) {
        if (window.isInframe && location.href.indexOf('://quik.42web.io/') != -1) {
          alert('检测到新版本，安全原因无法在扩展中更新，即将打开新页面更新。', function () {
            window.open('https://quik.42web.io/?update=1');
          })
        } else {
          toast.show('发现新版本(版本序号：' + nv + ')，正在更新');
          registration.active.postMessage('update');
        }
      }
    }, () => {
      console.log('获取版本失败');
    })
  }
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data == 'updated') {
      confirm('新版本已准备就绪，是否刷新页面', v => {
        if (v) {
          localStorage.setItem('__q__s__', '1');
          location.reload();
        }
      })
    }
  });
}
var version_dia = null;
function showVersion() {
  if (!version_dia) {
    version_dia = new dialog({
      content: `<h1>版本更新</h1><div class="version_item">
<div class="version_item_title">版本号：${window.version.version}</div>
<div class="version_item_update_time">发布时间：${window.version.updateTime}</div>
<div class="version_update">${formatVersion(window.version.log)}</div>
</div><div class="footer"><div class="btn ok">我知道了</div></div>`,
      class: "update_dialog"
    });
    util.query(version_dia.getDialogDom(), '.btn.ok').onclick = () => {
      version_dia.close();
    }
  }

  setTimeout(() => {
    version_dia.open();
  })
}
if (localStorage.getItem('__q__s__')) {
  showVersion();
  localStorage.removeItem('__q__s__');
}

function formatVersion(fv) {
  var str = '', gl = {
    "new": "新增",
    "del": "删除",
    "fix": "修复",
    "change": "修改",
    "thanks": "感谢"
  };
  for (var i = 0; i < fv.length; i++) {
    str += '<div class="update_item"><div class="update_item_tag ' + fv[i].tag + '"><div>' + gl[fv[i].tag] + '</div></div><div class="update_item_content">' + fv[i].content + '</div></div>'
  }
  return str;
}
