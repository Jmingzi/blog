class C {
  @unenumerable
  @readonly
  method () {}

  @unenumerable
  getData () {}
}

function readonly(target, name, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

function unenumerable(target, name, descriptor) {
  descriptor.enumerable = false;
  return descriptor;
}
