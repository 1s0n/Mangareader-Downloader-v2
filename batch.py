url = input("ENTER URL: ")
url = url[0:len(url)-1]
print(url)

from os import system

finalVol = int(input("FINAL VOLUME: "))

for i in range(1, finalVol + 1):
    print(url + str(i))

    system(f"python main.py {url + str(i)}")
