# TODO: USE JS FUNCTION hozNextImage() to move pages, instead of using selenium to push buttons

import base64
#import chromedriver_autoinstaller
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium import webdriver
from utils import WaitTilAvaliable, FilterPath
import downloader
from typing import Callable
#chromepath = chromedriver_autoinstaller.install()

from time import sleep
import fitz
import os

import sys



def download_volume(url: str, update_function: Callable=None) -> str:

    # WARNING: Quality can be low, medium, high. This is put straight into the cookies so it might break if any other value is put in idk im not bothered to test it 
    quality = "high"

    # DONT CHANGE THIS!
    mode = "horizontal"


    # cookie = "{%22readingMode%22:%22{mode}%22%2C%22readingDirection%22:%22rtl%22%2C%22quality%22:%22{quality}%22%2C%22hozPageSize%22:1}"


    cookie = """{%22readingMode%22:%22HORIZONTAL_SETTING%22%2C%22readingDirection%22:%22ltr%22%2C%22quality%22:%22QUALITY_SETTING%22%2C%22hozPageSize%22:1}"""
    cookie = cookie.replace("HORIZONTAL_SETTING", mode)
    cookie = cookie.replace("QUALITY_SETTING", quality)
    
    euconsent_v2_COOKIE = """CP4N9sAP4N9sAAZACBENAiEsAP_gAH_gAAAAg1NX_H__bW9r8Xr3aft0eY1P99j77sQxBhfJE-4FzLvW_JwXx2ExNA26tqIKmRIEu3ZBIQFlHJHURVigaogVryHsYkGcgTNKJ6BkgFMRM2dYCF5vmYtj-QKY5_p9d3fx2D-t_dv83dzzz8VHn3e5fmckcJCdQ58tDfn9bRKb-5IOd_78v4v09F_rk2_eTVn_tcvr7B-uft87_XU-9_ffcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEQagCzDQqIA-wJCQi0HCKBACIKwgIoEAAAAJA0QEAJgwKdgYBLrCRACBFAAMEAIAAUZAAgAAAgAQiACQAoEAAEAgEAAAAAAgEABAwACgAsBAIAAQHQMUwoAFAsIEjMiIUwIQoEggJbKBBICgQVwgCLHACgERMFAAgAAAVgAAAsVgMQSAlQkECWEG0AABAAgFFKFQgk4MAAwJGy1A4Im0ZWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAA.YAAAAAAAAAAA"""
    pubconsent_v2_COOKIE = """YAAAAAAAAAAA"""

    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--headless")

    driver = webdriver.Chrome(options=chrome_options)
    driver.get(url)

    driver.add_cookie({"name": "mr_settings", "value": cookie})

    # To get rid of the cookie banner for debugging purposes
    driver.add_cookie({"name": "euconsent-v2", "value": euconsent_v2_COOKIE})
    driver.add_cookie({"name": "pubconsent-v2", "value": pubconsent_v2_COOKIE})

    driver.refresh()

    mangatitle = driver.title

    mangatitle = mangatitle.replace("Read ", "")
    title = mangatitle.replace(" in English Online Free", "")
    title = FilterPath(title)
    try:
        os.mkdir(f"temp/{title}")
    except FileExistsError:
        pass

    # input()
    
    horizontal_path = "#first-read > div.read-tips > div > div.rtl-rows > a:nth-child(2)"
    next_button_path = "#divslide > div.photo-navigation.hoz-controls.hoz-controls-rtl > div.photo-button.photo-button-prev.hoz-next-hide"
    settings_button_path = "#header > div > div.auto-div > div.float-right.hr-right > div.hr-setting.mr-2 > a"
    quality_button_path = "#wrapper > div.mr-tools.mrt-top > div > div > div.float-left > div:nth-child(3) > button"
    high_quality_button_path = "#wrapper > div.mr-tools.mrt-top > div > div > div.float-left > div.rt-item.show > div > a:nth-child(1)"
    low_quality_button_path = "#wrapper > div.mr-tools.mrt-top > div > div > div.float-left > div.rt-item.show > div > a:nth-child(3)"
    # This is to see if it is at the end of the volume
    rating_panel_path = "#vote-info > div"


    """
    horizon_button = WaitTilAvaliable(driver, By.CSS_SELECTOR, horizontal_path)
    horizon_button.click()

    # Change quaality settings
    settings_btn = driver.find_element(By.CSS_SELECTOR, value=settings_button_path)
    settings_btn.click()

    quality_btn = WaitTilAvaliable(driver, By.CSS_SELECTOR, quality_button_path)
    quality_btn.click()

    high_quality_btn = WaitTilAvaliable(driver, By.CSS_SELECTOR, high_quality_button_path)
    high_quality_btn.click()

    """

    # We're on capture page!
    print("On capture page")
    page = 1

    next_btn = WaitTilAvaliable(driver, By.CSS_SELECTOR, next_button_path)

    sleep(5)


    last_url = driver.current_url

    retry_attempts = 0


    downloader.DownloadVolume(driver, next_btn, rating_panel_path, title, next_button_path, update_function)

    if update_function:
        update_function(0, glob=True)

    driver.quit()
    return title


if __name__ == "__main__":
    if not os.path.exists("temp"):
        os.mkdir("temp")
    
    if not os.path.exists("chromedriver.exe"):
        os.remove("chromedriver.exe")



    if len(sys.argv) > 1:
        print(sys.argv[1])
        url = sys.argv[1]
    else:
        url = input("URL: ")

    download_volume(url)