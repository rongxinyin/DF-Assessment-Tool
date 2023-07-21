const air_properties = [
  // Space Temperatures at 50% RH
  // Air Density (lbm/ft^3)
  // Enthalpy (btu/lbm)
  {
    space_temp: 69,
    air_density: 0.0747,
    enthalpy: 24.77,
  },
  {
    space_temp: 70,
    air_density: 0.0746,
    enthalpy: 25.3,
  },
  {
    space_temp: 71,
    air_density: 0.0744,
    enthalpy: 25.84,
  },
  {
    space_temp: 72,
    air_density: 0.0743,
    enthalpy: 26.39,
  },
  {
    space_temp: 73,
    air_density: 0.0741,
    enthalpy: 26.95,
  },
  {
    space_temp: 74,
    air_density: 0.0739,
    enthalpy: 27.52,
  },
  {
    space_temp: 75,
    air_density: 0.0738,
    enthalpy: 28.1,
  },
  {
    space_temp: 76,
    air_density: 0.0736,
    enthalpy: 28.7,
  },
  {
    space_temp: 77,
    air_density: 0.0735,
    enthalpy: 29.3,
  },
];

const getAirDensityAtTempSetting = (tempSetting) => {
  for (var i = 0; i < air_properties.length; i++) {
    if (air_properties[i].space_temp == tempSetting) {
      return air_properties[i].air_density;
    }
  }
};

const getEnthalpyAtTempSetting = (tempSetting) => {
  for (var i = 0; i < air_properties.length; i++) {
    if (air_properties[i].space_temp == tempSetting) {
      return air_properties[i].enthalpy;
    }
  }
};

