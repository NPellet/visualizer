'use strict';

define(['mime-types'], function (mimeTypes) {
  return {
    lookup: function (filename, override) {
      var contentType = mimeTypes.lookup(filename);
      if (!contentType || override) {
        if (/\.j?dx$/i.test(filename)) {
          contentType = 'chemical/x-jcamp-dx';
        } else if (/\.gbk?$/i.test(filename)) {
          contentType = 'chemical/seq-na-genbank';
        } else if (/\.genbank$/i.test(filename)) {
          contentType = 'chemical/seq-na-genbank';
        } else if (/\.(fasta|fa|fna)$/i.test(filename)) { // is fsa nucleic or amino acid?
          contentType = 'chemical/seq-na-fasta';
        } else if (/\.(mpfa|faa)$/i.test(filename)) {
          contentType = 'chemical/seq-aa-fasta';
        }
      }
      return contentType;
    }
  };
});
