# Mangareader-Downloader-v2

#### ~~Making the program run without interacting with the actual page, so ads wont interfere.~~

This is a updated and improved version of [my old mangareader download](https://github.com/1s0n/Mangareader.to-downloader)
I am hoping to add gui to this soon

## How to run
To use this, ensure you have chromedriver_autoinstaller, selenium and PyMuPDF installed using pip
Run ```main.py```, and enter the __link to the first page__ of the manga. eg. ```https://mangareader.to/read/kaguyasama-love-is-war-13/en/volume-1```

You can also pass it on as a argument. eg:
```bash
python3 main.py https://mangareader.to/read/kaguyasama-love-is-war-13/en/volume-1
```
This allows easier automation, which I will hopefully add later.


### Stitching manga into pdf
Now that the manga is downloaded (you can check in the "temp" folder), run stitcher.py and wait for it to generate the pdfs from the downloaded manga, which will be in the downloads folder. 


## NOTE: This code might be buggy due to the ads, even though it doesn't click on the page. Please open an issue if the program crashes without downloading the entire volume/chapter.
