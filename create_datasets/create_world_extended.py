import json

with open('datasets/our_countries_pop.json') as f:
    jsonData = json.load(f)

json_countries_code = [ jsonData["features"][i]["id"] for i in range(len(jsonData["features"]))]


import pandas as pd
# reading the CSV file
csvFile = pd.read_csv('datasets/cases_deaths/cases_deaths.csv')
 
df =  pd.DataFrame(csvFile,columns=["country","country_code","indicator","weekly_count","year_week","rate_14_day","cumulative_count"])
print(df)

continents = df[df['country'].isin(['Africa (total)', 'America (total)', 'Asia (total)', 'EU/EEA (total)', 'Europe (total)', 'Oceania (total)'])].index
df = df.drop(continents)
print(df)