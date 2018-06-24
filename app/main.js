const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron')
const path = require('path')
const url = require('url')

// Start the program when app is ready
app.on('ready', function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        show: false, // Show and maximize later
        icon: path.join(__dirname, 'assets', 'icons', 'main_icon.ico'),
        resizable: true,
    })

    // Load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'src', 'index.html'),
        protocol: 'file:',
        slashes: true,
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
                },
                {
                    label: 'Shuffle',
                    accelerator: 's',
                    click() {
                        win.webContents.send('shuffle')
                    }
                },
                {
                    label: 'Loop',
                    accelerator: 'l',
                    click() {
                        win.webContents.send('loop')
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

        // Handle loading of file when opened with electron
        let path_arg = process.argv[1]
        if (path_arg !== '.' && path_arg !== undefined) {
            win.webContents.send("open", path_arg)
        }

        // Show and maximize
        win.show()
    })

    // Handle window min size
    ipcMain.on('init_size', (e, width, height) => {
        width = Math.round(width)
        height = Math.round(height)
        win.setContentSize(width, height - 1)
        win.setMinimumSize(win.getSize()[0], win.getSize()[1] + 20)
    })

    // Handle window resize
    ipcMain.on('resize_window', (e, width, height) => {
        if (win.isMaximized()) {
            win.webContents.send('resize_video')
            return
        }
        width = Math.round(width)
        height = Math.round(height)
        win.setContentSize(width, height)
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