import dispatcher from '../dispatcher';

const itemsDrop = new Map();
const itemsDown = new Map();


let wasActive = {
    status: false,
    id: null
};

let isActive = {
    status: false,
    id: null
};

const _handleClose = () => {
    for (const item of itemsDrop.values()) {
        if (item.active) {
            item.active = false;
            item.parent.classList.remove('active');
        }
    }
};

const _handleChange = (id, e) => {
    e.preventDefault();
    if (!itemsDrop.get(id).active) {
        for (const item of itemsDrop.values()) {

            if (item.active) {
                item.active = false;
                item.parent.classList.remove('active');
            }
        }

        itemsDrop.get(id).active = true;
        itemsDrop.get(id).parent.classList.add('active');

        isActive.status = true;
        isActive.id = id;

    } else {

        itemsDrop.get(id).active = false;
        itemsDrop.get(id).parent.classList.add('is-animation');

        isActive.status = false;
        isActive.id = id;

        setTimeout(() => {
            itemsDrop.get(id).parent.classList.remove('active');
            itemsDrop.get(id).parent.classList.remove('is-animation');
        }, 400)
    }
};

const _handleChangeItem = (target, id, e) => {

    const item = itemsDrop.get(id);
    item.headText.textContent = target.textContent;
    item.parent.classList.add('is-success');


    item.active = false;
    item.parent.classList.add('is-animation');

    setTimeout(() => {
        item.parent.classList.remove('active');
        item.parent.classList.remove('is-animation');
    }, 400)
}

const _add = (items, element) => {
    let id = element.dataset.drop;
    let parent = element.parentElement;
    let headText = element.querySelector('.dropdown__headerText');

    if (items === itemsDown) {
        let dropItems = Array.from(element.querySelectorAll('.js-drop-down-item'));
        let dropItemsHeight = element.height;

        for (const item of dropItems.values()) {
            item.addEventListener('click', _handleChangeItem.bind(null, item, id));
        }

        items.set(id, {id, element, dropItems, parent, headText, dropItemsHeight})
    } else {
        element.addEventListener('click', _handleChange.bind(null, id));
        items.set(id, {id, element, parent, headText})
    }
};

const _handleMutate = () => {
    const check = (items, element) => {
        for (const item of items.values()) {
            if (item.element === element) return;
        }
        _add(items, element);
    };

    const backCheck = (items, item, elements) => {
        for (const element of elements) {
            if (element === item.element) return;
        }
        items.delete(item.id);
    };

    const elementsDrop = Array.from(document.querySelectorAll('.js-dd-head'));
    for (const element of elementsDrop) {
        check(itemsDrop, element);
    }
    for (const item of itemsDrop.values()) {
        backCheck(itemsDrop, item, elementsDrop)
    }

    const elementsDown = Array.from(document.querySelectorAll('.js-dd-bottom'));
    for (const element of elementsDown) {
        check(itemsDown, element);
    }
    for (const item of itemsDown.values()) {
        backCheck(itemsDown, item, elementsDown);
    }

    document.addEventListener('click', function (event) {
        let target = event.target;

        if (!isActive.status) return;

        if (target.classList.contains('.dropdown')
            || target.closest('.dropdown__header')
            || target.closest('.dropdown__item')) {
        } else {

            itemsDrop.get(isActive.id).active = false;
            itemsDrop.get(isActive.id).parent.classList.add('is-animation');

            setTimeout(() => {
                itemsDrop.get(isActive.id).parent.classList.remove('active');
                itemsDrop.get(isActive.id).parent.classList.remove('is-animation');
            }, 400)
        }
    })
};

const init = () => {
    _handleMutate();
    dispatcher.subscribe(function (e) {
        if (e.type === 'mutate') {
            _handleMutate();
        }
        // console.log(e);
        if (e.type === 'popup:close-all') {
            _handleClose();
        }
    });
};

export default {init}
