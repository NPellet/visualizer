'use strict';

define(['katex', 'quill'], function (katex, Quill) {
  window.katex = katex; // Needed for quill formula to work :(
  window.Quill = Quill;
  return Quill;
});
