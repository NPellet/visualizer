'use strict';

const t = require('@babel/types');

module.exports = function () {
  return {
    visitor: {
      CallExpression(path) {
        const spath = path.getPathLocation().split('.');
        if (
          spath.length === 3 &&
          spath[0] === 'program' &&
          path.node.callee.name === 'define'
        ) {
          path.traverse({
            Function(path) {
              const spath = path.getPathLocation().split('.');
              if (spath.length === 4 && spath[3].startsWith('arguments')) {
                path
                  .get('body')
                  .unshiftContainer(
                    'body',
                    t.expressionStatement(t.stringLiteral('use strict'))
                  );
              }
            }
          });
        }
      }
    }
  };
};
