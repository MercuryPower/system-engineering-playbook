// XMLHttp запросы
// поддерживает get, post, put, delete
// http(url).get(data, type)
// data - payload
// type - только для post и put - urlencoded или json
// для get и delete только urlencoded

var http = function(url) {
	var core = {
		ajax: function(method, url, args, type) {
			var promise = new Promise(function(resolve, reject) {
				var client = new XMLHttpRequest();
				var query;
				var json;
				var argcount;
				var key;
				var entries;

				client.onload = function () {
					if (this.status >= 200 && this.status < 300 || this.status === 404) {
						resolve(this.response);
					} else {
						console.warn('xhr status error (╯ಠ_ಠ)╯︵ ┻━┻');
						reject(this.statusText);
					}
				}
				client.onerror = function () {
					if (this.status === 404) {
						resolve(this.response);
					} else {
						console.warn('xhr error (╯ಠ_ಠ)╯︵ ┻━┻');
						reject(this.statusText);
					}
				}

				if (!args) {
					client.open(method, url);
					client.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
					client.send();
				} else {
					if (!type || type === 'urlencoded') {
						query = '';
						argcount = 0;
						for (key in args) {
							if (args.hasOwnProperty(key)) {
								if (argcount++) {
									query += '&';
								}
								query += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
							}
						}
					} else if (type === 'json') {
						json = {};
						args.forEach(function(value, key){
						    json[key] = value;
						});
						json = JSON.stringify(json);

						// entries = args.entries();
						// json = {};
						// for (var entry of entries) {
						//     json[entry[0]] = entry[1];
						// }
						// json = JSON.stringify(json);
					}

					if ((method === 'GET' || method === 'DELETE')) {
						client.open(method, url + '?' + query);
						client.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
						client.send();
					} else {
						client.open(method, url);
						client.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
						if (type === 'json') {
							client.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
							client.send(json);
						} else if (type === 'urlencoded') {
							client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
							client.send(query);
						} else {
							client.send(args);
						}
					}
				}
			});
			return promise;
		}
	}

	return {
		'get': function(args, type) {
			return core.ajax('GET', url, args, type);
		},
		'post': function(args, type) {
			return core.ajax('POST', url, args, type);
		},
		'put': function(args, type) {
			return core.ajax('PUT', url, args, type);
		},
		'delete': function(args, type) {
			return core.ajax('DELETE', url, args, type);
		}
	}
}


export default http;