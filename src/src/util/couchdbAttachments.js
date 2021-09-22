'use strict';

// Mini-library to manage couchdb attachments
// - Get and upload attachments just by their name
// - Cache already downloaded attachments
define([
  'src/util/versioning',
  'superagent',
  'src/util/util',
  'fetch',
], function (Versioning, superagent, util, fetch) {
  const base64DataUrlReg = /^data:([a-z]+\/[a-z]+)?;base64,/;

  function dataURLtoBase64(data) {
    let pos;
    const l = Math.min(100, data.length);
    for (let i = 0; i < l; i++) {
      if (data[i] === ';') {
        pos = i + 1;
        break;
      }
    }
    const t = data.slice(pos, pos + 7);
    if (pos && t === 'base64,') {
      pos = pos + 7;
      return data.slice(pos);
    } else {
      throw new Error('Could not parse dataurl');
    }
  }

  class CouchdbAttachments {
    /**
     * @param {string} url - Set the docUrl. If none specified, will attempt to use the viewURL to set the docURL
     * @constructor
     * @exports src/util/couchdbAttachments
     */
    constructor(url) {
      // get the document url from the view url
      if (arguments.length === 0) {
        const viewUrl = Versioning.lastLoaded.view.url;
        if (!viewUrl) {
          throw new Error(
            'couchdb attachments initialization failed: No view url',
          );
        }
        this.docUrl = viewUrl.replace(/\/[^/]+$/, '');
      } else {
        this.docUrl = url;
      }
    }

    /**
     * Set the document. Useful if another library is already manipulating this document
     * and you don't want to make a duplicate GET request
     * @param {object} doc - The document object.
     */
    setDoc(doc) {
      this.lastDoc = doc;
    }

    /**
     * @param {boolean} [secondRound]
     * @return {object} attachments - An array with the attachments metadata
     * @return {number} attachments[].name - The name of the resource
     * @return {string} attachments[].content_type - Resource's mime-type
     * @return {string} attachments[].digest - base64 md5 digest of the resource
     * @return {number} attachments[].length - Length in bytes of the resource
     * @return {number} attachments[].url - The url of the resource
     */
    async list(secondRound) {
      const hasAtt = this.lastDoc && this.lastDoc._attachments;
      if (!this.lastDoc && secondRound) {
        throw new Error('Unreachable');
      }
      if (!hasAtt && !secondRound) {
        await this.refresh();
        return this.list(true);
      } else if (!hasAtt) {
        this.lastDoc._attachments = {};
      }
      return this.attachmentsAsArray(this, this.lastDoc._attachments);
    }

    /**
     * Upload several attachments in one revision
     * @param {object[]} items
     * @param {string} items[].name - The name of the attachment
     * @param {string} items[].contentType - The contentType of the uploaded data
     * @param {string} items[].data - The attachment data to upload. If string, must be a valid base64 encoded dataURL.
     * @param {string} items[].content - The attachment data to upload. Alias of data.
     * @param {Blob|string} items[].file - The attachment data to upload. Alias of data.
     * @param {object} options
     * @example
     * // With dataurl
     * cdb.inlineUploads([{
     *   name: 'example.png',
     *   file: 'data:image/png;base64,ORK5CYII='
     * }]);
     * // With Blob
     * cdb.inlineUploads([{
     *   name: 'example.txt',
     *   file: new Blob(['example'], {content_type: 'text/plain'});
     * }]);
     * // With data
     * cdb.inlineUploads([{
     *   name: 'example.txt',
     *   contentType: 'text/plain',
     *   data: 'example'
     * }]);
     * @return {Promise.<object>} The new list of attachments
     */
    async inlineUploads(items, options = {}) {
      await this.list();
      if (!items) {
        return attachmentsAsArray(this, this.lastAttachmentsResult);
      } else {
        if (!Array.isArray(items)) {
          throw new TypeError('options must be an array');
        }

        const prom = [];
        for (let i = 0; i < items.length; i++) {
          let name = getName(items[i]);
          let item = items[i];
          let data = item.data || item.file || item.content;
          if (typeof data === 'string') {
            if (item.encoding === 'base64') {
              this.lastDoc._attachments[name] = {
                content_type: item.contentType,
                data: data,
              };
            } else {
              let dataUrl = base64DataUrlReg.exec(data.slice(0, 64));
              if (!dataUrl) {
                this.lastDoc._attachments[name] = {
                  content_type: item.contentType,
                  data: btoa(unescape(encodeURIComponent(data))),
                };
              } else {
                this.lastDoc._attachments[name] = {
                  content_type: item.contentType || dataUrl[1],
                  data: data.slice(dataUrl[0].length),
                };
              }
            }
          } else if (data instanceof Blob || data instanceof ArrayBuffer) {
            if (data instanceof ArrayBuffer) {
              data = new Blob([data]);
            }
            if (!item.contentType && data.type) {
              item.contentType = data.type;
            }
            let p = new Promise((resolve, reject) => {
              let reader = new FileReader();
              reader.onload = function (e) {
                return resolve({
                  item: item,
                  base64data: dataURLtoBase64(e.target.result),
                });
              };
              reader.onerror = function () {
                return reject(new Error('Error while reading file'));
              };
              reader.readAsDataURL(data);
            });
            prom.push(p);
          } else {
            throw new Error('Item must have a valid data or file property');
          }
        }

        const toChange = await Promise.all(prom);

        for (let i = 0; i < toChange.length; i++) {
          const c = toChange[i];
          this.lastDoc._attachments[getName(c.item)] = {
            content_type: c.item.contentType,
            data: c.base64data,
          };
        }

        await fetch(this.docUrl, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(this.lastDoc),
        });

        if (options.noRefresh) {
          return attachmentsAsArray(this, this.lastDoc._attachments);
        } else {
          return this.refresh();
        }
      }
    }

    /**
     *
     * @param {object} item
     * @param {string} item.name - Name of the attachment to upload
     * @param {string} item.filename - Alias for name
     * @param {string} item.contentType - Content-Type of the attachment to upload
     * @param {string|Blob} item.data -  The attachment's content to upload
     * @param {string|Blob} item.file - The attachments's content to upload
     * @param {string|Blob} item.content - The attachments's content to upload
     * @param {object} options
     * @return {Promise.<object>} The new list of attachments
     */
    async upload(item, options = {}) {
      if (!item) {
        throw new Error('Invalid arguments');
      }
      let data = item.data || item.file || item.content;

      await this.list();

      let contentType = item.contentType;
      if (!contentType && data instanceof Blob) {
        contentType = data.type;
      } else if (typeof data === 'string') {
        if (item.encoding === 'base64') {
          data = item.data;
        } else {
          let dataUrl = base64DataUrlReg.exec(data.slice(0, 64));
          if (dataUrl) {
            data = util.b64toBlob(data.slice(dataUrl[0].length), dataUrl[1]);
            contentType = dataUrl[1];
          } else {
            data = new Blob([data], { content_type: item.contentType });
          }
        }
      } else if (!(data instanceof Blob)) {
        throw new Error('Data must be Blob or base64 dataUrl');
      }

      if (!contentType) {
        throw new Error(
          'Content-Type unresolved. Cannot upload document without content-type',
        );
      }

      const res = await superagent
        .put(`${this.docUrl}/${getName(item)}`)
        .withCredentials()
        .query({ rev: this.lastDoc._rev })
        .set('Content-Type', contentType)
        .set('Accept', 'application/json')
        .send(data);

      if (res && res.body && res.body.rev) {
        this.lastDoc._rev = res.body.rev;
      }

      if (options.noRefresh) {
        return attachmentsAsArray(this, this.lastDoc._attachments);
      } else {
        return this.refresh();
      }
    }

    /**
     * Get the content of an attachment
     * @param {string} name - The name of the attachment to get
     * @param {object} options
     * @return {Promise} The parsed content of the attachment
     */
    async get(name, options) {
      options = options || {};

      await this.list();

      const _att = this.lastDoc._attachments[name];
      if (!_att) throw new Error(`The attachment ${name} does not exist`);

      const url = `${this.docUrl}/${name}`;
      if (!options.responseType) {
        const req = superagent.get(url).withCredentials();
        if (_att)
          req.set('Accept', this.lastDoc._attachments[name].content_type);
        const res = await req.query({ rev: this.lastDoc._rev });
        if (options.raw) return res.text;
        else if (options.responseType) return res.xhr.response;
        return res.body || res.text;
      } else {
        const r = await fetch(url, { credentials: 'include' });
        switch (options.responseType) {
          case 'arraybuffer':
            return r.arrayBuffer();
          case 'blob':
            return r.blob();
          case 'json':
            return r.json();
          case 'text':
            return r.text();
        }
      }
    }

    /**
     * Remove an attachment
     * @param {string} name - The name of the attachment to remove.
     * @param {object} options
     * @return {Promise.<object>} The new list of attachments
     */
    async remove(name, options = {}) {
      if (Array.isArray(name)) {
        return inlineRemove(this, name, options);
      }

      await this.list();
      if (!this.lastDoc._attachments[name]) {
        throw new Error('Cannot remove attachment, attachment does not exist.');
      }

      const res = await superagent
        .del(`${this.docUrl}/${name}`)
        .withCredentials()
        .query({ rev: this.lastDoc._rev })
        .set('Accept', 'application/json');

      if (res && res.body && res.body.rev) {
        this.lastDoc._rev = res.body.rev;
        delete this.lastDoc._attachments[name];
        return attachmentsAsArray(this, this.lastDoc._attachments);
      } else {
        throw new Error('Unexpected error when removing attachments');
      }
    }

    /**
     * Refreshes the list of attachment from couchdb.
     * @returns {Promise.<Object>} attachments - The new list of attachments
     */
    // Get documents with latest attachements' rev ids
    async refresh() {
      let json = await (
        await fetch(this.docUrl, {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        })
      ).json();
      this.lastDoc = json;
      return attachmentsAsArray(this, json._attachments);
    }

    /**
     * An alias for refresh
     * Refreshes the list of attachment from couchdb.
     * @return {Promise.<object>} attachments - The new list of attachments
     */
    fetchList() {
      return this.refresh();
    }

    attachmentsAsArray() {
      const r = [];
      let i = 0;
      for (const key in this.lastDoc._attachments) {
        r.push(this.lastDoc._attachments[key]);
        r[i].name = key;
        r[i].url = encodeURI(`${this.docUrl}/${key}`);
        i++;
      }
      this.lastAttachmentsResult = r;
      return r;
    }

    // This is an alternative strategy for storing multiple attachments in one revision
    // The problem with this is that it doesn't allow to change the contentType
    // (because Blobs are immutable) if the browser did not set it correctly or if
    // the user wants to manually change it will not work properly
    async uploads1(files, options = {}) {
      if (!Array.isArray(files)) {
        throw new Error('uploads expects an array as parameter');
      }

      const req = superagent.post(this.docUrl).withCredentials();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        req.attach('_attachments', file, getName(file));
      }
      req.field('_rev', this.lastDoc._rev);
      const res = await req;
      if (res.status !== 201) {
        throw new Error(
          `Error uploading attachments, couchdb returned status code ${res.status}`,
        );
      }
      if (options.noRefresh) {
        return attachmentsAsArray(this, this.lastDoc._attachments);
      } else {
        return this.refresh();
      }
    }
  }

  // Private function
  async function inlineRemove(ctx, names, options = {}) {
    await ctx.list();
    if (!Array.isArray(names))
      throw new TypeError('Argument should be an array');
    if (names.length === 0) return ctx.list();
    for (let i = 0; i < names.length; i++) {
      delete ctx.lastDoc._attachments[names[i]];
    }
    const res = await superagent
      .put(ctx.docUrl)
      .withCredentials()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(ctx.lastDoc);
    if (res && res.body && res.body.rev) {
      // eslint-disable-next-line require-atomic-updates
      ctx.lastDoc._rev = res.body.rev;
    }

    if (options.noRefresh) {
      return attachmentsAsArray(ctx, ctx.lastDoc._attachments);
    } else {
      return ctx.refresh();
    }
  }

  function attachmentsAsArray(ctx, att) {
    const r = [];
    let i = 0;
    for (const key in att) {
      r.push(att[key]);
      r[i].name = key;
      r[i].filename = key;
      r[i].url = encodeURI(`${ctx.docUrl}/${key}`);
      i++;
    }
    ctx.lastAttachmentsResult = r;
    return r;
  }

  function getName(options) {
    return options.name || options.filename;
  }

  return CouchdbAttachments;
});
