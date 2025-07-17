'use strict';

define(['jquery', 'src/data/structures', 'src/util/debug'], function (
  $,
  Structures,
  Debug,
) {
  function _getValueFromJPath(element, jpath) {
    var el = getValueIfNeeded(element),
      jpathElement = jpath.shift();

    if (jpathElement) {
      if (el && (el = el[jpathElement]) !== false) {
        // Fetch the element and return the deferred.
        // However, we pipe the deferred with the recursive function
        return fetchElementIfNeeded(el).pipe(function (elChildren) {
          return _getValueFromJPath(elChildren, jpath);
        });
      } else {
        return $.Deferred().reject();
      }
    } else {
      // Finally, jpathElement doesn't exist and we throw what's left
      return $.Deferred().resolve(element);
    }
  }

  function _setValueFromJPath(element, jpath, newValue, moduleId, mute) {
    var el = getValueIfNeeded(element);
    var subelement;
    if (typeof el !== 'object' && jpath.length > 0) {
      el = {};
    }
    if (jpath.length === 1) {
      return (el[jpath[0]] = newValue);
    }
    var jpathElement = jpath.shift();
    if (jpathElement) {
      if (!(subelement = el[jpathElement])) {
        // If not an object, we make it an object
        subelement = {};
        el[jpathElement] = subelement;
      }

      // Perhaps the subelement is set only by URL, in which case we have to set it.
      return fetchElementIfNeeded(subelement)
        .pipe(function (elChildren) {
          return _setValueFromJPath(elChildren, jpath, newValue);
        })
        .done(function () {
          if (!mute) {
            triggerDataChange(el, moduleId);
          }
        });
    }
  }

  function getOptions(value) {
    return value?._options || {};
  }

  function getHighlights(value) {
    return value?._highlight || [];
  }

  function getValueIfNeeded(element) {
    if (element === undefined) {
      return;
    }

    if (typeof element === 'object' && element.url) {
      return fetchElementIfNeeded(element).pipe(function (data) {
        return data.value;
      });
    }
    if (element.value && element.type) {
      return element.value;
    }
    return element;
  }

  function fetchElementIfNeeded(element) {
    var deferred = $.Deferred();

    if (element === undefined || element == null) {
      return deferred.reject();
    }
    var type = getType(element);
    if (element.url && element.type) {
      // var ajaxType = typeof Structures[type] == 'object' ? 'json' : 'text';
      require(['src/util/urldata'], function (urlData) {
        urlData.get(element.url, false, element.timeout).then(
          function (data) {
            data = { type, value: data };
            deferred.resolve(data);
          },
          function (error) {
            Debug.error('Fetching error', error);
          },
        );
      });
      return deferred;
    } else {
      return deferred.resolve(element);
    }
  }

  function getType(element) {
    if (element == undefined) {
      return;
    }

    if (element.getType) {
      return element.getType();
    }

    var type = typeof element;
    if (type === 'object') {
      if (Array.isArray(element)) {
        return 'array';
      }
      if (Structures[element.type] && (element.value || element.url)) {
        return element.type;
      }

      if (element.type === undefined || !element.value) {
        return 'object';
      } else {
        Debug.error(`Type ${element.type} could not be found`);
        return;
      }
    }
    // Native types: int, string, boolean
    return type;
  }

  function listenDataChange(data, callback, id) {
    if (!data.__onDataChanged) {
      data.__onDataChanged = [];
    }
    data.__onDataChanged.push([callback, id]);
  }

  function triggerDataChange(data, id) {
    if (data.__onDataChanged) {
      for (var i = 0, l = data.__onDataChanged.length; i < l; i++) {
        if (
          (id !== undefined && data.__onDataChanged[i][1] !== id) ||
          id === undefined
        ) {
          data.__onDataChanged[i][0].call(data, data);
        }
      }
    }
  }

  function addToTree(tree, customJpaths) {
    if (!tree || !tree.children) return;
    var el = tree.children.find((el) => {
      return el.title === customJpaths[0];
    });
    if (!el) {
      tree.children.push({
        key: `${tree.key}.${customJpaths[0]}`,
        title: customJpaths[0],
        children: [],
      });
      if (customJpaths.length > 1) {
        customJpaths = customJpaths.splice(1, customJpaths.length - 1);
        addToTree(tree.children.at(-1), customJpaths);
      }
    } else if (customJpaths.length > 1) {
      customJpaths = customJpaths.splice(1, customJpaths.length - 1);
      addToTree(el, customJpaths);
    }
  }

  return {
    getType,

    getValueIfNeeded,
    fetchElementIfNeeded,

    getValueFromJPath(element, jpath) {
      if (!jpath) {
        return $.Deferred().resolve(element);
      }
      if (!jpath.split) {
        jpath = '';
      }
      var jpathSplitted = jpath.split('.'); // Remove first element, which should always be 'element'
      jpathSplitted.shift();
      return _getValueFromJPath(element, jpathSplitted);
    },

    setValueFromJPath(element, jpath, newValue, moduleId, mute) {
      if (!jpath.split) {
        jpath = '';
      }
      var jpathSplitted = jpath.split('.');
      jpathSplitted.shift();

      if (moduleId === true || moduleId === false) {
        mute = moduleId;
        moduleId = undefined;
      }

      return _setValueFromJPath(
        element,
        jpathSplitted,
        newValue,
        moduleId,
        mute,
      );
    },

    addJpathToTree(tree, customJpaths) {
      if (tree.length === 0) {
        tree.push({
          title: 'element',
          key: 'element',
          children: [],
        });
      }
      return addToTree(tree[0], customJpaths);
    },

    getJPathsFromStructure(structure, title, jpathspool, jpathString) {
      if (!structure) {
        return;
      }

      const children = [];

      if (structure.elements) {
        if (!jpathString) {
          jpathString = 'element';
          title = 'element';
        } else {
          jpathString += `.${title}`;
        }

        jpathspool.push({
          title,
          children,
          key: jpathString,
        });

        switch (structure.type) {
          case 'object': {
            // The type is object (native). Then look for its children (structure.elements)
            for (const i in structure.elements) {
              this.getJPathsFromStructure(
                structure.elements[i],
                `${i}`,
                children,
                jpathString,
              );
            }

            break;
          }
          // If it's an array, look for the children
          case 'array': {
            // Array which length is nown => Then it's an object type
            if (!Array.isArray(structure.elements)) {
              structure.elements = [structure.elements];
            }

            // Look for how many elements to display
            let len = Math.min(5, structure.elements.length || 0);

            // Can be overridden in the structure.
            if (structure.nbElements) {
              len = structure.nbElements;
            }

            for (let i = 0; i < len; i++) {
              this.getJPathsFromStructure(
                structure.elements[i] || structure.elements[0],
                `${i}`,
                children,
                jpathString,
              );
            }

            children.push({
              title: 'length',
              key: `${jpathString}.length`,
              children: [],
            });
            break;
          }
        }
      } else if (
        typeof structure === 'string' &&
        typeof Structures[structure] === 'object'
      ) {
        // Useful is { myProp: 'chemical' } => will fetch the chemical structure
        this.getJPathsFromStructure(
          Structures[structure],
          title,
          jpathspool,
          jpathString,
        );
      } else {
        if (!jpathString) {
          jpathString = 'element';
          title = 'element';
        } else {
          jpathString += `.${title}`;
        }

        jpathspool.push({
          title,
          children,
          key: jpathString,
        });
      }
    },

    getStructureFromElement(element, options, recursion) {
      options = options || {};
      recursion = recursion || 0;

      if (options.recursionLimit && recursion >= options.recursionLimit) {
        return;
      }

      var structure = {};

      if (!element) {
        return;
      }

      if (!element.getType) {
        element = DataObject.check(element, true);
      }

      var type = element.getType();
      element = DataObject.check(element.get());

      if (type === 'array') {
        structure.type = 'array';
        structure.elements = [];
        var length = Math.min(5, element.length);

        for (let i = 0; i < length; i++) {
          structure.elements[i] = this.getStructureFromElement(
            element.get(i, false),
            options,
            recursion + 1,
          );
        }
      } else if (type === 'object') {
        structure.type = 'object';
        structure.elements = {};

        var counter = 0;
        for (let i in element) {
          if (counter++ >= 100) break;
          if (i[0] !== '_') {
            structure.elements[i] = this.getStructureFromElement(
              element.get(i, false),
              options,
              recursion + 1,
            );
          }
        }
      } else if (type && Structures[type] && (element.value || element.url)) {
        structure = Structures[type];
      } else {
        structure = type;
      }

      return structure;
    },

    getJPathsFromElement(element, jpaths) {
      if (!jpaths) {
        jpaths = [];
      }

      if (element === undefined || element == null) {
        return;
      }

      // We know the dynamic structure
      // Apply to typed elements + to js objects
      if (element._structure) {
        this.getJPathsFromStructure(element._structure, null, jpaths);
      } else if (
        element.type &&
        Structures[element.type] &&
        (element.value || element.url)
      ) {
        this.getJPathsFromStructure(Structures[element.type], null, jpaths);
      } else {
        var structure = this.getStructureFromElement(element, {
          recursionLimit: 7,
        });
        this.getJPathsFromStructure(structure, null, jpaths);
      }

      return jpaths;
    },

    get(data) {
      if (data) {
        if (typeof data.get === 'function') {
          return data.get();
        } else if (data.type && data.value) {
          return data.value;
        }
      }

      return data;
    },

    getHighlights,
    getOptions,

    triggerDataChange,
    listenDataChange,
  };
});
