# Lost Years
This was my undergrad capstone project. It was an idea for how to go about communicating the impact of the opioid crisis to the public.

## Getting Started

To run the application:

```
python app.py
```

This will start a local flask server listening on port 8080.

### Prerequisites

Required packages (used pip3 for Python, and npm for JS):

#### Python3
  Flask,
  Pandas
#### Javascript
  d3,
  leaflet,
  Leaflet.markercluster,
  topojson,
  bootstrap,
  crossfilter,
  jquery,
  underscore,
  queue

### Installing

Just need to download the source code and associated packages.

### Coding Style Tests

I just used Codacy to test my coding style.
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0b809db7c3264d72bec5fca01591fe63)](https://www.codacy.com/app/paperplate/capstone?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=paperplate/capstone&amp;utm_campaign=Badge_Grade)


## Deployment

Line 41 in the app.py file may need to be modified to make it run on a live system.

```
app.run(host=os.getenv('IP', '0.0.0.0'), port=int(os.getenv('PORT', 8080)))
```
## Built With

* [Flask](http://flask.pocoo.org/) - The Python framework used
* [Pandas](https://pandas.pydata.org/) - Reads the data and turns it into JSON
* [d3](https://d3js.org/) - Used to generate the charts
* [leaflet](http://leafletjs.com/) - Used to make the map
* [bootstrap](https://getbootstrap.com/) - Handles the layout of the web page
* [crossfilter](https://square.github.io/crossfilter/) - Handles the dynamic filtering of the data in the charts.
* [underscore](http://underscorejs.org/) - Convenience JS functions

## Authors

* **Sean Bergunder** - *Initial work* - [paperplate](https://github.com/paperplate)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

