'use strict';

define(function () {
  var structures = {
    //        'object': 'object', // Removed ! Object should by dynamic.
    latex: 'string',
    rxn: 'string',
    reaction: 'object',
    mol2d: 'string',
    molfile2D: 'string',
    mol3d: 'string',
    molfile3D: 'string',
    jme: 'string',
    smiles: 'string',
    actelionID: 'string',
    oclID: 'string',
    doi: 'string',
    gif: 'string',
    picture: 'string',
    string: 'string',
    jpg: 'string',
    jpeg: 'string',
    webp: 'string',
    png: 'string',
    svg: 'string',
    number: 'number',
    color: 'string',
    mf: 'string',
    elecConfig: 'string',
    jcamp: 'string',
    date: 'string',
    downloadLink: 'string',
    openLink: 'string',
    html: 'string',
    boolean: 'boolean',
    array: 'array',
    regexp: 'string',
    regex: 'string',
    gradient: 'object',
    barcode: 'string',
    qrcode: 'string',
    colorBar: {
      type: 'array',
      elements: {
        type: 'array',
        elements: ['number', 'string']
      }
    },
    indicator: {
      type: 'array',
      elements: {
        color: 'string',
        bgcolor: 'string',
        text: 'string',
        class: 'string',
        icon: 'string',
        css: 'object',
        tooltip: 'string'
      }
    },
    styledValue: {
      type: 'object',
      elements: {
        css: 'object',
        value: 'object'
      }
    },
    arrayXY: {
      type: 'array',
      elements: ['number', 'number']
    },
    matrix: {
      type: 'object'
    },
    sparkline: {
      type: 'object'
    },
    chart: {
      type: 'object'
    },
    tree: {
      type: 'object'
    },
    fromTo: {
      type: 'object',
      elements: {
        from: 'number',
        to: 'number'
      }
    },
    loading: {
      type: 'object',
      elements: {
        title: 'string',
        series: {
          type: 'array',
          nbElements: 6,
          elements: {
            type: 'object',
            elements: {
              label: 'string',
              data: {
                type: 'array',
                elements: {
                  type: 'object',
                  elements: {
                    a: 'number',
                    c: 'string',
                    h: 'number',
                    info: 'object',
                    l: 'string',
                    u: 'string',
                    n: 'string',
                    o: 'number',
                    w: 'number',
                    x: 'number',
                    y: 'number'
                  }
                }
              }
            }
          }
        }
      }
    },
    gridSelector: {
      type: 'object',
      elements: {
        categories: {
          type: 'array',
          elements: {
            type: 'object',
            elements: {
              selectorType: 'string',
              name: 'string',
              label: 'string',
              defaultValue: 'number',
              defaultMaxValue: 'number',
              defaultMinValue: 'number',
              maxValue: 'number',
              minValue: 'number'
            }
          }
        },

        variables: {
          type: 'array',
          elements: {
            type: 'object',
            elements: {
              name: 'string',
              label: 'strig'
            }
          }
        }
      }
    },
    chemical: {
      type: 'object',
      elements: {
        _entryID: 'int',
        supplierName: 'string',
        _dateCreated: 'string',
        _dateLastModified: 'string',
        iupac: {
          type: 'array',
          nbElements: 2,
          elements: {
            type: 'object',
            elements: {
              value: 'string',
              language: 'string'
            }
          }
        },
        mf: {
          type: 'array',
          nbElements: 2,
          elements: {
            type: 'object',
            elements: {
              value: 'mf',
              mw: 'int',
              exactMass: 'int'
            }
          }
        },
        mol: {
          type: 'array',
          nbElements: 2,
          elements: {
            type: 'object',
            elements: {
              value: 'molfile2D',
              gif: 'gif'
            }
          }
        },
        rn: {
          type: 'array',
          nbElements: 2,
          elements: {
            type: 'object',
            elements: {
              value: 'int'
            }
          }
        },
        batchID: 'string',
        catalogID: 'string',
        entryDetails: 'chemicalDetails'
      }
    },
    chemicalDetails: {
      type: 'object',
      elements: {
        _entryID: 'int',
        supplierName: 'string',
        _dateCreated: 'string',
        _dateLastModified: 'string',
        iupac: {
          type: 'array',
          elements: {
            type: 'object',
            elements: {
              value: 'string',
              language: 'string'
            }
          }
        },
        mf: {
          type: 'array',
          elements: {
            type: 'object',
            elements: {
              value: 'mf',
              mw: 'int',
              exactMass: 'int'
            }
          }
        },
        mol: {
          type: 'array',
          elements: {
            type: 'object',
            elements: {
              value: 'molfile2D',
              gif: 'gif'
            }
          }
        },
        batchID: 'string',
        catalogID: 'string',
        bp: {
          type: 'array',
          elements: {
            type: 'object',
            elements: {
              pressure: 'number',
              high: 'number',
              low: 'number'
            }
          }
        },
        mp: {
          type: 'array',
          elements: {
            type: 'object',
            elements: {
              pressure: 'number',
              high: 'number',
              low: 'number'
            }
          }
        },
        rn: {
          type: 'array',
          elements: {
            type: 'object',
            elements: {
              value: 'number'
            }
          }
        },
        density: {
          type: 'array',
          elements: {
            type: 'object',
            elements: {
              high: 'number',
              low: 'number',
              temperature: 'number'
            }
          }
        },
        mol3d: {
          type: 'array',
          elements: 'molfile3d'
        },
        ir: {
          type: 'array',
          elements: {
            type: 'object',
            elements: {
              conditions: 'string',
              solvent: 'string',
              jcamp: 'jcamp',
              view: {
                type: 'object',
                elements: {
                  description: 'string',
                  value: 'string',
                  url: 'string',
                  pdf: 'string'
                }
              }
            }
          }
        },
        nmr: {
          type: 'array',
          elements: {
            type: 'object',
            elements: {
              pressure: 'string',
              solvent: 'string',
              experiment: 'string',
              frequency: 'number',
              nucleus: 'string',
              temperature: 'string',
              jcamp: 'jcamp',
              view: {
                type: 'object',
                elements: {
                  description: 'string',
                  value: 'string',
                  url: 'string',
                  pdf: 'string'
                }
              }
            }
          }
        },
        nmrExperiment: {
          type: 'object',
          elements: {
            '1H': {
              type: 'array',
              elements: {
                type: 'object',
                elements: {
                  pressure: 'string',
                  solvent: 'string',
                  experiment: 'string',
                  frequency: 'number',
                  nucleus: 'string',
                  temperature: 'string',
                  jcamp: 'jcamp',
                  view: {
                    type: 'object',
                    elements: {
                      description: 'string',
                      value: 'string',
                      url: 'string',
                      pdf: 'string'
                    }
                  }
                }
              }
            },
            '13C': {
              type: 'array',
              elements: {
                type: 'object',
                elements: {
                  pressure: 'string',
                  solvent: 'string',
                  experiment: 'string',
                  frequency: 'number',
                  nucleus: 'string',
                  temperature: 'string',
                  jcamp: 'jcamp',
                  view: {
                    type: 'object',
                    elements: {
                      description: 'string',
                      value: 'string',
                      url: 'string',
                      pdf: 'string'
                    }
                  }
                }
              }
            },
            cosy: {
              type: 'array',
              elements: {
                type: 'object',
                elements: {
                  pressure: 'string',
                  solvent: 'string',
                  experiment: 'string',
                  frequency: 'number',
                  nucleus: 'string',
                  temperature: 'string',
                  jcamp: 'jcamp',
                  view: {
                    type: 'object',
                    elements: {
                      description: 'string',
                      value: 'string',
                      url: 'string',
                      pdf: 'string'
                    }
                  }
                }
              }
            },
            hsqc: {
              type: 'array',
              elements: {
                type: 'object',
                elements: {
                  pressure: 'string',
                  solvent: 'string',
                  experiment: 'string',
                  frequency: 'number',
                  nucleus: 'string',
                  temperature: 'string',
                  jcamp: 'jcamp',
                  view: {
                    type: 'object',
                    elements: {
                      description: 'string',
                      value: 'string',
                      url: 'string',
                      pdf: 'string'
                    }
                  }
                }
              }
            },
            hmbc: {
              type: 'array',
              elements: {
                type: 'object',
                elements: {
                  pressure: 'string',
                  solvent: 'string',
                  experiment: 'string',
                  frequency: 'number',
                  nucleus: 'string',
                  temperature: 'string',
                  jcamp: 'jcamp',
                  view: {
                    type: 'object',
                    elements: {
                      description: 'string',
                      value: 'string',
                      url: 'string',
                      pdf: 'string'
                    }
                  }
                }
              }
            },
            jresolv: {
              type: 'array',
              elements: {
                type: 'object',
                elements: {
                  pressure: 'string',
                  solvent: 'string',
                  experiment: 'string',
                  frequency: 'number',
                  nucleus: 'string',
                  temperature: 'string',
                  jcamp: 'jcamp',
                  view: {
                    type: 'object',
                    elements: {
                      description: 'string',
                      value: 'string',
                      url: 'string',
                      pdf: 'string'
                    }
                  }
                }
              }
            }
          }
        },
        mass: {
          type: 'array',
          elements: {
            type: 'object',
            elements: {
              experiment: 'string',
              jcamp: 'jcamp'
            }
          }
        },
        massExperiment: {
          type: 'object',
          elements: {
            hplcMS: {
              type: 'array',
              elements: {
                type: 'object',
                elements: {
                  experiment: 'string',
                  jcamp: 'jcamp'
                }
              }
            },
            gcMS: {
              type: 'array',
              elements: {
                type: 'object',
                elements: {
                  experiment: 'string',
                  jcamp: 'jcamp'
                }
              }
            },
            ms: {
              type: 'array',
              elements: {
                type: 'object',
                elements: {
                  experiment: 'string',
                  jcamp: 'jcamp'
                }
              }
            }
          }
        }
      }
    },
    geojson: 'object',
    pdb: 'string',
    cif: 'string',
    magres: 'string',
    jsmolscript: 'string'
  };

  var getList = function () {
    return Object.keys(this).sort();
  };

  var parse = function (type, value) {
    if (!this[type]) return;

    var result = { type: type };
    var val;

    if (typeof this[type] === 'string') {
      switch (this[type]) {
        case 'string':
          val = value;
          break;
        case 'number':
          val = parseFloat(value);
          break;
        case 'boolean':
          val = !!value;
          break;
        default:
          val = JSON.parse(value);
          break;
      }
    } else {
      val = JSON.parse(value);
    }

    result.value = val;
    return DataObject.check(result, true);
  };

  Object.defineProperty(structures, '_getList', {
    value: getList
  });

  Object.defineProperty(structures, '_parse', {
    value: parse
  });

  return structures;
});
