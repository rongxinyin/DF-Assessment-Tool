import pandas as pd

# all datasets are private and not available to the public. 
# IMPORTANT: coordinates on the 'site_info' sheet are general points in the site's area, not the exact location of the site. purely for map visualization purposes. 

site_info = pd.read_excel('sites_info.xlsx', usecols=['site_id', 'doe_climate_zone', 'coordinates', 'mail_address_line1', 'city', 'state', 'zip_code', 'number_of_floor', 'total_building_area_ft2', 'net_selling_area_ft2', 'total_stock_area_ft2', 'number_of_HVAC', 'Program', 'utility'])
field_metrics_baseline_regression = pd.read_excel('field_metrics_baseline_regression.xlsx', usecols=['site_id', 'event_id', 'event_date', 'shed_start_time', 'shed_end_time', 'peak_oat', 'event_avg_oat', 'peak_demand_intensity_wft2', 'shed_avg_wft2']) 


# site_info data parsing
row_value = site_info.loc[5-2] # get row based on index number, first site starts at index 0 (current row - 2)

# extract the data points from the row
siteID = row_value['site_id']
doe_climate_zone = row_value['doe_climate_zone']
coordinates = row_value['coordinates'].split(',')
coordinates.reverse()
city = row_value['city']
state = row_value['state']
zip_code = row_value['zip_code']
number_of_floor = row_value['number_of_floor']
total_building_area_ft2 = row_value['total_building_area_ft2']
net_selling_area_ft2 = row_value['net_selling_area_ft2']
total_stock_area_ft2 = row_value['total_stock_area_ft2']
number_of_HVAC = row_value['number_of_HVAC']
program = row_value['Program']
utility = row_value['utility']


# field_metrics_baseline_regression data parsing

out = f"""fieldMetricBaselineRegression: ["""
# cycle through all datapoints with the siteID from the site_info data
for index, row in field_metrics_baseline_regression.iterrows():
    if row['site_id'] == siteID:
        event_id = row['event_id']
        event_date = row['event_date'].to_pydatetime().strftime('%d %B %Y')
        shed_start_time = row['shed_start_time'].to_pydatetime().strftime('%d %B %Y %H:%M %Z') + "GMT-8"
        shed_end_time = row['shed_end_time'].to_pydatetime().strftime('%d %B %Y %H:%M %Z') + "GMT-8"
        peak_oat = row['peak_oat']
        event_avg_oat = row['event_avg_oat']
        peak_demand_intensity_wft2 = row['peak_demand_intensity_wft2']
        shed_avg_wft2 = row['shed_avg_wft2']


        out = out + f"""
        {{
          event_id: {event_id},
          event_date: new Date("{event_date}"),
          shed_start_time_date: new Date("{shed_start_time}"),
          shed_end_time_date: new Date("{shed_end_time}"),
          peak_oat: {peak_oat},
          event_avg_oat: {event_avg_oat},
          peak_demand_intensity_wft2: {peak_demand_intensity_wft2},
          shed_avg_wft2: {shed_avg_wft2},
        }}, """

out = out + f"""
    ],"""
        

# formatting output
output = f"""const site{siteID} = new BenchmarkingModel({{
  coordinates: [{coordinates[0]}, {coordinates[1]}],
  siteID: "{siteID}",
  siteInfo: {{
    doe_climate_zone: "{doe_climate_zone}",
    city: "{city}",
    state: "{state}",
    zip: {zip_code},
    number_of_floor: {number_of_floor},
    total_building_area_ft2: {total_building_area_ft2},
    net_selling_area_ft2: {net_selling_area_ft2},
    total_stock_area_ft2: {total_stock_area_ft2},
    number_of_HVAC: {number_of_HVAC},
    program: "{program}",
    utility: "{utility}",
  }},
  {out}
}});"""



# TODO: change it so that output is written to a single file with all sites, not a separate file for each site
directory = "outputs/" + siteID + ".js"
f = open(directory, "w")
f.write(output)
f.close()
print("Created", directory)
