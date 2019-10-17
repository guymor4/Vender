const fs = require('fs');
const path = require('path')
const remote = require("electron").remote;
const spawn = require('child_process').spawn;
var utils = require('vender-utils')

var app = undefined;
var Options = {};
var OptionsView = {};

function start_file(file_path) {
	return spawn('start', ['""', '"""' + file_path + '""" ' ], { shell: true, detached: true })
}

function expand_path(path) {
	if(!path)
		return path;
	return path.replace(/%([^%]+)%/g, (_,n) => process.env[n])
}

function add_options_from_dirlist(base_path, dirlist) {
	for (var i = 0; i < dirlist.length; i++) {
		var lnk = path.join(base_path, dirlist[i]);
		var program_name = path.basename(lnk, path.extname(lnk));

		new_option = { path: lnk, icon: '', target: '', desc : '' };
		new_option.target = expand_path(utils.ResolveLnk(lnk));
		console.log(lnk, new_option.target);
		if(!new_option.target || !fs.existsSync(new_option.target)) {
			continue;
		}
		new_option.icon = utils.ExtractIconAsBase64(lnk);
		Options[program_name] = new_option;
	}
}

function add_shortcuts_from_dir(raw_dir_path) {
	var dir_path = expand_path(raw_dir_path);
	lnk_files = fs.readdirSync(dir_path).filter(entry => entry.endsWith('.url') || entry.endsWith('.lnk'));
	add_options_from_dirlist(dir_path, lnk_files);
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
			console.log(selectedOption.path);
			start_file(selectedOption.path)
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
	var start_menu_links = add_shortcuts_from_dir('%PROGRAMDATA%\\Microsoft\\Windows\\Start Menu\\Programs')
	var desktop_links = add_shortcuts_from_dir('%USERPROFILE%\\desktop')
	var desktop_links = add_shortcuts_from_dir('%PUBLIC%\\desktop')
	var desktop_links = add_shortcuts_from_dir('%AppData%\\Microsoft\\Windows\\Recent')

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

