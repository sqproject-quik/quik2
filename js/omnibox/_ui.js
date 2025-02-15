const { SettingItem } = require("../setting");
const util = require("../util");
const { initsto, getSA, enter, searchUtil, getType, sg, doevent } = require("./_core");
const {Onshow}=require('../base');

var searchbox, searchcover, icon, input, submit, saul, searchpadding, inputInputEv;
searchpadding = util.element('div', {
  class: "searchpadding"
})

util.query(document, 'main .center').append(searchpadding);

function initSearchBox() {

  searchbox = util.element('div', {
    class: "searchbox"
  });

  searchcover = util.element('div', {
    class: "cover searchcover"
  })

  searchbox.innerHTML = require('./htmls/searchbox.html').replace('{i}', initsto.get('ob_autofocus') ? 'autofocus' : '');

  util.query(document, 'main').append(searchbox);
  util.query(document, 'main').append(searchcover);

  icon = util.query(searchbox, 'div.icon');
  input = util.query(searchbox, 'div.input input');
  submit = util.query(searchbox, 'div.submit');
  saul = util.query(searchbox, 'ul.sas');

  if (initsto.get('ob_justsearch')) {
    input.placeholder = '搜索'
  }

  /* 集中处理input事件 */
  inputInputEv = function () {
    console.log('input');
    // 渲染Type
    chulitype(this.value.trim());
    saul.innerHTML = '';
    getSA(this.value.trim(), function (salist) {
      //记录用户原本的active
      var actli = util.query(saul, 'li.active')
      if (actli) {
        actli = {
          icon: util.query(actli, 'div.saicon').innerHTML,
          text: util.query(actli, 'div.sa_text').innerText,
        }
      }

      // 渲染搜索联想
      saul.innerHTML = '';
      salist.forEach(s => {
        var li = util.element('li');
        li.innerHTML = `<div class="saicon">${s.icon}</div><div class="sa_text"></div>`;
        li.querySelector('.sa_text').innerText = s.text;
        saul.append(li);
        li.onclick = () => {
          s.click()
          console.log('clicked')
        };
      });

      // 恢复用户原本的active
      if (actli) {
        util.query(saul, 'li', true).forEach(li => {
          if (util.query(li, 'div.saicon').innerHTML && util.query(li, 'div.sa_text').innerHTML == actli.text) {
            li.classList.add('active');
          }
        })
      }
    });
    doevent('input', [input.value]);
  }
  input.oninput = util.fangdou(inputInputEv, 300);
  /* * */

  /* 集中处理keydown事件 */
  input.onkeydown = function (e) {
    if (e.key == 'Enter') {
      var actli = util.query(saul, 'li.active')
      if (actli) {
        // 当有li为ACTIVE状态时执行li.click事件
        actli.click();
      } else {
        // 否则交给core处理Enter事件
        enter(this.value);
      }
    } else if (e.key == 'ArrowUp') {
      e.preventDefault();
      // 上一个搜索联想
      var actli = util.query(saul, 'li.active')
      if (actli) {
        actli.classList.remove('active');
        if (actli.previousElementSibling) {
          actli.previousElementSibling.classList.add('active');
        }
      }
    } else if (e.key == 'ArrowDown') {
      e.preventDefault();
      // 下一个搜索联想
      var actli = util.query(saul, 'li.active')
      if (actli) {
        if (actli.nextElementSibling) {
          actli.classList.remove('active');
          actli.nextElementSibling.classList.add('active');
        }
      } else {
        util.query(saul, 'li').classList.add('active');
      }
    } else if (e.key == 'ArrowRight') {
      var actli = util.query(saul, 'li.active');
      if (actli) {
        input.value = util.query(actli, '.sa_text').innerText;
        inputInputEv.call(this);
      }
    } else if (e.key == 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        if (util.query(sct, 'li.active').previousElementSibling) {
          util.query(sct, 'li.active').previousElementSibling.click();
        } else {
          var lis = util.query(sct, 'li', true);
          lis[lis.length - 2].click();
        }
      } else {
        if (!util.query(sct, 'li.active').nextElementSibling.classList.contains('add')) {
          util.query(sct, 'li.active').nextElementSibling.click();
        } else {
          util.query(sct, 'li').click();
        }
      }

    }
  }

  var blurtimeout;
  // ...
  input.addEventListener('focus', _focus);
  function _focus() {
    clearTimeout(blurtimeout)
    searchcover.classList.add('active');
    searchbox.classList.add('active');
    doevent('focus', [input]);
  }
  // ...
  input.addEventListener('blur', function () {
    this.classList.remove('active');
    blurtimeout = setTimeout(() => {
      if (hasmousedown) {
        mouseupf = function () {
          setTimeout(() => {
            searchcover.classList.remove('active');
            searchbox.classList.remove('active');
          }, 10)
        }
      } else {
        searchcover.classList.remove('active');
        searchbox.classList.remove('active');
      }
    })
    doevent('blur', [input]);
  });

  document.addEventListener('mousedown', _down);
  document.addEventListener('touchstart', _down);
  document.addEventListener('mouseup', _up);
  document.addEventListener('touchend', _up);
  var hasmousedown = false, mouseupf = function () { };
  function _down() {
    hasmousedown = true;
  }
  function _up() {
    hasmousedown = false;
    mouseupf();
    mouseupf = function () { }
  }

  // ...
  submit.onclick = function () {
    enter(input.value);
  }

  // 搜索引擎选择
  var sct = util.element('div', {
    class: 'searchtypeselector'
  })
  sct.innerHTML = '<ul></ul>'
  util.query(document, 'main .center').insertBefore(sct, searchpadding.nextElementSibling);
  function chuliSearchTypeSelector() {
    var ul = util.query(sct, 'ul');
    var nowset = searchUtil.getSearchTypeIndex();
    ul.innerHTML = '';
    var list = searchUtil.getSearchTypeList();
    for (var k in list) {
      var li = util.element('li');
      li.innerHTML = '<img/>';
      (function (li, k) {
        if (!list[k] && searchUtil.neizhi[k]) {
          list[k] = searchUtil.neizhi[k].link;
        }
        util.getFavicon(list[k], function (fav) {
          if (fav) {
            li.querySelector('img').src = fav;
          } else {
            li.querySelector('img').src = util.createIcon('s');
          }
        })
      })(li, k)

      li.setAttribute('data-type', k);
      ul.append(li);
      if (k == nowset) {
        li.classList.add('active');
      }
      li.onclick = function () {
        var actli = util.query(sct, 'ul li.active');
        actli && actli.classList.remove('active');
        this.classList.add('active');
        searchUtil.setSearchType(this.getAttribute('data-type'));
        sct.classList.remove('active');
      }
    }
    var li = util.element('li');
    li.classList.add('add')
    li.innerHTML = util.getGoogleIcon('e145');
    ul.append(li);
    li.onclick = function () {
      quik.searchEditor.open();
    }
    sct.style.width = util.query(ul, 'li', true).length * 36 - 6 + 'px';
  }
  icon.addEventListener('click', function () {
    // 避免link遮挡底部
    if (sct.classList.contains('active')) {
      sct.classList.remove('active');
      document.querySelector('main .links').classList.remove('duan');
    } else {
      sct.classList.add('active');
      document.querySelector('main .links').classList.add('duan');
    }
  })


  searchUtil.on('nowtypechange', function () {
    if (icon.getAttribute('data-teshu') == ':searchtype') {
      chulitype(input.value, true);
    }
  })
  searchUtil.on('typelistchange', function () {
    chuliSearchTypeSelector();
  })
  chuliSearchTypeSelector();

  // 初始化处理（默认是搜索模式）
  chulitype('');
  gshowb();
  if (initsto.get('ob_autofocus')) {
    // @note 这样才能生效，也许是因为浏览器还没渲染好吧
    // @edit at 2024年1月30日 15点10分
    Onshow(() => {
      setTimeout(() => {
        input.focus();
        _focus();
      }, 100)
    })
  }

  if(initsto.get('ob_alignlink')){
    searchbox.classList.add('alignlink');
  }

}


