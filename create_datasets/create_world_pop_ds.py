import json

with open('datasets/countries_pop_original.json') as f:
    jsonData = json.load(f)

json_countries_code = [ jsonData["features"][i]["id"] for i in range(len(jsonData["features"]))]


import pandas as pd
# reading the CSV file
csvFile = pd.read_csv('datasets/cases_deaths/cases_deaths.csv')
 
df =  pd.DataFrame(csvFile,columns=["country","country_code","continent","population"])
df = df.drop_duplicates() # each row is unique
print(df)

continents = df[df['country'].isin(['Africa (total)', 'America (total)', 'Asia (total)', 'EU/EEA (total)', 'Europe (total)', 'Oceania (total)'])].index
df = df.drop(continents)

csv_countries_code = df.country_code.tolist()
csv_population = df.population.tolist()

countries_code_and_population = dict(zip(csv_countries_code, csv_population))

print(set(json_countries_code) - set(csv_countries_code))
print(set(csv_countries_code) - set(json_countries_code))

# print(jsonData)

for i in range(len(jsonData["features"])):
    countryId = jsonData["features"][i]["id"]
    if countryId in csv_countries_code:
        jsonData["features"][i]["population"] = countries_code_and_population[ countryId ]

with open("datasets/our_countries_pop.json", "w") as f:
    json.dump(jsonData, f)