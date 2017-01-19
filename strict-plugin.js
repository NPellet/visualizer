'use strict';

const t = require('babel-types');

module.exports = function () {
    return {
        visitor: {
            CallExpression(path, state) {
                const spath = path.getPathLocation().split('.');
                if (spath.length === 3 && spath[0] === 'program' && path.node.callee.name === 'define') {
                    path.traverse({
                        FunctionDeclaration(path, state) {
                            // if (path.getStatementParent().getPathLocation().split('.').length === 2) {
                            //     debugger;
                            // }
                        },
                        Function(path, state) {
                            const spath = path.getPathLocation().split('.');
                            if (spath.length === 4 && spath[3].startsWith('arguments')) {
                                path.get('body').unshiftContainer('body', t.expressionStatement(t.stringLiteral('use strict')));
                            }
                        }
                    });
                }
                return;
                if (state.opts.strict === false || state.opts.strictMode === false) return;

                if (path.parent.node)
                    return;
                const {node} = path;

                // for (const directive of (node.directives: Array<Object>)) {
                //     if (directive.value.value === "use strict") return;
                // }

                path.unshiftContainer("directives", t.directive(t.directiveLiteral("use strict")));
            }
        }
    };
};
