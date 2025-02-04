
var lite = require('./lite.js');
var logo = require('./logo.js');
var color = require('./color.js');
var theme = require('./theme.js');
var dialogblur = require('./blur.js');
var core=require('./core')

module.exports = {
    setLite: lite.set,
    isLite: lite.get,
    getColor: color.getTheme,
    setColor: color.setTheme,
    setTheme: theme.setTheme,
    addTheme: theme.addTheme,
    removeTheme: theme.removeTheme,
    isTimeLogo() {
        return logo.get() == 'b'
    },
    setTimeLogo() {
        logo.set('b')
    },
    getLogo: logo.get,
    setLogo: logo.set,
    isDialogBlur: dialogblur.get,
    setDialogBlur: dialogblur.set,
    on:core.on, off:core.off,
    waitdotheme: theme.waitdotheme
}