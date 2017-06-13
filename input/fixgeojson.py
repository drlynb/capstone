import numpy as np
import pandas as pd
import geopandas as gpd

df = gpd.read_file('map.geojson')
print(df)

def shrinkdata(data):
    '''Read the full geojson file and shrink it to just the lower mainland. '''
    pass