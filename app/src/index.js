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
        this.Shuffling = false

        // Load the audio
        Audio.Load(file_path)
    }

    // Get the file path
    get Path() {
        if (!this.Opened) {
            return
        }
        return path.join(this.Dir, this.Name)
    }

    get List() {
        if (!this.Opened) {
            return
        }
        let file_list = fs.readdirSync(this.Dir).filter((file) => {
            return Audio.Format_List.includes(path.extname(file.toLowerCase()))
        })
        return file_list
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

    Shuffle() {
        if (!this.Opened) {
            return
        }
        if (this.Shuffling) {
            this.Shuffling = false;
            document.getElementById('shuffle_btn').classList.remove('toggled');
        } else {
            this.Shuffling = true;
            document.getElementById('shuffle_btn').classList.add('toggled');
        }
    }
}
var File = new File_C

class Audio_C {

    constructor() {
        this.Elem = document.getElementById('audio')
        this.Loaded = false
        this.Looping = false
        this.Format_List = [
            '.mp3',
            '.wav',
            '.ogg',
            '.flac'
        ]
        this.Elem.addEventListener('timeupdate', () => {
            if (this.Elem.currentTime === this.Elem.duration) {
                if (this.Looping) {
                    this.Seek_Percent(0)
                    this.Play()
                } else {
                    this.Stop()
                }
            } else {
                Seek_Bar.Set(this.Elem.currentTime / this.Elem.duration * 100)
            }
        })
    }

    Load(file_path) {
        this.Loaded = true
        this.Elem.src = file_path
        this.Play()
    }

    get Playing() {
        if (!Audio.Loaded) {
            return
        }
        return !this.Elem.paused
    }

    Loop() {
        if (!Audio.Loaded) {
            return
        }
        if (this.Looping) {
            this.Looping = false
            document.getElementById('loop_btn').classList.remove('toggled')
        } else {
            this.Looping = true
            document.getElementById('loop_btn').classList.add('toggled')
        }
    }

    Play() {
        if (!Audio.Loaded) {
            return
        }
        this.Elem.play()
        document.getElementById('play_pause_btn').style.setProperty('background-image', 'url(../assets/ui/pause_btn.svg)')
    }

    Pause() {
        if (!Audio.Loaded) {
            return
        }
        this.Elem.pause()
        document.getElementById('play_pause_btn').style.setProperty('background-image', 'url(../assets/ui/play_btn.svg)')
    }

    Play_Pause() {
        if (!Audio.Loaded) {
            return
        }
        if (this.Playing) {
            this.Pause()
        } else {
            this.Play()
        }
    }

    Stop() {
        if (!Audio.Loaded) {
            return
        }
        this.Pause()
        this.Elem.currentTime = 0
        Seek_Bar.Set(0)
    }

    Seek_Percent(percent) {
        if (!Audio.Loaded) {
            return
        }
        percent = percent < 0 ? 0 : percent > 100 ? 100 : percent

        this.Elem.currentTime = percent / 100 * this.Elem.duration
    }

    Seek(direction, increment) {
        if (!Audio.Loaded) {
            return
        }
        direction = Math.sign(direction)

        if (increment === undefined) {
            increment = 2
        }

        let current_time = this.Elem.currentTime
        let duration = this.Elem.duration
        let new_time = current_time + direction * increment

        new_time = new_time < 0 ? 0 : new_time > duration ? duration : new_time

        this.Elem.currentTime = new_time;
    }
}
var Audio = new Audio_C

class Seek_Bar_C {

    constructor() {
        this.Elem = document.getElementById('seek_bar')
        this.Set(0)
        this.Elem.addEventListener('input', () => {
            Audio.Seek_Percent(this.Elem.value)
        })
    }

    Set(percent) {
        // Limit val between 0 and 1
        percent = percent < 0 ? 0 : percent > 100 ? 100 : percent
        percent = Math.round(percent)
        this.Elem.style.setProperty('background', 'linear-gradient(to right, red ' + percent + '%, black ' + percent + '%')
        this.Elem.value = percent
    }
}
var Seek_Bar = new Seek_Bar_C

// Add button shortcuts
document.getElementById('shuffle_btn').addEventListener('click', (e) => {
    File.Shuffle();
})
document.getElementById('previous_btn').addEventListener('click', (e) => {
    File.Open(File.Get(-1))
})
document.getElementById('play_pause_btn').addEventListener('click', (e) => {
    Audio.Play_Pause()
})
document.getElementById('next_btn').addEventListener('click', (e) => {
    File.Open(File.Get(+1))
})
document.getElementById('loop_btn').addEventListener('click', (e) => {
    Audio.Loop()
})

// Handle main process events
ipcRenderer.on("open", (e, file_path) => {
    File.Open(file_path)
})
ipcRenderer.on("next", (e) => {
    File.Open(File.Get(+1))
})
ipcRenderer.on("previous", (e, file_path) => {
    File.Open(File.Get(-1))
})
ipcRenderer.on("play_pause", (e) => {
    Audio.Play_Pause()
})
ipcRenderer.on("seek_plus", (e) => {
    Audio.Seek(+1)
})
ipcRenderer.on("seek_minus", (e) => {
    Audio.Seek(-1)
})
ipcRenderer.on("shuffle", (e) => {
    Audio.Shuffle()
})
ipcRenderer.on("loop", (e) => {
    Audio.Loop()
})