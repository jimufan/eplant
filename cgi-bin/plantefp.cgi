#!/usr/bin/python

import cgi
import json
import urllib2
#testing_efp = open("testing/testing_REST.txt", "w")
# Print header
print 'Content-Type: application/json\n'

try:
    # Retrieve parameters
    arguments = cgi.FieldStorage()
    samples = json.loads(arguments['samples'].value)
    id = arguments['id'].value
    datasource = arguments['datasource'].value

    output = []

    for sample in samples:
        #testing_efp.write("sample = %s\n"%sample)
        url = 'http://bar.utoronto.ca/webservices/agiToSignal.php?dataSource=' + datasource + '&primaryGene=' + id + '&sample=' + sample
        response = json.loads(urllib2.urlopen(url).read())
        
        output.append({
            'name': sample,
            'value': response[response.keys()[0]]
        })

    print json.dumps(output)
except:
    print "[]"
