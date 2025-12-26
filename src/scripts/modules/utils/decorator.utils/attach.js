let attach = function (Decorator, parent, options) {
    let name = options.name;
    if (!name) {
        console.error('decorator has to provide "name" option');
        return;
    }

    if (!parent._decorators) {
        parent._decorators = {};
    }
    if (!parent._decorators[name]) {
        parent._decorators[name] = new Decorator(parent, options);
        parent._decorators[name].init();
    }

    let decorator = parent._decorators[name];

    return decorator;
};

export default attach;