import chromedriver_autoinstaller
import main

chromepath = chromedriver_autoinstaller.install()

if not os.path.exists("temp"):
    os.mkdir("temp")


url = input("ENTER URL: ")
a = url.split("volume-")
if len(a) == 1:
    a = url.split("chapter-")
    url = url.split("chapter-")[0] + "chapter-"
else:
    url = url.split("volume-")[0] + "volume-"

startVol = int(a[1])
print(url + str(startVol))

finalVol = int(input("FINAL VOLUME: "))

for i in range(startVol, finalVol + 1):
    print(url + str(i))

    main.download_volume(url + str(i))
