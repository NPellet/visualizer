'use strict';

define(['twig_extended', 'src/util/ui', 'src/util/Form'], function (
  Twig,
  UI,
  Form,
) {
  const exports = {};
  exports.renderTwig = async function renderTwig(template, data) {
    template = Twig.twig({
      data: DataObject.resurrect(template),
    });
    var renderer = await template.renderAsync(DataObject.resurrect(data));
    const div = document.createElement('div');
    div.style = 'position: absolute; width: 1; height: 1; visibility: none';
    const body = document.querySelectorAll('body')[0];
    div.innerHTML = renderer.html;
    body.append(div);
    await renderer.render(); // we render the async typerenderer
    const html = div.innerHTML;
    div.remove();
    return html;
  };

  exports.form = function (divOrData, inputObject, opts) {
    let $div;
    opts = Object.assign({}, opts);

    if (opts.twig) {
      var template = Twig.twig({
        data: DataObject.resurrect(divOrData),
      });
      var render = template.renderAsync(DataObject.resurrect(opts.twig));
      render.render();
      $div = render.html;
    } else {
      $div = divOrData;
    }

    return new Promise(function (resolve) {
      const done = (name) => {
        var obj = form.getData(true);
        obj._clickedButton = name;
        form.unbind();
        resolve(obj);
        dialog.dialog('destroy');
      };

      if (!$div.jquery) {
        $div = $($div);
      }

      var form = new Form($div);
      if (inputObject) form.setData(inputObject);

      form.onSubmit((event) => {
        done(event.target.name);
      });

      const dialogOptions = Object.assign({ buttons: {} }, opts.dialog, {
        close() {
          form.unbind();
          resolve(null);
          dialog.dialog('destroy');
        },
      });

      if (opts.buttonLabels) {
        for (let i = 0; i < opts.buttonLabels.length; i++) {
          const button = opts.buttonLabels[i];
          if (typeof button === 'string') {
            dialogOptions.buttons[button] = () => done(button);
          } else {
            dialogOptions.buttons[button.label] = () => done(button.key);
          }
        }
      }
      var dialog = UI.dialog($div, dialogOptions);
    });
  };

  return exports;
});
