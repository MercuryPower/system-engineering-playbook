const init = () => {
    const images = window.document.querySelectorAll('video, img, source');
    const config = {
        rootMargin: '300px 0px',
        threshold: 0.01
    };

    let onIntersection = (entries) => {
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
                observer.unobserve(entry.target);
                preloadImage(entry.target);
            }
        });
    };

    let observer;
    if (!('IntersectionObserver' in window)) {
        Array.from(images).forEach(image => preloadImage(image));
    }
    else {
        observer = new IntersectionObserver(onIntersection, config);
        images.forEach(image => {
            observer.observe(image);
        });
    }

    let preloadImage = (element) => {
        if (element.dataset && element.dataset.src) {
            element.src = element.dataset.src;
        }
        if (element.dataset && element.dataset.srcset) {
            element.srcset = element.dataset.srcset
        }
    };
};

export default { init }
