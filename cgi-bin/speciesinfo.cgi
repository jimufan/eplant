#!/usr/bin/python

# Print header
print 'Content-Type: application/json\n'

try:
    f = open('../data/species/species.json', 'r')
    print f.read()
    f.close()
except:
    print "{}"
