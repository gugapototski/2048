Function.prototype.bind = Function.prototype.bind || function polyfillBind(target) {
  var self = this;
  return function boundFunction(args) {
    if (!(args instanceof Array)) {
      args = [args];
    }
    self.apply(target, args);
  };
};
