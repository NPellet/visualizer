define( [ 'modules/default/defaultcontroller' ], function( Default ) {
    
  /**
  * Creates a new empty controller
  * @class Controller
  * @name Controller
  * @constructor
  */
  function controller() { };

  // Extends the default properties of the default controller
  controller.prototype = $.extend( true, {}, Default );


  /*
  Information about the module
  */
  controller.prototype.moduleInformation = {
    name: 'Panzoom',
    description: 'Panzoom',
    author: 'Daniel Kostro',
    date: '15.06.2014',
    license: 'MIT',
    cssClass: 'mod_panzoom'
  };
    


  /*
  Configuration of the input/output references of the module
  */
  controller.prototype.references = {
    picture: {
      label: 'A picture'
    }
  };
  
  controller.prototype.events = {

  };
	
    

  /*
  Configuration of the module for receiving events, as a static object
  In the form of 
  */
  controller.prototype.variablesIn = ['picture'];

  /*
  Received actions
  In the form of

  {
  actionRef: 'actionLabel'
  }
  */
  controller.prototype.actionsIn = {
    
  };
    
        
  controller.prototype.configurationStructure = function(section) {
    var vars = [];
    var currentCfg = this.module.definition.vars_in;

    if(currentCfg) {

      var i = 0,
      l = currentCfg.length;

      for( ; i < l ; i++) {
        vars.push({ 
          title: currentCfg[i].name,
          key: currentCfg[i].name
        });
      }
    }
        
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },

          fields: {

          }
        },
        
        img: {
          options: {
            type: 'table',
            multiple: true
          },
          
          fields: {
            variable: {
              type: 'combo',
              title: 'Variable In',
              options: vars,
              default: ''
            },
            
            opacity: {
              type: 'text',
              title: 'Opacity [0,1]',
              default: '1'
            },
            
            order: {
              type: 'text',
              title: 'z-index',
              default: ''
            }
          }
        }
      }
    };
  };

        
  controller.prototype.configAliases = {
    img: [ 'groups', 'img', 0 ]
  };

  return controller;
});
