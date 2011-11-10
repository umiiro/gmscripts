// ==UserScript==
// @name           クックパッドをEvernoteに送るボタン
// @namespace      cookpad
// @include        http://cookpad.com/recipe/*
// @require        http://static.evernote.com/noteit.js
// ==/UserScript==

// trap iframe (mostly ad)
if (window != window.top) return;

function searchTag(tagName, parentNode) {
	var i, item
	    nodes  = parentNode.childNodes,
	    tagpat = new RegExp("^" + tagName + "$", "i");
	var length = nodes.length;

	for (i = 0; i < length; i++) {
		item = nodes[i];
		if (item.nodeName.search(tagpat) != -1) {
			return item;
		}
	}

	return null;
}

function addButton() {
	var img = document.createElement("img");
	img.setAttribute("src", 'http://static.evernote.com/article-clipper-jp.png');
	img.setAttribute("alt", 'Evernoteにクリップ');

	var a = document.createElement("a");
	a.setAttribute("href", '#');
	a.addEventListener("click", function(){
		clip.get(function(doc){
			Evernote.doClip({
				title: clip.title,
				suggestTags: 'クックパッド',
				content: doc.getElementById("print_container")
			});
			console.log(doc.body);
		});
		return false;
	});
	a.appendChild(img);

	var li = document.createElement("li");
	li.appendChild(a);

	var ul = searchTag("ul", document.getElementById('_footstamp_tools'));

	ul.insertBefore(li, ul.firstChild);
}

function LazyLoadable() {};
LazyLoadable.prototype = {
	get: function(complete) {
		if (this.args) {
			complete.apply(this, this.args);
			return;
		} else {
			var callback = this.callback || [];

			if (complete) {
				callback[callback.length] = complete;
			}

			if (!this.callback) {
				this.callback = callback;
				this.onload(this);
			}
		}
	},
	dispatch: function(args) {
		var doc, i, length
		    callback = this.callback;

		this.args = args;

		length = callback.length;
		for (i = 0; i < length; i++) {
			callback[i].apply(this, this.args);
		}
	}
};

var clip = new LazyLoadable();
clip.onload = function(self) {
	var iframe, src,
	    body = document.body;

	this.title = document.title.split(/\[.*\]/)[0].trim();
	src = location.pathname.replace("recipe", "recipe/print");

	iframe = document.createElement("iframe");
	iframe.setAttribute("src", this.src);
	iframe.style.display = "none";
	iframe.addEventListener("load", function(){
		var doc = iframe.contentDocument
		          || iframe.contentWindows.document;
		self.dispatch([doc]);
		body.removeChild(iframe);
	}, false);
	body.appendChild(iframe);
};

addButton();
clip.get();
