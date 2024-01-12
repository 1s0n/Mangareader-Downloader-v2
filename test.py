import fitz
import base64
from utils import ElementExists
from selenium.webdriver.common.by import By
from time import sleep
import selenium
import os

with open("2.pdf", "rb") as f:
    pdfdata = f.read()

doc = fitz.Document(stream=pdfdata)

images = doc.get_page_images(0)
i = 0
for img in images:
    # img = list(images)[0]
    xref = img[0]
    image = doc.extract_image(xref)
    print("Pix.save() ", end="")
    print(type(image))
    check_chars = image["image"][-2:]
    # print(image)
    pix = fitz.Pixmap(doc, xref)
    print(pix.pixel(image['width'] - 1, image['height'] - 1))
    pix.save(f"{i}.png")
    i += 1