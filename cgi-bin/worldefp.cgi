#!/usr/bin/python

import cgi
import json
import urllib2

# Print header
print 'Content-Type: application/json\n'

try:
    # Retrieve parameters
    arguments = cgi.FieldStorage()
    samples = json.loads(arguments['samples'].value)
    id = arguments['id'].value

    output = []

    for sample in samples:
        #url = 'http://bar.utoronto.ca/webservices/agiToSignal.php?dataSource=arabidopsis_ecotypes&primaryGene=' + id + '&sample=' + sample
        url = 'http://bar.utoronto.ca/~asher/agiToSignal.php?dataSource=arabidopsis_ecotypes&primaryGene=' + id + '&sample=' + sample
        response = json.loads(urllib2.urlopen(url).read())
        output.append({
            'name': sample,
            'value': response[response.keys()[0]]
        })

    print json.dumps(output)
except:
    print "[]"
