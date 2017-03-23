import pandas as pd
import datetime as dt

from flask import Flask
from flask import render_template
import json

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/data")
def get_data():

	#read data and put into dataframe
	df = pd.read_csv(('input/mock.csv')) 
	df['Datetime'] = df['Datetime'].apply(lambda x: dt.datetime.strptime(x,'%m/%d/%Y %I:%M %p').date())

	
	return df.to_json(orient='records')


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
