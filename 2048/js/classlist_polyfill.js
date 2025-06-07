// (function classListPolyfill() {
//   if (typeof window.Element === "undefined" ||
//       "classList" in document.documentElement) {
//     return;
//   }

//   var prototype = Array.prototype,
//       push = prototype.push,
//       splice = prototype.splice,
//       join = prototype.join;

//   function DOMTokenList(el) {
//     this.el = el;
//     // The className needs to be trimmed and split on whitespace
//     // to retrieve a list of classes.
//     var classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
//     for (var i = 0; i < classes.length; i++) {
//       push.call(this, classes[i]);
//     }
//   }

//   DOMTokenList.prototype = {
//     add: function add(token) {
//       if (this.contains(token)) return;
//       push.call(this, token);
//       this.el.className = this.toString();
//     },
//     contains: function contains(token) {
//       return this.el.className.indexOf(token) != -1;
//     },
//     item: function item(index) {
//       return this[index] || null;
//     },
//     remove: function remove(token) {
//       if (!this.contains(token)) return;
//       for (var i = 0; i < this.length; i++) {
//         if (this[i] == token) break;
//       }
//       splice.call(this, i, 1);
//       this.el.className = this.toString();
//     },
//     toString: function toStringOverride() {
//       return join.call(this, ' ');
//     },
//     toggle: function toggle(token) {
//       if (!this.contains(token)) {
//         this.add(token);
//       } else {
//         this.remove(token);
//       }

//       return this.contains(token);
//     }
//   };

//   window.DOMTokenList = DOMTokenList;

//   function defineElementGetter(obj, prop, getter) {
//     if (Object.defineProperty) {
//       Object.defineProperty(obj, prop, {
//         get: getter
//       });
//     } else {
//       obj.__defineGetter__(prop, getter);
//     }
//   }

//   defineElementGetter(HTMLElement.prototype, 'classList', function classListGetter() {
//     return new DOMTokenList(this);
//   });
// })();


(() => {
  if (typeof window.Element === 'undefined' || 'classList' in document.documentElement) {
    return;
  }

  const push = Array.prototype.push;
  const splice = Array.prototype.splice;
  const join = Array.prototype.join;

  // Defino a classe usando sintaxe ES6
  class DOMTokenList {
    constructor(el) {
      this.el = el;
      // obtém lista de classes, trim e split em whitespace
      const classes = el.className.trim().split(/\s+/);
      classes.forEach((cls) => push.call(this, cls));
    }

    add(token) {
      if (this.contains(token)) return;
      push.call(this, token);
      this.el.className = this.toString();
    }

    contains(token) {
      // Poderia usar: return this.el.className.split(/\s+/).includes(token);
      return this.el.className.indexOf(token) !== -1;
    }

    item(index) {
      return this[index] || null;
    }

    remove(token) {
      if (!this.contains(token)) return;
      let i = 0;
      while (i < this.length) {
        if (this[i] === token) break;
        i++;
      }
      splice.call(this, i, 1);
      this.el.className = this.toString();
    }

    toString() {
      return join.call(this, ' ');
    }

    toggle(token) {
      if (!this.contains(token)) {
        this.add(token);
      } else {
        this.remove(token);
      }
      return this.contains(token);
    }
  }

  window.DOMTokenList = DOMTokenList;

  // define getter para HTMLElement.prototype.classList
  const defineElementGetter = (obj, prop, getter) => {
    if (Object.defineProperty) {
      Object.defineProperty(obj, prop, {
        get: getter
      });
    } else {
      // fallback para navegadores muito antigos
      obj.__defineGetter__(prop, getter);
    }
  };

  defineElementGetter(HTMLElement.prototype, 'classList', function classListGetter() {
    return new DOMTokenList(this);
  });
})();
