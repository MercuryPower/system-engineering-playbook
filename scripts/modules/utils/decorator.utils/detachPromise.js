let detachPromise = function (parent, options) {
    let name = options.name;
    if (!name) {
        console.error('decorator has to provide "name" option');
        return;
    }

    let decorator = parent._decorators[name];

    return decorator.destroy()
    .then(() => {
    	delete parent._decorators[name];
    });
};

export default detachPromise;