var _class, _descriptor, _temp;

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and set to use loose mode. ' + 'To use proposal-class-properties in spec mode with decorators, wait for ' + 'the next major version of decorators in stage 2.'); }

let C = (_class = (_temp = class C {
  constructor() {
    _initializerDefineProperty(this, "name", _descriptor, this);
  }

  method() {}

  getData() {}

}, _temp), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "name", [readonly], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return 'ym';
  }
}), _applyDecoratedDescriptor(_class.prototype, "method", [unenumerable, readonly], Object.getOwnPropertyDescriptor(_class.prototype, "method"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getData", [unenumerable], Object.getOwnPropertyDescriptor(_class.prototype, "getData"), _class.prototype)), _class);

function readonly(target, name, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

function unenumerable(target, name, descriptor) {
  descriptor.enumerable = false;
  return descriptor;
}
