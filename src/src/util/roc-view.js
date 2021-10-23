'use strict';

define(['./util'], function (Util) {
  const ANON_READ = 'anonymousRead';

  class RocView {
    constructor(view, manager) {
      this.view = view;
      this.manager = manager;
      this._revision = null;
    }

    get content() {
      return this.view.$content;
    }

    get creationDate() {
      return new Date(this.view.$creationDate);
    }

    get flavors() {
      return this.content.flavors;
    }

    get flavorNumber() {
      return Object.keys(this.content.flavors).length;
    }

    get id() {
      return this.view._id;
    }

    get modificationDate() {
      return new Date(this.view.$modificationDate);
    }

    get owner() {
      return this.view.$owners[0];
    }

    get owners() {
      return this.view.$owners.slice(1).filter(Util.isEmail);
    }

    get revid() {
      return this.view._rev;
    }

    get size() {
      let size = 0;
      const attachments = this.view._attachments;
      if (attachments) {
        for (const att in attachments) {
          size += attachments[att].length || (attachments[att].data.length * 0.75);
        }
      }
      return size;
    }

    get title() {
      return this.content.title || '';
    }

    get keywords() {
      return this.content.keywords || [];
    }

    get icon() {
      return this.content.icon;
    }

    get name() {
      return this.content.name;
    }

    get category() {
      return this.content.category;
    }

    get version() {
      return this.content.version || '0.0.0';
    }

    get public() {
      return this.view.$owners.indexOf(ANON_READ) !== -1;
    }

    getPath(flavor) {
      const path = this.flavors[flavor].slice(0, -1);
      return `/${path.join('/')}`;
    }

    hasFlavor(name) {
      return !!this.flavors[name];
    }

    hasView() {
      return this.view._attachments && this.view._attachments['view.json'];
    }

    hasData() {
      return this.view._attachments && this.view._attachments['data.json'];
    }

    getViewUrl() {
      var query = this._revision ? `?rev=${this._revision}` : '';
      return this.hasView() ? `${this.manager.rocDbUrl}/entry/${this.id}/view.json${query}` : null;
    }

    getDataUrl() {
      var query = this._revision ? `?rev=${this._revision}` : '';
      return this.hasData() ? `${this.manager.rocDbUrl}/entry/${this.id}/data.json${query}` : null;
    }

    getViewSwitcher() {
      return {
        view: { url: this.getViewUrl() },
        data: { url: this.getDataUrl() }
      };
    }

    moveTo(folder) {
      var newPath = folder.data.path;
      var flavor = newPath[0];

      var currentPath = this.flavors[flavor];
      var name = currentPath[currentPath.length - 1];
      this.flavors[flavor] = newPath.slice(1).concat(name);
      return this.save().then(retTrue, retFalse);
    }

    save() {
      const afterRes = (res) => {
        this.view._id = res.body.id;
        return this.reload().catch(() => {
          // In the rare case where the GET request fails,
          // just replace the most important items
          this.view._rev = res.body.rev;
          this.view.$modificationDate = res.body.$modificationDate;
          this.view.$creationDate = res.body.$creationDate;
        });
      };

      if (this.id) {
        return this.manager.putRequestDB(`/entry/${this.id}`, this.view)
          .then(afterRes);
      } else {
        return this.manager.postRequestDB('/entry/', this.view)
          .then(afterRes);
      }
    }

    saveView(view) {
      const oldTitle = this.title;
      const oldVersion = this.version;
      let oldAttachment;
      if (this.hasView()) {
        oldAttachment = this.view._attachments['view.json'];
      }
      this.content.title = view.title;
      this.content.version = view.version;
      this.content.keywords = view.keywords;
      this.content.icon = view.icon;
      this.content.name = view.name;
      this.content.category = view.category;
      if (!this.view._attachments) {
        this.view._attachments = {};
      }
      this.view._attachments['view.json'] = view.attachment;
      return this.save()
        .then(retTrue, () => {
          this.content.title = oldTitle;
          this.content.version = oldVersion;
          if (oldAttachment) {
            this.view._attachments['view.json'] = oldAttachment;
          }
          return false;
        });
    }

    remove() {
      const del = this.view.$deleted;
      this.view.$deleted = true;
      return this.save()
        .then(retTrue, () => {
          if (typeof del === 'boolean') {
            this.view.$deleted = del;
          }
          return false;
        });
    }

    getName(flavor) {
      var path = this.flavors[flavor];
      return path[path.length - 1];
    }

    rename(flavor, newName) {
      var path = this.flavors[flavor];
      var currentName = path[path.length - 1];
      path[path.length - 1] = newName;
      return this.save().then(retTrue, function () {
        path[path.length - 1] = currentName;
        return false;
      });
    }

    toggleFlavor(flavor, currentFlavor) {
      if (this.flavors[flavor]) {
        if (this.flavorNumber === 1) {
          return Promise.resolve({ state: 'err-one' });
        }
        const oldValue = this.flavors[flavor];
        delete this.flavors[flavor];
        return this.save().then(() => ({ state: 'removed' }), () => {
          this.flavors[flavor] = oldValue;
          return false;
        });
      } else {
        const name = this.flavors[currentFlavor][this.flavors[currentFlavor].length - 1];
        this.flavors[flavor] = [name];
        return this.save().then(() => ({ state: 'added', name }), () => {
          delete this.flavors[flavor];
          return false;
        });
      }
    }

    addGroup(name) {
      return this.manager.putRequestDB(`/entry/${this.id}/_owner/${name}`).then(() => this.reload()).then(retTrue, retFalse);
    }

    removeGroup(name) {
      return this.manager.deleteRequestDB(`/entry/${this.id}/_owner/${name}`).then(() => this.reload()).then(retTrue, retFalse);
    }

    reload() {
      return this.manager.getRequestDB(`/entry/${this.id}`)
        .then((getRes) => (this.view = getRes.body));
    }

    togglePublic() {
      if (this.view.$owners.indexOf(ANON_READ) === -1) {
        return this.addGroup(ANON_READ);
      } else {
        return this.removeGroup(ANON_READ);
      }
    }

    getRevisions(force) {
      if (this._revs && !force) return this._revs;
      this._revs = this.manager.getRequestDB(`/entry/${this.id}`, { revs_info: true })
        .then((doc) => doc.body._revs_info.filter((rev) => rev.status === 'available').map((rev) => rev.rev));
      return this._revs;
    }

    setRevision(rev) {
      this._revision = rev;
    }

    getRevisionData(rev) {
      return this.manager.getRequestDB(`/entry/${this.id}?rev=${rev}`)
        .then((getRes) => getRes.body);
    }
  }

  return RocView;

  function retTrue() {
    return true;
  }

  function retFalse() {
    return false;
  }
});
