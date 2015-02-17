(function (window, document) {
  const template =
    '<style scoped>' +
    '  .x-dropzone {width: 300px; height: 300px; line-height: 300px; border: dashed 1px black; text-align: center; cursor: pointer;}' +
    '</style>' +
    '<input type="file" id="files" name="files[]" multiple style="display: none;"/>' +
    '<div class="x-dropzone">Drop files here or click to add files.</div>';

  xtag.register('x-dropzone', {
    lifecycle:{
      created: function() {
        this.appendChild(xtag.createFragment(template));
        this.querySelector('div').addEventListener('dragover', this.handleDragOver, false);
        this.querySelector('div').addEventListener('drop', this.handleFileSelect, false);
      }
    },
    events: {
      'click:delegate(div)': function () {
        this.parentNode.querySelector('input').click();
      },
      'change:delegate(input)': function (e) {
        e.dataTransfer = {
          files: e.target.files
        }
        this.parentNode.handleFileSelect(e);
      }
    },
    accessors: {
      'width': {
        attribute: {name: 'width'},
        set: function (val) {
          this.querySelector('div').style.width = val;
        }
      },
      'height': {
        attribute: {name: 'height'},
        set: function (val) {
          this.querySelector('div').style.height = val;
          this.querySelector('div').style.lineHeight = val;
        }
      }
    },
    methods: {
      handleDragOver: function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
      },
      handleFileSelect: function (evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files; // FileList object.
        xtag.fireEvent(this, 'x-files', {
          detail: files
        });
      }
    }
  });
})(window, document);
