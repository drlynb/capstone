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
    return render_template("charts.html")
    
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



if __name__ == '__main__':
    app.run(host=os.getenv('IP', '0.0.0.0'), port=int(os.getenv('PORT', 8080)))
    app.debug(True)