#from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium import webdriver
#from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import InvalidSelectorException, NoSuchElementException
from time import sleep

def WaitTilAvaliable(driver: webdriver.Chrome, by:By, value:str, expected_error:Exception=(InvalidSelectorException, NoSuchElementException,), max_attempts:int=20, wait_time:float=0.5):
    i = 0
    while True:
        try:
            element = driver.find_element(by=by, value=value)
            break
        except expected_error:
            if i >= max_attempts:
                raise expected_error

            sleep(wait_time)
            i += 1
            continue
    
    return element

def ElementExists(driver: webdriver.Chrome, by:By, value:str, expected_error=(InvalidSelectorException, NoSuchElementException,)):
    try:
        driver.find_element(by=by, value=value)
        return True
    except expected_error:
        return False

def FilterPath(path):
    illegal_chars = ["\\", "/", ":", "*", "?", "\"", "<", ">", "|"]
    for char in illegal_chars:
        path = path.replace(char, "")
    return path