const calculations = ({
  rtu1cfm = 0,
  rtu2cfm = 0,
  normal_space_temp_setting = 0,
  cooling_coil_leaving_air_temp = 0,
  reset_space_temp_setting = 0, // Calculate Reduced CFM
  rtu1_total_space = 0,
  rtu2_total_space = 0,
  total_static_SF_pressure = 0,
  reset_static_pressure_value = 0,
  rtu1_fan_efficiency = 0,
  rtu2_fan_efficiency = 0,
  rtu1_motor_efficiency = 0,
  rtu2_motor_efficiency = 0, // Calculate Reduced kW from CFM Reduction (SP handled next)
  air_system_minimum_osa = 0,
  rtu1_packaged_AC_unit_efficiency = 0,
  rtu2_packaged_AC_unit_efficiency = 0,
  ac_load_factor = 0,
  size_of_conditioned_space = 0,
  height_of_conditioned_space = 0,
  percent_reduction_per_degree = 0,
  coast = 0,
}) => {
  let ahu_max_airflow = rtu1cfm + rtu2cfm;
  let fan_efficiency =
    (rtu1_total_space * rtu1_fan_efficiency +
      rtu2_total_space * rtu2_fan_efficiency) /
    (rtu1_total_space + rtu2_total_space); // weighted average in %
  let motor_efficiency =
    (rtu1_total_space * rtu1_motor_efficiency +
      rtu2_total_space * rtu2_motor_efficiency) /
    (rtu1_total_space + rtu2_total_space); // weighted average in %

  // Calculate Reduced CFM
  let btuh_normal_space_temp =
    ahu_max_airflow *
    (normal_space_temp_setting - cooling_coil_leaving_air_temp) *
    1.08;
  let cfm_for_reset_space_temp =
    btuh_normal_space_temp /
    ((reset_space_temp_setting - cooling_coil_leaving_air_temp) * 1.08);
  let cfm_reduction_from_space_temp_adjust =
    (1 - cfm_for_reset_space_temp / ahu_max_airflow) * 100; // expressed as a percentage, not rounded

  // Calculate Reduced kW from CFM Reduction (SP handled next)
  let baseline_airflow_demand =
    (ahu_max_airflow * total_static_SF_pressure * 0.747) /
    (6356 * fan_efficiency * motor_efficiency); // kW
  let dr_event_airflow_demand =
    (cfm_for_reset_space_temp * total_static_SF_pressure * 0.747) /
    (6356 * fan_efficiency * motor_efficiency); // kW
  let dr_event_airflow_demand_reduction =
    baseline_airflow_demand - dr_event_airflow_demand; // kW

  // Calculate Reduced kW from SP Reduction (at new CFM) (i think this is equivalent to Calculate Reduced kW from Static Pressure (SP) Reset)
  let dr_event_sp_demand =
    (cfm_for_reset_space_temp * reset_static_pressure_value * 0.747) /
    (6356 * fan_efficiency * motor_efficiency); // kW
  let dr_event_sp_demand_reduction =
    dr_event_airflow_demand - dr_event_sp_demand; // kW
  // Note: Result is DR Event Airflow Demand - DR Event SP Demand

  // Calculate Reduced kW from CFM and SP Reduction
  // Note: Result is DR Event Airflow Demand Reduction + DR Event SP Demand Reduction
  let dr_event_cfm_and_sp_demand_reduction =
    dr_event_airflow_demand_reduction + dr_event_sp_demand_reduction; // kW
  let ac_efficiency =
    (rtu1_total_space * rtu1_packaged_AC_unit_efficiency +
      rtu2_total_space * rtu2_packaged_AC_unit_efficiency) /
    (rtu1_total_space + rtu2_total_space); // weighted average in kw/ton
  let percent_return_air = 1 - air_system_minimum_osa;

  // Calculate Interactive DR kW Due to Reducing Fan kW
  let chiller_capacity_offset_by_dr_event =
    (dr_event_cfm_and_sp_demand_reduction * 3413 * percent_return_air) / 12000; // tons
  let dr_event_interactive_fan_kw_reduction =
    chiller_capacity_offset_by_dr_event * ac_efficiency; // kW

  // Calculate Chiller Direct Reduction
  let total_capacity = rtu1_total_space + rtu2_total_space; // tons

  let baseline_chiller_power = total_capacity * ac_efficiency * ac_load_factor;
  let dr_chiller_power =
    baseline_chiller_power *
    (1 -
      percent_reduction_per_degree *
        (reset_space_temp_setting - normal_space_temp_setting));
  let chiller_power_reduction = baseline_chiller_power - dr_chiller_power;

  // Total Direct Load Reduction
  let dr_event_direct_kw_reduction =
    dr_event_cfm_and_sp_demand_reduction +
    dr_event_interactive_fan_kw_reduction +
    chiller_power_reduction; // kW

  // The Enthalpy Coast
  let air_density_at_normal_space_temp_setting = getAirDensityAtTempSetting(
    normal_space_temp_setting
  );
  let enthalpy_at_normal_space_temp_setting = getEnthalpyAtTempSetting(
    normal_space_temp_setting
  );
  let air_density_at_reset_temp_setting = getAirDensityAtTempSetting(
    reset_space_temp_setting
  );
  let enthalpy_at_reset_space_temp_setting = getEnthalpyAtTempSetting(
    reset_space_temp_setting
  );

  let btu_in_pre_condition =
    size_of_conditioned_space *
    height_of_conditioned_space *
    air_density_at_normal_space_temp_setting *
    enthalpy_at_normal_space_temp_setting; // BTU
  let btu_in_post_condition =
    size_of_conditioned_space *
    height_of_conditioned_space *
    air_density_at_reset_temp_setting *
    enthalpy_at_reset_space_temp_setting; // BTU
  let difference_in_btu = btu_in_post_condition - btu_in_pre_condition; // BTU
  //TODO: find out more specifics regarding coast (B112) can either be 1 or 2
  let coast_dr_power_reduction =
    difference_in_btu *
    (1 / 12000) *
    coast *
    ac_efficiency *
    percent_return_air; // kW

  // Total 2-Hour Load Reduction
  let total_dr_load_reduction =
    (dr_event_direct_kw_reduction * 2 + coast_dr_power_reduction) / 2; // kW
};

// parameters from the spreadsheet (for testing)
// console.log(calculations({
//     rtu1cfm: 70000,
//     rtu2cfm: 70000,
//     normal_space_temp_setting: 72,
//     cooling_coil_leaving_air_temp: 53.5,
//     reset_space_temp_setting: 76,
//     rtu1_total_space: 180,
//     rtu2_total_space: 180,
//     total_static_SF_pressure: 4.25,
//     reset_static_pressure_value: 4,
//     rtu1_fan_efficiency: 0.55,
//     rtu2_fan_efficiency: 0.55,
//     rtu1_motor_efficiency: 0.917,
//     rtu2_motor_efficiency: 0.917,
//     air_system_minimum_osa: 0.25,
//     rtu1_packaged_AC_unit_efficiency: 1.23,
//     rtu2_packaged_AC_unit_efficiency: 1.23,
//     ac_load_factor: 0.75,
//     size_of_conditioned_space: 140000,
//     height_of_conditioned_space: 8,
//     percent_reduction_per_degree: 0.025,
//     coast: 1,
// }))
