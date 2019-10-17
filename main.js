const path = require('path')
const url = require('url')
const {app, BrowserWindow, Menu, Tray } = require('electron')
const ffi = require('ffi')

let mainWindow = null;
let tray = null;

function createWindow () {
	tray = new Tray("D:/ti/xdctools_3_50_03_33_core/packages/xdc/productview/icons/sdb.ico")
	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Open Window',
			click: function() {
				mainWindow.show();
			}
		},
		{
			label: 'Quit Vender',
			click: function() {
				mainWindow.close();
			}
		}
	])
	tray.setIgnoreDoubleClickEvents(true)
	tray.setToolTip('Vender')
	tray.setContextMenu(contextMenu)
	tray.on('click', function(e){
		mainWindow.show();
	})

	mainWindow = new BrowserWindow({
		width: 1280,
		height: 720,
		frame: false,
		center: true,
		resizable: false,
		show: false,
		backgroundColor: '#dddddd',
		webPreferences: {
			webSecurity: false,
			nodeIntegration: true
		}
	});
	// mainWindow.webContents.openDevTools()

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}))


	mainWindow.once('ready-to-show', () => {
			mainWindow.show()
	})

	mainWindow.on('show', function(){
		tray.setHighlightMode('always');
	})
	mainWindow.on('closed', function () {
		// Dereference the window object.
		mainWindow = null
		tray.setHighlightMode('never');
	})
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) createWindow()
})