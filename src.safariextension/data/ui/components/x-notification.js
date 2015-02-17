(function (window, document) {
  const template =
    '<style scoped>' +
    '  .x-notification {position: fixed; bottom: 30px; width: 80%; left: 10%; z-index: 11;}' +
    '  .x-notification>span[is=x-hbox] {border: solid 1px rgba(0, 0, 0, 0.15); background-color: #f5f5f5; height: 28px; margin: 5px 0; padding: 0 5px;}' +
    '  .x-notification x-button {opacity: 0.5}' +
    '  .x-notification x-button:hover {opacity: 0.8}' +
    '  .x-notification x-button:active {opacity: 1.0}' +
    '  .x-notification>span>i {display: block;}' +
    '  .x-notification>span>span {padding-left: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; width: 100%; text-align: left;}' +
    '</style>' +
    '<div class="x-notification">' +
    '  <span is="x-hbox" pack="start" align="center" hidden="true">' +
    '    <i></i>' +
    '    <span></span>' +
    '    <x-button transparent="true" width="16px" height="16px" icon="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH3wIMDiU2Mn2A9gAAAN5JREFUGNNdkLFKxEAQhr/Z2IQcxASLY4uw2SqYVxDhwMbewsYn8AEOK3tbH+Pqw0psfIgrUx7kihSGyLEsNllY88MUM3wD3wwAdV0/t227YhFjzNpauwVIrLWvIvLmnLvVWu/6vj8HSCn1BTwWRfErxphmHqyB7zRN78dxXM2zBjh47zcyb/+DgasY6rruKJFPDBNDACpyH+YKOWVZ9hMatRBvgANwBG6mafoI35Al5L3fAJfLA5OyLN+Bu9hpGIZTnud7EXkArp1z50Rr/emc0977pyAOEMEXVVW9/AFLjmFvP5FZOAAAAABJRU5ErkJggg=="></x-button>' +
    '  </span>' +
    '</div>';

    function html (tag, attrbs, parent) {
      var elem = document.createElement(tag);
      for (var attrb in attrbs) {
        elem.setAttribute(attrb, attrbs[attrb]);
      }
      if (parent) {
        parent.appendChild(elem);
      }
      return elem;
    }

  xtag.register('x-notification', {
    lifecycle: {
      created: function() {
        var fragment = xtag.createFragment(template);
        this.appendChild(fragment);
        this.reference = this.querySelector("span");
      }
    },
    accessors: {
      'icon': {
        attribute: {name: "icon"}
      }
    },
    methods: {
      trigger: function (msg, type, period) {
        function remove(hbox) {
          if (!hbox || !hbox.parentNode) return;
          hbox.parentNode.removeChild(hbox);
          if (!this.querySelector("div").children.length) {
            this.style.display = "none";
          }
        }
        var hbox = this.reference.cloneNode(true);
        var i = hbox.querySelector("i");
        i.style.width = this["icon-width"] || "16px";
        i.style.minWidth = this["icon-width"] || "16px";
        i.style.height = this["icon-height"] || "16px";
        i.style.backgroundImage = 'url(' + this.icon + ')';
        i.style.backgroundPosition = (["warning", "error", "info"].indexOf(type) * -16) + "px center";
        var label = hbox.querySelector("span");
        label.textContent = msg;
        var button = hbox.querySelector("x-button");
        button.addEventListener("x-command", function (hbox) {
          remove.call(this, hbox);
        }.bind(this, hbox), "false");

        hbox.style.display = "flex";
        hbox.style.display = "-webkit-flex";
        this.querySelector("div").appendChild(hbox);

        if (period) {
          window.setTimeout(remove.bind(this), period * 1000, hbox)
        }

        return {
          remove: remove.bind(this, hbox),
          update: function (label, msg) {
            if (typeof msg === "string") {
              label.textContent = msg;
            }
            else {
              label.innerHTML = "";
              label.appendChild(msg);
            }
          }.bind(this, label)
        }
      }
    }
  });
})(window, document);
