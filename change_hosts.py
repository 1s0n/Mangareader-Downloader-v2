import ctypes, sys


with open("hosts.txt") as f:
    hostdat = f.read()

with open("C:\\Windows\\System32\\drivers\\etc\\hosts", "a") as f:
    f.write("# [START_OF_ADBLOCKING_HOSTS]")
    f.write(hostdat)
    f.write("# [END_OF_ADBLOCKING_HOSTS]")

print("DONE!")
