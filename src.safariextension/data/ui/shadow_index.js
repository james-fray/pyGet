function script (src) {
  return new Promise(function (resolve, reject) {
    var head = document.querySelector('head');
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = resolve;
    head.appendChild(script);
  });
}

var cdn = ".";

Promise.all([
  "libs/x-tag-components.js",
  "libs/peer.js",
  "libs/EventEmitter.js"
].map(script)).then(function () {
  Promise.all([
    "components/x-hbox.js",
    "components/x-vbox.js",
    "components/x-button.js",
    "components/x-notification.js",
    "components/x-dropzone.js",
    "components/x-log.js"
  ].map(script)).then(function () {
    script("index.js").then();
    script("libs/FileSaver.js").then();
    script("libs/scoped.js").then();
    if (document.location.href.indexOf("key=") === -1) {
      script("libs/qr.js").then();
    }
  });
});
