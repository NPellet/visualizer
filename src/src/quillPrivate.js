'use strict';

define(['katex', 'quill'], function (katex, Quill, ImageResize) {
  window.katex = katex; // Needed for quill formula to work :(
  window.Quill = Quill;
  return Quill;
});
