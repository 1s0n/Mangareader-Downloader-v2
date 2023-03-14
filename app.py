print("Mangareader.to Downloader V2 user interface (THIS DOES NOT WORK RIGHT NOW, USE main.py INSTEAD!!!!!!!!!!!!!!!!)")
input()


print("Please enter 1 link per line, enter \"end\" after last link")

import mr_downloader

i = 1
links = []
while True:
    l = input(f"Link {i}: ")
    if l == "end":
        break
    links.append(l)

for link in links:
    mr_downloader._DownloadVolume(link)