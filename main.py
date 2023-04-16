# TODO: USE JS FUNCTION hozNextImage() to move pages, instead of using selenium to push buttons

import base64
import chromedriver_autoinstaller
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from utils import WaitTilAvaliable, FilterPath
import downloader
chromedriver_autoinstaller.install()

from time import sleep
import fitz
import os

import sys

if len(sys.argv) > 1:
    print(sys.argv[1])
    url = sys.argv[1]
else:
    url = input("URL: ")

chrome_options = Options()
chrome_options.add_argument("--headless")
driver = webdriver.Chrome(options=chrome_options)
driver.get(url)

mangatitle = driver.title

mangatitle = mangatitle.replace("Read ", "")
title = mangatitle.replace(" in English Online Free", "")
title = FilterPath(title)
try:
    os.mkdir(f"temp/{title}")
except FileExistsError:
    pass
    


horizontal_path = "#first-read > div.read-tips > div > div.rtl-rows > a:nth-child(2)"
next_button_path = "#divslide > div.photo-navigation.hoz-controls.hoz-controls-rtl > div.photo-button.photo-button-prev.hoz-next-hide"
settings_button_path = "#header > div > div.auto-div > div.float-right.hr-right > div.hr-setting.mr-2 > a"
quality_button_path = "#wrapper > div.mr-tools.mrt-top > div > div > div.float-left > div:nth-child(3) > button"
high_quality_button_path = "#wrapper > div.mr-tools.mrt-top > div > div > div.float-left > div.rt-item.show > div > a:nth-child(1)"
low_quality_button_path = "#wrapper > div.mr-tools.mrt-top > div > div > div.float-left > div.rt-item.show > div > a:nth-child(3)"
# This is to see if it is at the end of the volume
rating_panel_path = "#vote-info > div"


# WARNING: Qality can be low, medium, high. This is put straight into the cookies so it might break if any other value is put in idk im not bothered to test it 
quality = "medium"


horizon_button = WaitTilAvaliable(driver, By.CSS_SELECTOR, horizontal_path)
horizon_button.click()

# Change quaality settings
settings_btn = driver.find_element(By.CSS_SELECTOR, value=settings_button_path)
settings_btn.click()

quality_btn = WaitTilAvaliable(driver, By.CSS_SELECTOR, quality_button_path)
quality_btn.click()

high_quality_btn = WaitTilAvaliable(driver, By.CSS_SELECTOR, high_quality_button_path)
high_quality_btn.click()


# We're on capture page!
print("On capture page")
page = 1

next_btn = WaitTilAvaliable(driver, By.CSS_SELECTOR, next_button_path)

sleep(5)


last_url = driver.current_url

retry_attempts = 0


downloader.DownloadVolume(driver, next_btn, rating_panel_path, title, next_button_path)

print("Presse enter to exit")

input()

driver.quit()