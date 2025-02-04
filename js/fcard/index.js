const util = require("../util");

var fcF = util.element('div', {
    class: "fcard-frame"
});
var fcFclicked = false;
fcF.addEventListener('click', () => {
    fcFclicked = true;
})
document.querySelector('main').append(fcF);

var idmax = 0;
var fcards = [];

function fcard(options) {
    this.content = options.content;
    idmax++;
    this.id = idmax;
    var fel = util.element('div', {
        class: "fcard" + (options.class ? " " + options.class : "")
    });
    fel.innerHTML = '<div class="content">' + this.content + '<div>';
    fcF.insertBefore(fel, fcF.firstChild);
    this.el = fel;
    fcards.push(this);
    this.isShow = true;
    mobZDIcon.style.display = '';
}

fcard.prototype = {
    show() {
        this.el.style.display = 'block';
        this.isShow = true;
        mobZDIcon.style.display = '';
    },
    hide() {
        this.el.style.display = 'none';
        this.isShow = false;
        if (checkAllHide()) {
            mobZDIcon.style.display = 'none';
        };
    },
    getFCardDom() {
        return this.el
    },
    destroy() {
        this.el.remove();
        this.el = null;
        fcards.splice(fcards.indexOf(this), 1);
        if (checkAllHide()) {
            mobZDIcon.style.display = 'none';
        };
    }
}

fcard.getFCardById = (id) => {
    for (var i = 0; i < fcards.length; i++) {
        if (fcards[i].id == id) {
            return fcards[i];
        }
    }
    return null;
}


function checkAllHide() {
    for (var i = 0; i < fcards.length; i++) {
        if (fcards[i].isShow) {
            return false;
        }
    }
    return true;
}

var mobZDIcon = util.element('div', {
    class: "fcard-mob-zd"
});
mobZDIcon.innerHTML = util.getGoogleIcon('e5cc');
mobZDIcon.style.display = 'none';
document.querySelector('main').append(mobZDIcon);
mobZDIcon.onclick = function (e) {
    fcFclicked = true;
    fcF.classList.add('show')
    this.classList.add('hide');
}
document.addEventListener('click', () => {
    if (fcFclicked) {
        fcFclicked = false;
        return;
    }
    fcF.classList.remove('show');
    mobZDIcon.classList.remove('hide');
})



module.exports = fcard;