/**
 * 渲染指定文字的Type至页面
 * @param {String} text 
 */
function chulitype(text, isMust) {
  var i = getType(text);
  if (i.icon[0] == ':') {
    if ((!isMust) && icon.getAttribute('data-teshu') == i.icon) return;
    icon.setAttribute('data-teshu', i.icon);
    var _ts = chuliteshuicon(i.icon);
    if (_ts instanceof Promise) {
      _ts.then(function (r) {
        icon.innerHTML = r;
      })
    } else {
      icon.innerHTML = _ts;
    }
  } else {
    icon.innerHTML = i.icon;
    icon.removeAttribute('data-teshu');
  }
  if (i.submit[0] == ':') {
    submit.setAttribute('data-teshu', i.submit);
    submit.innerHTML = chuliteshusubmit(i.submit);
  } else {
    submit.innerHTML = i.submit;
    submit.removeAttribute('data-teshu');
  }


}

/**
 * 渲染特殊Icon
 * @param {String} text 
 * @returns {String} iconhtmlstr
 */
function chuliteshuicon(icon) {
  if (icon == ':searchtype') {
    return new Promise(function (r, j) {
      util.getFavicon(searchUtil.getSearchType(), function (fav) {
        if (fav) {
          r('<img src="' + fav + '" style="border-radius:50%;"/>');
        } else {
          r('<img src="' + util.createIcon('S') + '" style="border-radius:50%;"/>');
        }
      })
    });
  } else {
    return '';
  }
}

