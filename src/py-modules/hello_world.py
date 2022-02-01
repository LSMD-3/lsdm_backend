import sys

if(len(sys.argv) > 1):
    print('Hello from '+str(sys.argv[1]))
else:
    print('Hello from python')

sys.stdout.flush()
