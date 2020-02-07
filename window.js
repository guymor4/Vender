const fs = require('fs');
const path = require('path')
const remote = require("electron").remote;
const spawn = require('child_process').spawn;
var utils = require('vender-utils')

var app = undefined;
var Options = {};
var OptionsView = {};

function Option (original_path, icon, target, source, desc) {
	this.original_path = original_path;
	this.icon = icon;
	this.target = target;
	this.source = source;
	this.desc = desc;
	console.log(this)
	return this;
}

function start_file(file_path) {
	return spawn('start', ['""', '"""' + file_path + '""" ' ], { shell: true, detached: true })
}

function expand_path(path) {
	if(!path)
		return path;
	return path.replace(/%([^%]+)%/g, (_,n) => process.env[n])
}

function collect_options_from_dirlist(lnk_filepaths, source) {
	for (var i in lnk_filepaths) {
		var lnk = lnk_filepaths[i];
		var program_name = path.basename(lnk, path.extname(lnk));
		
		target = expand_path(utils.ResolveLnk(lnk));
		console.log(lnk, target);
		if(!target || !fs.existsSync(target)) {
			continue;
		}

		icon = utils.ExtractIconAsBase64(lnk);
		Options[program_name] = new Option(original_path=lnk, icon=icon, target=target, source=source, desc='');
	}
}

function get_shortcuts_from_folder(folder_path) {
	if (!fs.existsSync(folder_path)){
		console.error(folder_path, 'does not exists!')
		return [];
	}
	return fs.readdirSync(folder_path).filter(entry => entry.endsWith('.url') || entry.endsWith('.lnk')).map(entry => expand_path(path.join(folder_path, entry)));
}

document.addEventListener("keydown", event => {
	switch (event.key) {
		case "Escape":
			remote.getCurrentWindow().close();
			break;
		case 'ArrowUp':
			app.selectedIndex = Math.max(app.selectedIndex - 1, 0)
			console.log(app.selectedIndex);
			scroll_to_view_if_hidden();
			break;
		case 'ArrowDown':
			app.selectedIndex = Math.min(app.selectedIndex + 1, Object.keys(OptionsView).length - 1)
			console.log(app.selectedIndex);
			scroll_to_view_if_hidden();
			break;
		case 'Enter':
			var selectedOption = Object.values(OptionsView)[app.selectedIndex];
			console.log(selectedOption.target);
			start_file(selectedOption.target)
			remote.getCurrentWindow().close();
			break;
	}
});

function scroll_to_view_if_hidden() {
	// const y = document.querySelector('.option-row[index="' + app.selectedIndex + '"]').getBoundingClientRect().top + window.scrollY;
	// window.scroll({
	// 	top: y,
	// 	behavior: 'smooth'
	// });
	document.querySelector('.option-row[index="' + app.selectedIndex + '"]').scrollIntoViewIfNeeded(false);
}

function update_suggestions() {
	for (var key in OptionsView) {
		app.$delete(OptionsView, key);
	}

	var searchValue = document.getElementById('search-input').value.toLowerCase();
	for (var key in Options) {
		if (key.toLowerCase().indexOf(searchValue) >= 0) {
			app.$set(OptionsView, key, Options[key])
		}
	}

	app.selectedIndex = Math.min(app.selectedIndex, Object.keys(OptionsView).length - 1)
}

function main() {
	for (var i in LNK_SOURCES) {
		var lnk_source = LNK_SOURCES[i]
		var lnk_filepaths = get_shortcuts_from_folder(expand_path(lnk_source.path));
		collect_options_from_dirlist(lnk_filepaths, lnk_source.source);
	}

	app = new Vue({ 
			el: '#app',
			data: {
				option_list : OptionsView,
				selectedIndex : 0
			},
			mounted: function() {
				document.getElementById('search-input').focus();
			},	methods: {
				highlight(inputText) {
					var searchValue = document.getElementById('search-input').value.toLowerCase();
					let found = inputText.toLowerCase().indexOf(searchValue);
					if (found >= 0) {
						var foundStr = inputText.substring(found, found + searchValue.length);
						return inputText.replace(foundStr, '<b>' + foundStr + '</b>');
					} else {
						return inputText;
					}
				}
			}
	});

	update_suggestions();
}

main();

