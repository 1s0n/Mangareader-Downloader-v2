# Mangareader-Downloader-v2

#### Make a batch downloader
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


## NOTE: 
### There is a problem where the program only downloads a part of the manga, 
### this is due to the way I detect the end of a manga, which is to search for the image in each page, and if the image isn't there after 30 retries, it gives up.
### Directly reading the number from the webpage wont work either because the read might get intercepted by ads, which breaks everything, and an adblock is a pain to try to implement in selenium.
### I will try to come up with a fix.
