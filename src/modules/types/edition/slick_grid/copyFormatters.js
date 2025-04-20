'use strict';

define(['src/util/api'], function (API) {
  let OCL;
  return {
    OCLToMolfile: {
      async load() {
        OCL = await API.require('openchemlib/openchemlib-core');
      },
      extract(item, colDef) {
        DataObject.check(item, true);
        let val = item.getChildSync(colDef.jpath);
        val = val ? val.get() || '' : '';
        const ocl = OCL.Molecule.fromIDCode(val);
        return ocl.toMolfileV3();
      },
    },
  };
});
