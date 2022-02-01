import sys
import json


if(len(sys.argv) == 1):
    print('Missing parameters')
    exit(0)

params = sys.argv[1]
jsonParams = json.loads(params)

# free to use jsonParams as json dict


x = {
    "name": "John",
    "age": 30,
    "city": "New York"
}


print(json.dumps(x))


sys.stdout.flush()
