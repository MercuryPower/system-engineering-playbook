let update = function (parent, options) {
    let name = options.name;
    if (!name) {
        console.error('decorator has to provide "name" option');
        return;
    }

    let decorator = parent._decorators[name];
    decorator._options = Object.assign(decorator._options, options);

    return decorator;
};

export default update;