'use strict';

define(['modules/types/display/jqgrid/model', 'src/util/util'], function (Model, Util) {
  function ModelExtended() {
    Model.call(this);
  }

  Util.inherits(ModelExtended, Model);

  return ModelExtended;
});
