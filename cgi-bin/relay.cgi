#!/usr/bin/python

import cgi
import json
import urllib2
import os

# Print header
print 'Content-Type: text/xml\n'

# Retrieve parameters
queryString = os.environ.get("QUERY_STRING", "")
index = queryString.find("&")
sourceURL = queryString[7:index]
args = queryString[index+6:]

# GET request
url = sourceURL + args
response = urllib2.urlopen(url).read()
print response
