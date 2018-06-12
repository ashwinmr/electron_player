const { app, BrowserWindow, Menu, dialog } = require('electron')
const path = require('path')
const url = require('url')

// Start the program when app is ready
app.on('ready', function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        show: false, // Show and maximize later
        icon: path.join(__dirname, 'assets', 'icons', 'main_icon.ico')
    })

    // Load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'src', 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Create the menu
    const menu = Menu.buildFromTemplate([{
            label: 'File',
            submenu: [{
                    // Open dialog
                    label: 'Open',
                    accelerator: 'Ctrl+o',
                    click() {
                        dialog.showOpenDialog({
                                title: "Open",
                            },
                            (file_paths) => {
                                if (file_paths !== undefined) {
                                    win.webContents.send("open", file_paths[0])
                                }
                            }
                        )
                    }
                },
                {
                    // Quit
                    label: 'Quit',
                    accelerator: 'ctrl+q',
                    click() {
                        win.close()
                    }
                },
            ]
        },
        {
            label: 'Edit',
            submenu: [{
                    label: 'Play/Pause',
                    accelerator: 'Space',
                    click() {
                        win.webContents.send('play_pause')
                    }
                },
                {
                    label: 'Seek+',
                    accelerator: 'right',
                    click() {
                        win.webContents.send('seek_plus')
                    }
                },
                {
                    label: 'Seek-',
                    accelerator: 'left',
                    click() {
                        win.webContents.send('seek_minus')
                    }
                },
                {
                    label: 'Next',
                    accelerator: 'up',
                    click() {
                        win.webContents.send('next')
                    }
                },
                {
                    label: 'Previous',
                    accelerator: 'down',
                    click() {
                        win.webContents.send('previous')
                    }
                }
            ]
        },
        {
            label: 'Help',
            // Allow opening browser dev tool
            submenu: [{
                label: 'DevTool',
                accelerator: 'Ctrl+D',
                click() {
                    win.webContents.toggleDevTools()
                }
            }]
        }
    ])

    // Set menu
    Menu.setApplicationMenu(menu)

    // Perform actions after window is loaded
    win.webContents.on('did-finish-load', () => {
        // Show and maximize
        win.show()
    })
})



// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})