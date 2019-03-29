import requests
import time
import subprocess
import psutil

PROCNAME = "node.exe"

def clean():

    for proc in psutil.process_iter():
        # check whether the process name matches
        if proc.name() == PROCNAME:

            proc.kill()

#clean()
            
subprocess.call('main.bat',shell=True)
            
while 1:
    
    time.sleep(4)
        
    r = requests.get('http://localhost/login', auth=('Vm', '144'))
    print (r.status_code)
    input()
    if (r.status_code==200):
        print ("no dramas")

    else:
        clean()
        subprocess.call('main.bat',shell=True)

    
