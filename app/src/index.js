const { ipcRenderer } = require('electron')
const path = require('path')
const url = require('url')
const trash = require('trash')
const fs = require('fs')

// Create object to handle file
class File_C {

    constructor() {
        this.Opened = false
    }

    // Open file and store data
    Open(file_path) {
        if (file_path === undefined) {
            return
        }
        this.Opened = true
        this.Dir = path.dirname(file_path)
        this.Name = path.basename(file_path)
        this.Index = this.List.indexOf(this.Name)

        // Load the audio
        Audio.Load(file_path)
    }

    // Get the file path
    get Path() {
        if (this.Opened) {
            return path.join(this.Dir, this.Name)
        }
    }

    get List() {
        if (this.Opened) {
            let file_list = fs.readdirSync(this.Dir).filter((file) => {
                return Audio.Format_List.includes(path.extname(file.toLowerCase()))
            })
            return file_list
        }
    }


    Delete() {
        if (!this.Opened) {
            return
        }
        let cur_file = path.basename(Audio.Elem.src)
        if (cur_file === this.Name) {
            trash(File.Path).then(() => {
                this.Open(this.Get(0, false))
            })
        }
    }

    // Get file path from a list of files at an increment from the current file path
    Get(increment, wrap) {
        // Return if a file has not been opened
        if (!this.Opened) {
            return
        }
        let list = this.List
        if (list.length < 1) {
            return
        }
        let dir = this.Dir
        let ind = this.Index + increment

        if (wrap) {
            // Wrap index for array
            ind = ((ind % list.length) + list.length) % list.length;
        } else {
            // Limit to file list
            ind = ind < 0 ? 0 : ind >= list.length ? list.length - 1 : ind
        }
        return path.join(dir, list[ind])
    }
}
var File = new File_C

class Audio_C {

    constructor() {
        this.Elem = document.getElementById('audio')
        this.Format_List = [
            '.mp3',
            '.wav',
            '.ogg',
            '.flac'
        ]
        this.Playing = false
    }

    Load(file_path) {
        this.Elem.src = file_path
        if (this.Playing) {
            this.Play()
        }
    }

    Play() {
        this.Elem.play()
        this.Playing = true
    }

    Pause() {
        this.Elem.pause()
        this.Playing = false
    }

    Play_Pause() {
        if (this.Playing) {
            this.Pause()
        } else {
            this.Play()
        }
    }



}
var Audio = new Audio_C

File.Open(path.join(__dirname, '../../test/test.mp3'))
Audio.Play()

// Handle main process events
ipcRenderer.on("play_pause", (e) => {
    if (File.Opened) {
        Audio.Play_Pause()
    }
})