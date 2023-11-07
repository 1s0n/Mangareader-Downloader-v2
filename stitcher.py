import os
from PIL import Image
import time

mangas = os.listdir("temp")

if not os.path.exists("downloads"):
    os.mkdir("downloads")

for manga in mangas:

    if not os.path.isdir(f"temp/{manga}"):
        print(f"Skipping {manga} since its not a directory")
        continue
    
    images = []

    print("processing manga: " + manga)

    time.sleep(1)

    imagefiles = os.listdir(f"temp/{manga}")

    imagelen = len(imagefiles)

    print("Done! Beggining to append to pdf...")

    for i in range(1, imagelen + 1):
        print("Opening image " + str(i))
        images.append(Image.open(f"temp/{manga}/{i}.png"))


    pdf_path = f"downloads/{manga}.pdf"

    print("Saving to pdf    ")
    images[0].save(
        pdf_path, "PDF" ,resolution=100.0, save_all=True, append_images=images[1:]
    )

    os.rmdir(f"temp/{manga}")
    
