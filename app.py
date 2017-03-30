import pandas as pd
import datetime as dt
import os
from flask import Flask
from flask import render_template
import json

app = Flask(__name__)

# visualization names with associated js files
CHARTS = {'map' : 'map.js',
            'stacked-bar-chart' : 'charts.js',
            'brush-chart' : 'charts.js',
            'count' : 'charts.js'}

@app.route("/")
def index():
    #return render_template("index.html", charts=CHARTS)
    return render_template("index.html")
    
'''@app.route("/<key>")
def get_chart(key):
    getchart = CHARTS[key]
    if not product:
        abort(404)
    return render_template('charts.html', vis=getchart, js=key)'''
    
@app.route("/data")
def get_data():

	#read data and put into dataframe
	df = pd.read_csv(('input/mock.csv')) 
	df['Datetime'] = df['Datetime'].apply(lambda x: dt.datetime.strptime(x,'%m/%d/%Y %I:%M %p').date())
	
	return df.to_json(orient='records')

@app.route("/motor")
def get_motor():

	#read data and put into dataframe
	df = pd.read_csv(('input/motor.csv')) 
	#df['Date'] = df['Date'].apply(lambda x: dt.datetime.strptime(x,'%m/%d/%Y %I:%M %p').date())
	
	return df.to_json(orient='records')	


#@app.route("/geo")
#def getgeo():
    #df = geopandas.read_file('input/geojson/British_Columbia_AL4.GeoJson')
    #df = pd.read_json(('input/geojson/British_Columbia_AL4.GeoJson'))
    #return df_to_geojson(df, df.columns.values)
#    geo = geojson.loads('/input/geojson/British_Columbia_AL4.GeoJson')
#    print(geo)
#    return geo
    
def df_to_geojson(df, properties, lat='latitude', lon='longitude'):
    geojson = {'type':'FeatureCollection', 'features':[]}
    for _, row in df.iterrows():
        feature = {'type':'Feature',
                   'properties':{},
                   'geometry':{'type':'Point',
                               'coordinates':[]}}
        feature['geometry']['coordinates'] = [row[lon],row[lat]]
        for prop in properties:
            feature['properties'][prop] = row[prop]
        geojson['features'].append(feature)
    return geojson

if __name__ == '__main__':
    app.run(host=os.getenv('IP', '0.0.0.0'), port=int(os.getenv('PORT', 8080)))
    app.debug(True)