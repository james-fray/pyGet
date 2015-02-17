/** configs **/
var config = {
  remote: {
    server: "http://pyget.com"
  },
  webRTC: {
    timeout: 10000
  }
}

/** WebRTC **/
function WebRTC () {
  this.connections = [];
  this.url = document.location.href;
  this.key = (function (key) {
    return key && key.length ? key[1] : null;
  })(/key=(.*)/.exec(this.url));

  this.emit('client-type', this.key ? 'client' : 'server');
}
WebRTC.prototype = new EventEmitter;
WebRTC.prototype.initiate = function () {
  this.peer = new Peer({
    key: 'hnoiteevigdgqfr'
  });
  this.peer.on('open', this.connected.bind(this));
  this.peer.on('close', this.closed.bind(this));
  this.peer.on('error', this.error.bind(this));
  this.peer.on('disconnected', this.disconnected.bind(this));
  this.peer.on('connection', function (conn) {
    this.emit('remote-connection-requested', conn);
    this.prepareConnection(conn);
    this.connections.push(conn);
  }.bind(this));
}
WebRTC.prototype.reconnect = function () {
  this.peer.reconnect();
}
WebRTC.prototype.error = function (err) {
  this.emit('internal-error', err);
  if (err.type === 'browser-incompatible') {
    this.emit('disconnected');
  }
};
WebRTC.prototype.disconnected = function (e) {
  this.emit('disconnected');
};
WebRTC.prototype.closed = function () {
  this.emit('closed');
};
WebRTC.prototype.connected = function (id) {
  this.emit('connected');
  if (!this.key) { // server
    var href = config.remote.server + "/index.html?key=" + id;
    this.emit('remote-url-generated', href);
  }
  else {  // client
    var conn = this.peer.connect(this.key);
    this.prepareConnection(conn);
    this.connections.push(conn);
    this.emit('remote-waiting', id);
  }
}
WebRTC.prototype.prepareConnection = function (conn) {
  conn.on('connected', function () {
    this.emit('remote-connected', conn);
  }.bind(this));
  conn.on('data', function(e) {
    this.emit('remote-data-received', e);
  }.bind(this));
}
WebRTC.prototype.reset = function () {
  if (!this.peer.open) {
    this.peer.disconnect();
    console.log(9999)
  }
}
/** UI  **/
function UI () {
  this.elements = {}
}
UI.prototype = new EventEmitter;
UI.prototype.initiate = function () {
  this.elements = {
    notification: document.querySelector('x-notification'),
    dropZone: document.querySelector("x-dropzone"),
    img: document.querySelector("img"),
    refresh: document.getElementById("refresh"),
    reconnect: document.getElementById("reconnect"),
    log: document.querySelector("x-log")
  }

  this.elements.dropZone.addEventListener("x-files", function (e) {
    this.emit("x-files", e);
  }.bind(this), false);
  this.elements.refresh.addEventListener("x-command", function () {
    document.location.reload();
  }, false);
  this.elements.reconnect.addEventListener("x-command", function () {
    this.emit("reconnect");
  }.bind(this), false);
  this.emit("initiated");
}
UI.prototype.html = function (tag, attrbs, parent) {
  var elem = document.createElement(tag);
  for (var attrb in attrbs) {
    elem.setAttribute(attrb, attrbs[attrb]);
  }
  if (parent) {
    parent.appendChild(elem);
  }
  return elem;
}
UI.prototype.log = function (msg, type) {
  this.elements.log.add(msg, type ? type : "info");
  return this;
}
UI.prototype.notify = function (msg, period, type) {
  this.elements.notification.trigger(msg, type ? type : 'info', period);
  return this;
}
UI.prototype.image = function (name) {
  if (name.indexOf("data:image") !== -1) {
    this.elements.img.src = name;
  }
  else {
    var parts = name.split(".").length;
    this.elements.img.src = cdn + "/images/" + (parts === 2 ? name : name + ".png");
  }
}
UI.prototype.mode = function (mode) {
  if (mode === "drop-files") {
    this.elements.img.style.display = "none";
    this.elements.dropZone.style.display = "block";
  }
  if (mode === "image") {
    this.elements.img.style.display = "block";
    this.elements.dropZone.style.display = "none";
  }
  if (mode === "connected") {
    this.elements.reconnect.disable = "true";
  }
  if (mode === "disconnected") {
    this.elements.reconnect.disable = "false";
  }
  return this;
}

