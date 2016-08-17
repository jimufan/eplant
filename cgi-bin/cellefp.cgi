#!/usr/bin/python

import cgi
import json
import urllib2

# Print header
print 'Content-Type: application/json\n'

try:
    # Retrieve parameters
    arguments = cgi.FieldStorage()
    id = arguments['id'].value

    compartments = ['NUCLEUS', 'ENDOPLASMIC RETICULUM', 'PEROXISOME', 'GOLGI', 'MITOCHONDRION', 'PLASTID', 'CYTOSKELETON', 'VACUOLE', 'CYTOSOL', 'EXTRACELLULAR', 'PLASMA MEMBRANE']
    hasValue = [False] * 11

    url = 'http://bar.utoronto.ca/~eplant/cgi-bin/suba3.cgi?id=' + id
    response = json.loads(urllib2.urlopen(url).read())
    output = []

    for key in response:
        index = compartments.index(key.upper())
        if (index >= 0):
            output.append({
                'name': compartments[index],
                'value': response[key]
            })
            hasValue[index] = True

    for index, flag in enumerate(hasValue):
        if not flag:
            output.append({
                'name': compartments[index],
                'value': 0
            })

    print json.dumps(output)
except:
    print '{}'
