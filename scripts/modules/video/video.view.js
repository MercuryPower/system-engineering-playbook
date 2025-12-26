import dispatcher from '../dispatcher';

let items = new Map();
let idName = 'video-control-id-';
let idNum  = 1;
let playing = false;
const regExp = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/;

const _handleChange = (id) => {
	items.get(id).element.classList.add('active');
	items.get(id).videoContainer.appendChild(items.get(id).player.getIframe());
	playing = true;
};

const _add = (items, element) => {
	let id = element.getAttribute('data-id');

	let button = element.querySelector('.yt-button');

	let videoString = element.dataset.videoId;
	let previewImageUrl = element.dataset.preview;
	let videoID = videoString.match(regExp)[1];
	let videoContainer = element.querySelector('.yt-in');
	let previewImage = element.querySelector('.yt-preview');

	let container = document.createElement('div');
	let player = new YT.Player(container, {
		playerVars: {
			rel: 0,
			showInfo: 0,
			modestbranding: 1
		},
		events: {
			onStateChange: function(e) {
				if (e.data === 0 || e.data === 2) _stop();
			},
			onReady: function() {
				player.loadVideoById(videoID);
				player.playVideo();
			}
		}
	});

	function _stop() {
		player.pauseVideo();
		playing = false;
	}

	if (previewImageUrl && previewImageUrl !== '') {
		previewImage.style.backgroundImage = `url( ${previewImageUrl} )`;
	}

	// let url = `https://img.youtube.com/vi/${videoID}/maxresdefault.jpg`;

	if (!id) {
		id = idName + idNum;
		idNum++;
	}

	if (button) button.addEventListener('click', _handleChange.bind(null, id));

	items.set(id, { id, element, videoContainer, player });
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

	const elements = Array.from(document.querySelectorAll('.yt-wr'));

	for (const element of elements) {
		check(items, element);
	}
	for (const item of items.values()) {
		backCheck(items, item, elements)
	}
};

const init = () => {
	window.onYouTubePlayerAPIReady = () => _handleMutate();

	const tag = document.createElement('script');
	tag.src = "https://www.youtube.com/player_api";
	tag.async = true;
	const firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	dispatcher.subscribe((e) => {
		if (e.type === 'dom:ready') {
			_handleMutate();
		}
	});
};

export default { init }
