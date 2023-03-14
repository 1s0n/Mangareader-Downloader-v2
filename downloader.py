import fitz
import base64
from utils import ElementExists
from selenium.webdriver.common.by import By
from time import sleep


def DownloadVolume(driver, next_btn, rating_panel_path, foldername):

    page = 1

    last_url = driver.current_url
    retry_attempts = 0

    while True:
        print(f"On page {page}")
        pdfdata = driver.print_page()
        doc = fitz.Document(stream=base64.b64decode(pdfdata))

        images = doc.get_page_images(0)

        if len(images) < 2:
            if retry_attempts > 10:
                next_btn.click()
                if last_url != driver.current_url:
                    print("New volume!")
                    break;
                    
            print(f"No images found, retrying after 0.5 seconds. Retry attempt: {retry_attempts}")
            sleep(0.5)
            retry_attempts += 1
            continue

        img = list(images)[1]
        xref = img[0]
        image = doc.extract_image(xref)
        pix = fitz.Pixmap(doc, xref)
        pix.save(f"temp/{foldername}/{page}.png")
        page += 1
        retry_attempts = 0
        next_btn.click()
