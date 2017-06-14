import pandas as pd
import datetime as dt
import os
from flask import Flask, json, jsonify
from flask import render_template

app = Flask(__name__)

@app.route("/")
def index():
    #return render_template("index.html", charts=CHARTS)
    return render_template("index.html")

@app.route("/data")
def get_data():
	#read data and put into dataframe
	df = pd.read_csv(('input/mock.csv')) 
	df['Datetime'] = df['Datetime'].apply(lambda x: dt.datetime.strptime(x,'%m/%Y').date())
	return df.to_json(orient='records')

@app.route("/motor")
def get_motor():
	#read data and put into dataframe
	df = pd.read_csv(('input/motor.csv')) 
	df['Date'] = df['Date'].apply(lambda x: dt.datetime.strptime(x,'%m/%Y').date())
	return df.to_json(orient='records')

@app.route("/natural")
def get_natural():
	#read data and put into dataframe
	df = pd.read_csv(('input/natural.csv')) 
	return df.to_json(orient='records')	

@app.route("/map")
def get_map():
    #df = pd.read_json('input/mapquanttopo.json')
    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(SITE_ROOT, "input", "fraserquant.json")
    data = json.load(open(json_url))
    return jsonify(data)

if __name__ == '__main__':
    app.run(host=os.getenv('IP', '0.0.0.0'), port=int(os.getenv('PORT', 8080)))
    app.debug(True)