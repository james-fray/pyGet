var app = {}

app.Promise = Promise;

app.storage = {
  read: function (id) {
    var d = app.Promise.defer();
    chrome.storage.local.get(id, function (p) {
      d.resolve(p[id] || null);
    });
    return d.promise;
  },
  write: function (id, data) {
    var d = app.Promise.defer();
    var obj = {};
    obj[id] = data;
    chrome.storage.local.set(obj, function () {
      d.resolve();
    });
    return d.promise;
  }
}

app.content_script = (function () {
  chrome.browserAction.onClicked.addListener(function () {
    app.tab.open('./data/ui/index.html');
  });
  return {
    send: function (id, data, global) {
      var options = global ? {} : {active: true, currentWindow: true}
      chrome.tabs.query(options, function(tabs) {
        tabs.forEach(function (tab) {
          chrome.tabs.sendMessage(tab.id, {method: id, data: data}, function() {});
        });
      });
    },
    receive: function (id, callback) {
      chrome.extension.onRequest.addListener(function(request, sender, callback2) {
        if (request.method == id && sender.tab) {
          callback(request.data);
        }
      });
    }
  }
})();

app.tab = {
  open: function (url, inBackground, inCurrent) {
    if (inCurrent) {
      chrome.tabs.update(null, {url: url});
    }
    else {
      chrome.tabs.create({
        url: url,
        active: typeof inBackground == 'undefined' ? true : !inBackground
      });
    }
  },
  list: function (currentWindow) {
    var d = app.Promise.defer();
    chrome.tabs.query({
      currentWindow: currentWindow ? currentWindow : false
    },function(tabs) {
      d.resolve(tabs);
    });
    return d.promise;
  }
}

app.version = function () {
  return chrome[chrome.runtime && chrome.runtime.getManifest ? "runtime" : "extension"].getManifest().version;
}

app.timer = window;
