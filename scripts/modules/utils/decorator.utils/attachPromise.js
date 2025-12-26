let attachPromise = function (Decorator, parent, options) {
    let promise = new Promise(function (resolve, reject) {
        let name = options.name;
        let decorator;

        if (!name) {
            console.error('decorator has to provide "name" option');
            return;
        }

        if (!parent._decorators) {
            parent._decorators = {};
        }

        if (parent._decorators[name]) {
            decorator = parent._decorators[name];
            resolve(decorator);
        } else {
            decorator = new Decorator(parent, options);
            parent._decorators[name] = decorator;
            decorator.init().then(function () {
                resolve(decorator);
            });
        }
    });

    return promise;
};

export default attachPromise;