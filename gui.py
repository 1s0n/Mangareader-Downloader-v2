import tkinter as tk
from tkinter import ttk
from bs4 import BeautifulSoup
import main
import requests
import threading
import os
from PIL import Image
import shutil

# #en-volumes

readurl = ""
vols = 0

volumepb = None
pb = None

if not os.path.exists("temp"):
    os.mkdir("temp")

if not os.path.exists("downloads"):
    os.mkdir("downloads")

def download_thread(url, startvol, endvol, updateFunction):
    for i in range(startvol, endvol + 1):
        manga = main.download_volume(url + str(i), updateFunction)

        updateFunction(0)

        images = []

        print("processing manga: " + manga)

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

        # shutil.rmtree(f"temp/{manga}") There were some downloading issue, so I decided to keep the images for now

    updateFunction(100)

def download(start, end, controller, ):
    print(start, end)
    startvol = int(start.split(" ")[1])
    endvol = int(end.split(" ")[1])

    if startvol > endvol:
        print("Start volume must be less than end volume")
        return

    controller.show_frame(Page2)

    url = readurl.split("volume-")[0] + "volume-"
    
    pbcounter = 0

    def updateFunction(value, glob=False):
        nonlocal pbcounter
        if glob:
            if pb is not None:
                pbcounter += 1
                pb['value'] = pbcounter / (endvol - startvol + 1) * 100
        else:
            if volumepb is not None:
                volumepb['value'] = value
    
    t = threading.Thread(target=download_thread, args=(url, startvol, endvol, updateFunction,))
    t.daemon = True
    t.start()
    


def check_url(url, controller):
    global readurl, vols
    print(url)

    r  = requests.get(url)

    data = r.text
    try:
        soup = BeautifulSoup(data, features="html.parser")

        els = soup.select('#en-volumes')
        
        elem = """<div class="item">"""
        el = els[0]

        num_of_vols = str(el).count(elem)
    except Exception as e:
        print("ERROR, URL NOT VALID. ERROR MESSAGE: " + str(e))
        exit(0)
    print(str(el).count(elem))
    vols = num_of_vols
    
    a = url.split("/")
    
    if len(a[-1]) == 0:
        name = a[-2]
    else:
        name = a[-1]

    print(name)

    readurl = f"https://mangareader.to/read/{name}/en/volume-1"

    controller.show_frame(Page1)
    

LARGEFONT =("Verdana", 35)

class tkinterApp(tk.Tk):
    def __init__(self, *args, **kwargs): 
        
        # __init__ function for class Tk
        tk.Tk.__init__(self, *args, **kwargs)
        self.title("Manga Downloader")

        self.geometry("500x500")

        # creating a container
        self.container = tk.Frame(self)
        self.container.pack(side = "top", fill = "both", expand = True) 
  
        self.container.grid_rowconfigure(0, weight = 1)
        self.container.grid_columnconfigure(0, weight = 1)
  
        # initializing frames to an empty array
        self.frames = {}  
  
        self.protocol("WM_DELETE_WINDOW", self.on_closing)

        self.show_frame(StartPage)
        
    # to display the current frame passed as
    # parameter
    def show_frame(self, cont):
        frame = cont(self.container, self)
        frame.grid(row = 0, column = 0, sticky ="nsew")
        print("Frame shown")
        frame.tkraise()
        print("It should be showing")
    def on_closing(self):
        main.os._exit(0)


class StartPage(tk.Frame):
    def __init__(self, parent, controller): 
        tk.Frame.__init__(self, parent)
         
        # label of frame Layout 2
        label = ttk.Label(self, text ="Mangareader Downloader", font = LARGEFONT)
         
        # putting the grid in its place by using
        # grid
        label.grid(row = 0, column = 1, padx = 10, pady = 10) 

        label1 = ttk.Label(self, text ="URL:")

        # putting the button in its place by
        # using grid
        label1.grid(row = 3, column = 1, padx = 10, pady = 10)
        
        url_entry = ttk.Entry(self)  # Text entry object
        
        # putting the text entry object in its place by
        # using grid
        url_entry.grid(row = 4, column = 1, padx = 10, pady = 10)
        
        ## button to show frame 2 with text layout2
        button2 = ttk.Button(self, text ="Check URL", command = lambda : check_url(url_entry.get(), controller))
     
        # putting the button in its place by
        # using grid
        button2.grid(row = 5, column = 1, padx = 10, pady = 10)
  
          
  
  
# second window frame page1 
class Page1(tk.Frame):
     
    def __init__(self, parent, controller):
         
        tk.Frame.__init__(self, parent)
        label = ttk.Label(self, text ="Download selector", font = LARGEFONT)
        label.grid(row = 0, column = 2, padx = 10, pady = 10)

        print("Half way")

        options = [ 
            "Volume " + str(i) for i in range(1, vols + 1)
        ] 
        print(options)
        # datatype of menu text 
        clicked = tk.StringVar() 
        
        # initial menu text 
        clicked.set("Volume 1")
        
        options1 = [ 
            "Volume " + str(i) for i in range(1, vols + 1)
        ]

        print(options)
        # datatype of menu text 
        clicked1 = tk.StringVar() 

        clicked1.set("Volume 1")

        # Create Dropdown menu 
        label1 = ttk.Label(self, text ="Starting volume: ", width=15)
        label1.grid(row = 4, column = 1, padx = 10, pady = 10)

        drop = ttk.OptionMenu( self , clicked , *options ) 
        drop.grid(row=4, column=2, padx = 10, pady = 10)

        # Create Dropdown menu 
        label2 = ttk.Label(self, text ="Final volume: ", width=15)
        label2.grid(row = 5, column = 1, padx = 10, pady = 10)

        drop1 = ttk.OptionMenu( self , clicked1 , *options1 ) 
        drop1.grid(row=5, column=2, padx = 10, pady = 10)

        button2 = ttk.Button(self, text ="Download",
                            command = lambda : download(clicked.get(), clicked1.get(), controller))
     
        # putting the button in its place by 
        # using grid
        button2.grid(row = 6, column = 1, padx = 10, pady = 10)
        print("Done")
  
  
# third window frame page2
class Page2(tk.Frame): 
    def __init__(self, parent, controller):
        global volumepb, pb
        tk.Frame.__init__(self, parent)

        label1 = ttk.Label(self, text ="Overall progress")
        label1.grid(row = 3, column = 0, padx = 10, pady = 10)
        label2 = ttk.Label(self, text ="Volume progress")
        label2.grid(row = 4, column = 0, padx = 10, pady = 10)

        pb = ttk.Progressbar(
            self,
            orient='horizontal',
            mode='determinate',
            length=200
        )

        # place the progressbar
        pb.grid(column=1, row=3, padx=10, pady=10)
        volumepb = ttk.Progressbar(
            self,
            orient='horizontal',
            mode='determinate',
            length=200
        )
        # place the progressbar
        volumepb.grid(column=1, row=4, padx=10, pady=10)

# Driver Code
app = tkinterApp()
app.mainloop()
