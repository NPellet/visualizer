'use strict';

define(['src/util/ui'], function (ui) {
  var currentFullscreenModule,
    currentFullscreenElement,
    oldStyle,
    oldViewDimensions;

  function fullScreenChange() {
    var fullscreenElement =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;
    var view = currentFullscreenModule.view;
    if (fullscreenElement) {
      // New element is now fullscreen
      oldStyle = fullscreenElement.getAttribute('style');
      fullscreenElement.setAttribute(
        'style',
        'height:100%; width:100%; background-color:white;'
      );
      currentFullscreenElement = fullscreenElement;
      oldViewDimensions = { height: view.height, width: view.width };
      view.height = currentFullscreenModule.getDomContent().height();
      view.width = currentFullscreenModule.getDomContent().width();
      // view.height = screen.height / window.devicePixelRatio;
      // view.width = screen.width / window.devicePixelRatio;
    } else {
      // Stopping fullscreen
      currentFullscreenElement.setAttribute('style', oldStyle);
      view.height = oldViewDimensions.height;
      view.width = oldViewDimensions.width;
      oldStyle = oldViewDimensions = currentFullscreenElement = null;
    }
    currentFullscreenModule.view.onResize(view.width, view.height);
  }

  document.addEventListener('fullscreenchange', fullScreenChange);
  document.addEventListener('webkitfullscreenchange', fullScreenChange);
  document.addEventListener('mozfullscreenchange', fullScreenChange);
  document.addEventListener('MSFullscreenChange', fullScreenChange);

  return {
    requestFullscreen: function (module) {
      if (
        document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled
      ) {
        currentFullscreenModule = module;
        var dom = module.getDomContent()[0];
        if (dom.requestFullscreen) {
          dom.requestFullscreen();
        } else if (dom.webkitRequestFullscreen) {
          dom.webkitRequestFullscreen();
        } else if (dom.mozRequestFullScreen) {
          dom.mozRequestFullScreen();
        } else if (dom.msRequestFullscreen) {
          dom.msRequestFullscreen();
        }
      } else {
        ui.showNotification(
          'Sorry, fullscreen not available in this context',
          'info'
        );
      }
    }
  };
});
