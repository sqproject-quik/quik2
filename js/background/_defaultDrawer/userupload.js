const dialog = require("../../dialog");
const { storage } = require("../../storage");
const util = require("../../util");
const { initsto } = require("../core");

var iovuploader, iovuploaderf;
function drawIovUploader() {
  // 图片、视频上传器
  iovuploader = new dialog({
    content: require('../htmls/iovuploader.html'),
    class: "iovuploader",
  })
  // @note 将cancel按钮修改为div，防止表单submit到cancel
  // @edit at 2024/1/30 15:20

  // Dom
  iovuploaderf = iovuploader.getDialogDom();
  if (!storage.checkIDB()) {
    util.query(iovuploaderf, '.pddb').innerHTML += '<span style="color:red;font-size:12px;">您的浏览器版本过低，无法上传本地文件作背景</span>';
    util.query(iovuploaderf, '.pddb input').style.display = 'none';

  }
  // 取消
  util.query(iovuploaderf, '.cancel').onclick = e => {
    e.preventDefault();
    iovuploader.close();
  }
  // 提交
  util.query(iovuploaderf, 'form').onsubmit = e => {
    e.preventDefault();
    // 类型 image(图片) / video(视频)
    var type = util.query(iovuploaderf, '.uploadi').checked ? 'image' : 'video';
    // url?
    var url = util.query(iovuploaderf, 'input[type="url"]').value;
    // File?
    var file = util.query(iovuploaderf, 'input[type="file"]').files[0];
    // 先把背景设置对话框中的图片src重置
    seti('');
    if (file) {
      // File优先

      // 将内容写入idb
      initsto.set('upload', file, true, function () {
        iovuploader.close();
        getUserUploadUrl(function (r) {
          // 获取并设置背景设置对话框中的图片src
          seti(r);
        })
        setbg({
          type: "default",
          data: {
            type: "userbg"
          }
        })
      });

      // 设置存储
      initsto.set('userbg', {
        type: type,
        useidb: true
      })
    } else {
      initsto.set('userbg', {
        type: type,
        url: url
      })
      iovuploader.close();
      getUserUploadUrl(r => {
        // 获取并设置背景设置对话框中的图片src
        seti(r);
        setbg({
          type: "default",
          data: {
            type: "userbg"
          }
        })
      })
    }

    l&l();
  }

}
let l;

function setl(f){
  l=f;
}


function uploadIov(a) {
  if (!iovuploader) {
    drawIovUploader();
    setTimeout(() => {
      iovuploader.open();
    }, 10)
  } else {
    iovuploader.open();
  }

  if (a) {
    var j = initsto.get('userbg');
    if (j) {
      util.query(iovuploaderf, 'input[type="url"]').value = j.url ? j.url : '';
      if (j.type == 'image') {
        util.query(iovuploaderf, '.uploadi').checked = true;
      } else {
        util.query(iovuploaderf, '.uploadv').checked = true;
      }
    }
  }
}

// 获取用户上传图片、视频URL
function getUserUploadUrl(cb) {
  var a = initsto.get('userbg');
  // 没有上传，直接返回false
  if (!a) {
    cb(false);
    return;
  }

  if (a.type == 'video') {
    // 视频
    var b = a.useidb;
    if (b) {
      // 来自用户本地上传，从idb提取，获取视频快照返回
      initsto.get('upload', true, (blob) => {
        getVideoCaptrue(URL.createObjectURL(blob), function (c) {
          cb(c);
        });
      })
    } else {
      // 来自外站，尝试获取视频快照返回
      try {
        getVideoCaptrue(a.url, c => {
          cb(c);
        });
      } catch (e) {
        //失败（CORS|>400）
        cb(false);
      }
    }
  } else if (a.type == 'image') {
    var b = a.useidb;
    if (b) {
      // 来自用户本地上传，从idb提取返回
      initsto.get('upload', true, (blob) => {
        cb(URL.createObjectURL(blob));
      })
    } else {
      // 来自外站，直接返回
      cb(a.url);
    }
  }
}



//获取视频快照
function getVideoCaptrue(url, callback) {
  var video = document.createElement('video');
  video.src = url;
  video.crossOrigin = 'anonymous';

  video.onloadedmetadata = function () {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    video.currentTime = video.duration / 4;

    video.oncanplay = function () {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/png'));
      this.remove();
    };
  };
}

function hasUploadedImg() {
  return !!initsto.get('userbg');
}

function setbg(r){
  _sbfn.forEach(f=>f(r));
}
var _sbfn=[];
function _listensetbg(fn){
  _sbfn.push(fn);
}

function seti(r){
  _sbfn2.forEach(f=>f(r));
}
var _sbfn2=[];
function _listenseti(fn){
  _sbfn2.push(fn);
}
module.exports = {
  hasUploadedImg,
  getUserUploadUrl,
  getVideoCaptrue,
  uploadIov,
  _listensetbg,
  _listenseti,
  setl
}
