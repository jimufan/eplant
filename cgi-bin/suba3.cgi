#!/usr/bin/python

import cgi
import json
import urllib2

# Processes an array of locations
# scores - dictionary of location : score
# value - number of scores each location is worth
def processLocation(locations, scores, value):
    if not locations:
        return
    for location in locations:
        if len(location) == 0: continue
        if not location in scores:
            scores[location] = 0
        scores[location] += value

def correctAnnotatedLocations(locations):
    for n in range(len(locations)):
        locations[n] = locations[n][0:locations[n].find(':')]
    return locations

# Retrieve parameters
arguments = cgi.FieldStorage()
id = arguments['id'].value

# Print header
print 'Content-Type: application/json\n'

try:
    url = 'http://suba.plantenergy.uwa.edu.au/cgi/suba-app.py/suba3?start=0&limit=50&sort=locus&dir=ASC&table=suba3&where=@' + id
    response = json.loads(urllib2.urlopen(url).read())
    if response['count'] > 0:
        data = response['rows'][0]
        scores = {}

        predscore = 2
        processLocation(data['location_adaboost'], scores, predscore)
        processLocation(data['location_atp'], scores, predscore)
        processLocation(data['location_bacello'], scores, predscore)
        processLocation(data['location_chlorop'], scores, predscore)
        processLocation(data['location_epiloc'], scores, predscore)
        processLocation(data['location_ipsort'], scores, predscore)
        processLocation(data['location_mitopred'], scores, predscore)
        processLocation(data['location_mitoprot2'], scores, predscore)
        processLocation(data['location_multiloc2'], scores, predscore)
        processLocation(data['location_nucleo'], scores, predscore)
        processLocation(data['location_pclr'], scores, predscore)
        processLocation(data['location_plantmploc'], scores, predscore)
        processLocation(data['location_predotar'], scores, predscore)
        processLocation(data['location_predsl'], scores, predscore)
        processLocation(data['location_pprowler'], scores, predscore)
        processLocation(data['location_pts1'], scores, predscore)
        processLocation(data['location_slpfa'], scores, predscore)
        processLocation(data['location_slplocal'], scores, predscore)
        processLocation(data['location_subloc'], scores, predscore)
        processLocation(data['location_targetp'], scores, predscore)
        processLocation(data['location_wolfpsort'], scores, predscore)
        processLocation(data['location_yloc'], scores, predscore)

        annotscore = 10
        locations = correctAnnotatedLocations(data['location_amigo'].split(';'))
        processLocation(locations, scores, annotscore);
        locations = correctAnnotatedLocations(data['location_swissprot'].split(';'))
        processLocation(locations, scores, annotscore);
        locations = correctAnnotatedLocations(data['location_tair'].split(';'))
        processLocation(locations, scores, annotscore);

        gfpscore = 10
        locations = correctAnnotatedLocations(data['location_gfp'].split(';'))
        processLocation(locations, scores, gfpscore);

        msscore = 10
        locations = correctAnnotatedLocations(data['location_ms'].split(';'))
        processLocation(locations, scores, msscore);

        # Get valid compartments
        validScores = {}
        validLocations = ['cytoskeleton', 'cytosol', 'endoplasmic reticulum', 'extracellular', 'golgi', 'mitochondrion', 'nucleus', 'peroxisome', 'plasma membrane', 'plastid', 'vacuole']
        for location in scores:
            if location in validLocations:
                validScores[location] = scores[location]
        print json.dumps(validScores)
    else:
        print '{}'
except:
    print '{}'
