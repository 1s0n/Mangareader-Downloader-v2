import base64
import chromedriver_autoinstaller
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from utils import WaitTilAvaliable

chromedriver_autoinstaller.install()

from time import sleep
import fitz
import os

chrome_options = Options()
chrome_options.add_argument("--headless")
driver = webdriver.Chrome(options=chrome_options)


horizontal_path = "#first-read > div.read-tips > div > div.rtl-rows > a:nth-child(2)"

left_path = "#divslide > div.photo-navigation.hoz-controls.hoz-controls-rtl > div.photo-button.photo-button-prev.hoz-next-hide"

sleep(2)

driver.get("https://mangareader.to/read/chainsaw-man-96/en/volume-1")


horizon_button = WaitTilAvaliable(driver, By.CSS_SELECTOR, horizontal_path)

horizon_button.click()

# We're on capture page!

input()

pdfdata = driver.print_page()
doc = fitz.Document(stream=base64.b64decode(pdfdata))

images = doc.get_page_images(0)
if len(images) < 2:
    print("No images found, retrying after 0.5 seconds...")
    sleep(0.5)
    input()
img = list(images)[1]
xref = img[0]
image = doc.extract_image(xref)
pix = fitz.Pixmap(doc, xref)
pix.save(f"1.png")
print("Presse enter to exit")

input()

driver.quit()