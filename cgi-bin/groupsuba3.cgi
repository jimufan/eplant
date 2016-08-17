#!/usr/bin/python

import cgi
import json
import urllib2

# Print header
print 'Content-Type: application/json\n'

try:
    # Retrieve parameters
    arguments = cgi.FieldStorage()
    ids = json.loads(arguments['ids'].value)

    output = []

    for id in ids:
        url = 'http://bar.utoronto.ca/~eplant/cgi-bin/suba3.cgi?id=' + id
        response = json.loads(urllib2.urlopen(url).read())
        output.append({
            "id": id,
            "data": response
        })

    print json.dumps(output)
except:
    print "[]"
