import chromedriver_autoinstaller
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from utils import WaitTilAvaliable

# TODO: Get rid of hardcoded wait times

chromedriver_autoinstaller.install()

from time import sleep

import os

adblockpath = os.getcwd() + "/adblock/3.15.2_0"

chrome_options = Options()
chrome_options.add_argument("load-extension={adblockp}".format(adblockp=adblockpath))
driver = webdriver.Chrome(chrome_options=chrome_options)


horizontal_path = "#first-read > div.read-tips > div > div.rtl-rows > a:nth-child(2)a"

left_path = "#divslide > div.photo-navigation.hoz-controls.hoz-controls-rtl > div.photo-button.photo-button-prev.hoz-next-hide"

sleep(2)

driver.get("https://mangareader.to/read/chainsaw-man-96/en/volume-1")

parent = driver.window_handles[1]
chld = driver.window_handles[0]
driver.switch_to.window(chld)
driver.close()

driver.switch_to.window(parent)


horizon_button = WaitTilAvaliable(driver, By.CSS_SELECTOR, horizontal_path)

horizon_button.click()

# We're on capture page!

input()

driver.quit()
