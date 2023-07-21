

const air_properties = [
    // Space Temperatures at 50% RH
    // Air Density (lbm/ft^3)
    // Enthalpy (btu/lbm)
    {
        space_temp: 69,
        air_density: 0.0747,
        enthalpy: 24.77
    },
    {
        space_temp: 70,
        air_density: 0.0746,
        enthalpy: 25.3
    },
    {
        space_temp: 71,
        air_density: 0.0744,
        enthalpy: 25.84
    },
    {
        space_temp: 72,
        air_density: 0.0743,
        enthalpy: 26.39
    },
    {
        space_temp: 73,
        air_density: 0.0741,
        enthalpy: 26.95
    },
    {
        space_temp: 74,
        air_density: 0.0739,
        enthalpy: 27.52
    },
    {
        space_temp: 75,
        air_density: 0.0738,
        enthalpy: 28.1
    },
    {
        space_temp: 76,
        air_density: 0.0736,
        enthalpy: 28.7
    },
    {
        space_temp: 77,
        air_density: 0.0735,
        enthalpy: 29.3
    },
]

//TODO: calculate chillder direct reduction, calculate enthalpy coaset, calculate reduced kw from static pressure reset, calculate reduced kw from static pressure reset, calculate reduced kw from cfm + sp reduction, calculate interactive dr kw due to reducing fan kw, dr event direct kw reduction, total dr load reduction 


const calculations = (
    rtu1cfm, rtu2cfm = 0, normal_space_temp_setting, cooling_coil_leaving_air_temp, reset_space_temp_setting, // Calculate Reduced CFM
    rtu1_total_space, rtu2_total_space = 0, total_static_SF_pressure, rtu1_fan_efficiency, rtu2_fan_efficiency = 0, rtu1_motor_efficiency, rtu2_motor_efficiency = 0, cfm_for_reset_space_temp, // Calculate Reduced kW from CFM Reduction (SP handled next)
    air_system_minimum_osa,
) => {
    let ahu_max_airflow = rtu1cfm + rtu2cfm;
    let fan_efficiency = (rtu1_total_space * rtu1_fan_efficiency + rtu2_total_space * rtu2_fan_efficiency) / (rtu1_total_space + rtu2_total_space); // weighted average in %
    let motor_efficiency = (rtu1_total_space * rtu1_motor_efficiency + rtu2_total_space * rtu2_motor_efficiency) / (rtu1_total_space + rtu2_total_space); // weighted average in %

    // Calculate Reduced CFM
    let btuh_normal_space_temp = ahu_max_airflow * (normal_space_temp_setting - cooling_coil_leaving_air_temp) * 1.08;
    let cfm_for_reset_space_temp = btuh_normal_space_temp / ((reset_space_temp_setting - cooling_coil_leaving_air_temp) * 1.08);
    let cfm_reduction_from_space_temp_adjust = (1 - (cfm_for_reset_space_temp - ahu_max_airflow)) * 100; // expressed as a percentage, not rounded


    // Calculate Reduced kW from CFM Reduction (SP handled next)
    let baseline_airflow_demand = (ahu_max_airflow * total_static_SF_pressure * 0.747) / (6356 * fan_efficiency * motor_efficiency); // kW
    let dr_event_airflow_demand = cfm_for_reset_space_temp * total_static_SF_pressure * 0.747 / (6356 * fan_efficiency * motor_efficiency); // kW
    let dr_event_airflow_demand_reduction = baseline_airflow_demand - dr_event_airflow_demand; // kW

    // Calculate Reduced kW from SP Reduction (at new CFM) (i think this is equivalent to Calculate Reduced kW from Static Pressure (SP) Reset)
    let dr_event_sp_demand = cfm_for_reset_space_temp * reset_static_SF_pressure * 0.747 / (6356 * fan_efficiency * motor_efficiency); // kW
    let dr_event_sp_demand_reduction = dr_event_airflow_demand - dr_event_sp_demand; // kW
    // Note: Result is DR Event Airflow Demand - DR Event SP Demand


    // Calculate Reduced kW from CFM and SP Reduction
    // Note: Result is DR Event Airflow Demand Reduction + DR Event SP Demand Reduction
    let dr_event_cfm_and_sp_demand_reduction = dr_event_airflow_demand_reduction + dr_event_sp_demand_reduction; // kW

    // Calculate Interactive DR kW Due to Reducing Fan kW
    let percent_return_air = 1 - air_system_minimum_osa
    let chiller_capacity_offset_by_dr_event = dr_event_cfm_and_sp_demand_reduction * 3413 * percent_return_air / 12000 // tons



}

