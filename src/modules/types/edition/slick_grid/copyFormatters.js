'use strict';

define(['src/util/api'], function (API) {
  let OCL;
  return {
    OCLToMolfile: {
      load: async function () {
        OCL = await API.require('openchemlib/openchemlib-core');
      },
      extract: function (item, colDef) {
        DataObject.check(item, true);
        let val = item.getChildSync(colDef.jpath);
        val = val ? val.get() || '' : '';
        const ocl = OCL.Molecule.fromIDCode(val);
        return ocl.toMolfileV3();
      }
    }
  };
});
