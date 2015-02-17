/**** wrapper (start) ****/
var isFirefox = typeof require !== 'undefined',
    isSafari  = typeof safari !== 'undefined',
    isOpera   = typeof chrome !== 'undefined' && navigator.userAgent.indexOf("OPR") !== -1,
    isChrome  = typeof chrome !== 'undefined' && navigator.userAgent.indexOf("OPR") === -1;

if (isFirefox) {
  app = require('./firefox/firefox');
}
/**** wrapper (end) ****/

// welcome
(function () {
  app.storage.read("version").then(function (version) {
    if (app.version() !== version) {
      app.timer.setTimeout(function () {
        app.tab.open("http://pyget.com/about.html?v=" + app.version() + (version ? "&p=" + version + "&type=upgrade" : "&type=install"));
        app.storage.write("version", app.version()).then();
      }, 3000);
    }
  });
})();

