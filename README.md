# Mangareader-Downloader-v2

#### ~~Make a batch downloader~~
#### Better support for chapters
#### Make gui
This is a updated and improved version of [my old mangareader download](https://github.com/1s0n/Mangareader.to-downloader)
I am hoping to add gui to this soon
#### I will compile binaries for MacOS soon, and I do not access to a windows computer right now, so I will compile for windows and linux in the future when I get back
#### Please create an issue for feature requests

## How to run
To use this, ensure you have chromedriver_autoinstaller, selenium and PyMuPDF installed using pip, install them with command
```bash
pip3 install -r requirements.txt
```
Run ```main.py```, and enter the __link to the first page__ of the manga. eg. ```https://mangareader.to/read/kaguyasama-love-is-war-13/en/volume-1```

You can also pass it on as a argument. eg:
```bash
python3 main.py https://mangareader.to/read/kaguyasama-love-is-war-13/en/volume-1
```

## Batch downloader
To use the batch downloader, run batch.py, and enter the first volume/chapter of the manga you want to download
eg:
```
ENTER URL: https://mangareader.to/read/kaguyasama-love-is-war-13/en/volume-1
```
And enter the final volume you want to download up to (and including):
```
ENTER URL: https://mangareader.to/read/kaguyasama-love-is-war-13/en/volume-1
FINAL VOLUME: 26
```


### Stitching manga into pdf
Now that the manga is downloaded (you can check in the "temp" folder), run stitcher.py and wait for it to generate the pdfs from the downloaded manga, which will be in the downloads folder. 

## NOTE: 
### The get_element to get the number of pages doesn't seem to be intercepted by ads anymore, please open an issue if this causes problems