/** body **/
var webRTC = new WebRTC(),
    ui = new UI();

function bytesToSize (bytes) {
  if(bytes == 0) return '0 Byte';
  var k = 1000;
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

webRTC.on('remote-connected', function (conn) {
  ui.mode("drop-files");
  ui.log('You are now connected to peer [' + conn.id + ']')
    .notify('You can now send and receive files.', 10);
});
webRTC.on('remote-data-received', function (data) {
  data.forEach(function (obj) {
    var blob = new Blob([obj.data], {type: obj.type});
    ui.log('Received a file from peer [' + obj.id + '], ' + obj.name + ' (' + bytesToSize(blob.size) + ')', "warning");
    saveAs(blob, obj.name);
  });
});
webRTC.on('remote-connection-requested', function (conn) {
  ui.log('Remote connection is requested from peer [' + conn.id + ']', "warning");
});
webRTC.on('remote-url-generated', function (url) {
  // this is a reconnect and there are active peers available
  if (webRTC.connections.length) {
    ui.mode("drop-files");
  }
  else {
    ui.image(qr.toDataURL({
      foreground : "#515151",
      background : "#FFF",
      size: 8,
      value: url
    }));
  }
  var msg = ui.html("span");
  msg.appendChild(document.createTextNode("Your remote client address is "))
  ui.html("a", {
    href: url,
    target: "_blank"
  }, msg).textContent = url;
  ui.log(msg, "warning")
    .log("Open the above link in remote device(s), or simply use the generated QR code on your smart-phone(s) to start file sharing.");
});
webRTC.on('internal-error', function (err) {
  ui.log(err.message, "error");
});
webRTC.on('disconnected', function () {
  ui.log("The peer is disconnected from the signaling server.", "error");
  ui.mode("disconnected").mode("image").image("error");
});
webRTC.on('connected', function () {
  ui.mode("connected");
  ui.log('You are now connected to the signaling server.')
    .log('Your unique identification id is [' + webRTC.peer.id + ']');
});
webRTC.on('closed', function () {
  ui.log("The peer is destroyed and can no longer accept or create any new connections.", "error");
});
webRTC.initiate();

ui.on("x-files", function (e) {
  function convert (file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        resolve({
         data: e.target.result,
         name: file.name,
         type: file.type,
         id: webRTC.peer.id
        });
      }
      reader.readAsArrayBuffer(file)
    });
  }
  var files = e.detail;
  Promise.all([].map.call(files, function (file) {
    ui.log('Sending a file to remote peer(s), ' + file.name + " (" + bytesToSize(file.size) + ")");
    return convert(file);
  })).then(function (objs) {
    if (webRTC.connections.length) {
      var isActive = webRTC.connections.reduce(function (p, c) {
        return p || c.open;
      }, false);
      if (isActive) {
        webRTC.connections.forEach(function (conn) {
          conn.send(objs);
        });
      }
      else {
        ui.log("No active peer is detected. File transfer is aborted.", "error");
      }
    }
  })
});
ui.on('reconnect', function () {
  ui.log('Reconnecting to the signaling server ...');
  ui.mode('connected');
  webRTC.reconnect();
  // make sure connection has been established after 10 seconds, otherwise reset
  window.setTimeout(webRTC.reset.bind(webRTC), config.webRTC.timeout);
})
ui.on("initiated", function () {
  ui.log('Connecting to a signaling server ...');
  ui.image("loading.gif");
});
ui.initiate();