/**
 * 渲染特殊SubmitIcon
 * @param {String} text 
 * @returns {String} iconhtmlstr
 */
function chuliteshusubmit(submit) {
  // 因为还没有特殊SubmitIcon
  return "";
}

if (initsto.get('ob_autofocus') == undefined) {
  initsto.set('ob_autofocus', false);
}


var si = new SettingItem({
  title: "自动聚焦",
  index: 1,
  type: 'boolean',
  message: "打开页面自动聚焦搜索框",
  get() {
    return !!initsto.get('ob_autofocus');
  },
  callback(value) {
    initsto.set('ob_autofocus', value);
    return true;
  }
})
sg.addNewItem(si);

var si2 = new SettingItem({
  title: "聚焦时背景蒙版",
  index: 6,
  type: 'boolean',
  message: "关闭后聚焦搜索框时不再出现背景蒙版",
  get() {
    return !initsto.get('ob_notshowb');
  },
  callback(value) {
    initsto.set('ob_notshowb', !value);
    gshowb();
    return true;
  }
})
sg.addNewItem(si2);
var si3 = new SettingItem({
  title: "背景蒙版模糊",
  index: 7,
  type: 'boolean',
  message: "背景蒙版模糊（可能会影响性能）",
  get() {
    return initsto.get('ob_bblur');
  },
  callback(value) {
    initsto.set('ob_bblur', value);
    gshowb();
    return true;
  }
})
sg.addNewItem(si3);

var si4 = new SettingItem({
  title: "对齐链接部分",
  index: 8,
  type: 'boolean',
  message: "使搜索框长度对齐链接部分",
  get() {
    return initsto.get('ob_alignlink');
  },
  callback(value) {
    initsto.set('ob_alignlink', value);
    if(value){
      searchbox.classList.add('alignlink');
    }else{
      searchbox.classList.remove('alignlink');
    }
    return true;
  }
})
sg.addNewItem(si4);

function gshowb() {
  if (initsto.get('ob_notshowb')) {
    searchcover.classList.add('notshow');
    si3.hide();
  } else {
    searchcover.classList.remove('notshow');
    si3.show();
    if (initsto.get('ob_bblur')) {
      searchcover.classList.add('blur');
    } else {
      searchcover.classList.remove('blur');
    }
  }
}

function uiEnable(a) {
  if (a) {
    if (!searchbox) {
      initSearchBox();
    }
    searchbox.style.display = 'block';
    searchpadding.style.height = '';
    si.show();
    si2.show();
    si3.show();
  } else {
    if (searchbox) {
      searchbox.style.display = 'none';
    }
    searchpadding.style.height = '20px';
    si.hide();
    si2.hide();
    si3.hide();

  }
}
module.exports = {
  setValue(value) {
    input.value = value;
    input.focus();
    inputInputEv.call(input);
  },
  focus() {
    input.focus();
  },
  blur() {
    input.blur();
  },
  isblur() {
    return !input.classList.contains('active');
  },
  setAutoFocus(value) {
    initsto.set('ob_autofocus', value);
    si.reGet();
  },
  getInput() {
    return input;
  },
  uiEnable
}