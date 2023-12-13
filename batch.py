url = input("ENTER URL: ")
startVol = int(url.split("volume-")[1])
url = url.split("volume-")[0] + "volume-"
print(url + str(startVol))

from os import system

finalVol = int(input("FINAL VOLUME: "))

for i in range(startVol, finalVol + 1):
    print(url + str(i))

    system(f"python main.py {url + str(i)}")
