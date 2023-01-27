# %%
from arcgis.gis import GIS
gis = GIS("home")

# %%
map2=gis.map("Uzbekistan")
map2.basemap="dark-gray"
map2


# %%
new_layer=gis.content.get('2d718d2733a74d1689d72b922c0ac4f4')
new_layer

# %%
map2.add_layer(new_layer)
map2


# %%
from arcgis.features import FeatureLayer
feature_layer = map2.layers[0]
feature_layer
for f in feature_layer.properties.fields:
    print(f['name'])

# %%
query_result1 = feature_layer.query(where='PM25_AQI>100 and PM25_AQI<500', as_df=True )
query_result1=query_result1[['PM25_AQI','SiteName']].sort_values(by=["PM25_AQI"])
query_result1= query_result1.reset_index(drop=True)
query_result1.index += 1
query_result1

# %%
import matplotlib.pyplot as plt
import numpy as np


query_result1.plot('SiteName','PM25_AQI', kind='bar')
plt.show()


