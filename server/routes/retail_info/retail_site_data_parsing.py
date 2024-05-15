import pandas as pd

# all datasets are private and not available to the public. 
# IMPORTANT: coordinates on the 'site_info' sheet are general points in the site's area, not the exact location of the site. purely for map visualization purposes. 

site_info = pd.read_excel('sites_info.xlsx', usecols=['site_id', 'doe_climate_zone', 'coordinates', 'mail_address_line1', 'city', 'state', 'zip_code', 'number_of_floor', 'total_building_area_ft2', 'net_selling_area_ft2', 'total_stock_area_ft2', 'number_of_HVAC', 'Program', 'utility'])
field_metrics_baseline_regression = pd.read_excel('field_metrics_baseline_regression.xlsx', usecols=['site_id', 'event_id', 'event_date', 'shed_start_time', 'shed_end_time', 'peak_oat', 'event_avg_oat', 'peak_demand_intensity_wft2', 'shed_avg_wft2']) 


row_value = site_info.loc[0] # get row based on index number

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
}});"""

print(output)
