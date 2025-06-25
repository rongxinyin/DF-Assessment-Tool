import numpy as np
import matplotlib.pyplot as plt
from typing import Tuple, Optional, List
from dataclasses import dataclass
from enum import Enum

class CompressorType(Enum):
    SINGLE_STAGE = "single_stage"
    TWO_STAGE = "two_stage"

class OperationMode(Enum):
    NORMAL = "normal"
    DEMAND_RESPONSE = "demand_response"

@dataclass
class ACParameters:
    """Air conditioner parameters"""
    cooling_capacity_stage1: float  # kW - cooling capacity at stage 1
    cooling_capacity_stage2: float  # kW - cooling capacity at stage 2 (total capacity for two-stage)
    cop_stage1: float              # COP at stage 1
    cop_stage2: float              # COP at stage 2 (or single stage)
    compressor_type: CompressorType
    thermal_resistance: float      # K/kW - thermal resistance between indoor and outdoor
    thermal_capacitance: float     # kWh/K - thermal capacitance of building
    deadband: float = 0.5         # K - thermostat deadband

class ResidentialACModel:
    """
    1R1C Gray-box thermal model for residential air conditioner
    
    The thermal model follows: C * dT/dt = (T_out - T_in)/R - Q_cooling
    where:
    - C: thermal capacitance (kWh/K)
    - R: thermal resistance (K/kW) 
    - T_in: indoor temperature (°C)
    - T_out: outdoor temperature (°C)
    - Q_cooling: cooling power (kW, positive value)
    """
    
    def __init__(self, ac_params: ACParameters, initial_temp: float = 20.0):
        """
        Initialize the air conditioner model
        
        Args:
            ac_params: AC parameters object
            initial_temp: Initial indoor temperature (°C)
        """
        self.ac_params = ac_params
        self.indoor_temp = initial_temp
        self.setpoint = 24.0  # Default cooling setpoint (°C)
        self.compressor_stage = 0  # 0=off, 1=stage1, 2=stage2
        self.power_consumption = 0.0  # Current power consumption (kW)
        self.demand_response_active = False
        self.dr_setpoint_offset = 0.0  # Setpoint offset during demand response (K)
        
        # Control hysteresis tracking
        self.last_stage = 0
        
        # Time step for simulation (hours)
        self.dt = 1/60  # 1 minute default
        
    def set_setpoint(self, setpoint: float):
        """Set the thermostat cooling setpoint"""
        self.setpoint = setpoint
        
    def set_demand_response(self, active: bool, setpoint_offset: float = 2.0):
        """
        Activate/deactivate demand response mode
        
        Args:
            active: Whether demand response is active
            setpoint_offset: Setpoint increase during demand response (K)
        """
        self.demand_response_active = active
        self.dr_setpoint_offset = setpoint_offset if active else 0.0
        
    def get_effective_setpoint(self) -> float:
        """Get the effective setpoint considering demand response"""
        return self.setpoint + self.dr_setpoint_offset
        
    def update_control_logic(self, outdoor_temp: float):
        """
        Update compressor stage based on thermostat control logic
        
        Args:
            outdoor_temp: Current outdoor temperature (°C)
        """
        effective_setpoint = self.get_effective_setpoint()
        deadband = self.ac_params.deadband
        
        # Temperature thresholds
        cooling_on_temp = effective_setpoint + deadband/2
        cooling_off_temp = effective_setpoint - deadband/2
        
        # For two-stage systems, define stage 2 threshold
        stage2_on_temp = effective_setpoint + deadband * 1.5
        
        if self.ac_params.compressor_type == CompressorType.SINGLE_STAGE:
            # Single stage control
            if self.indoor_temp > cooling_on_temp:
                self.compressor_stage = 1
            elif self.indoor_temp < cooling_off_temp:
                self.compressor_stage = 0
            # Maintain current stage if within deadband
                
        else:  # Two-stage control
            if self.indoor_temp > stage2_on_temp:
                self.compressor_stage = 2
            elif self.indoor_temp > cooling_on_temp:
                # Use stage 1, but add some hysteresis
                if self.last_stage == 2 and self.indoor_temp > effective_setpoint + deadband * 0.8:
                    self.compressor_stage = 2  # Stay in stage 2 with hysteresis
                else:
                    self.compressor_stage = 1
            elif self.indoor_temp < cooling_off_temp:
                self.compressor_stage = 0
            # Maintain current stage if within deadband
                
        self.last_stage = self.compressor_stage
        
    def calculate_cooling_power(self) -> float:
        """Calculate current cooling power output based on compressor stage"""
        if self.compressor_stage == 0:
            return 0.0
        elif self.compressor_stage == 1:
            if self.ac_params.compressor_type == CompressorType.SINGLE_STAGE:
                return self.ac_params.cooling_capacity_stage2  # Use stage2 capacity for single stage
            else:
                return self.ac_params.cooling_capacity_stage1
        else:  # stage 2
            return self.ac_params.cooling_capacity_stage2
            
    def calculate_power_consumption(self) -> float:
        """Calculate electrical power consumption based on cooling output and COP"""
        cooling_power = self.calculate_cooling_power()
        
        if cooling_power == 0:
            self.power_consumption = 0.0
        elif self.compressor_stage == 1:
            if self.ac_params.compressor_type == CompressorType.SINGLE_STAGE:
                self.power_consumption = cooling_power / self.ac_params.cop_stage2
            else:
                self.power_consumption = cooling_power / self.ac_params.cop_stage1
        else:  # stage 2
            self.power_consumption = cooling_power / self.ac_params.cop_stage2
            
        return self.power_consumption
        
    def update_temperature(self, outdoor_temp: float, dt: Optional[float] = None):
        """
        Update indoor temperature using 1R1C thermal model
        
        Args:
            outdoor_temp: Outdoor temperature (°C)
            dt: Time step (hours), uses default if None
        """
        if dt is None:
            dt = self.dt
            
        # Heat transfer through building envelope (positive = heat gain)
        heat_gain = (outdoor_temp - self.indoor_temp) / self.ac_params.thermal_resistance
        
        # Cooling power (positive = heat removal)
        cooling_power = self.calculate_cooling_power()
        
        # Net heat flow into the building
        net_heat_flow = heat_gain - cooling_power
        
        # Temperature change: dT/dt = Q_net / C
        temp_change = net_heat_flow * dt / self.ac_params.thermal_capacitance
        
        self.indoor_temp += temp_change
        
    def simulate_step(self, outdoor_temp: float, dt: Optional[float] = None) -> Tuple[float, float, int]:
        """
        Simulate one time step
        
        Args:
            outdoor_temp: Outdoor temperature (°C)
            dt: Time step (hours)
            
        Returns:
            Tuple of (indoor_temp, power_consumption, compressor_stage)
        """
        # Update control logic
        self.update_control_logic(outdoor_temp)
        
        # Calculate power consumption
        self.calculate_power_consumption()
        
        # Update temperature
        self.update_temperature(outdoor_temp, dt)
        
        return self.indoor_temp, self.power_consumption, self.compressor_stage
        
    def simulate_period(self, outdoor_temps: List[float], dt: float = 1/60) -> dict:
        """
        Simulate over a period with varying outdoor temperatures
        
        Args:
            outdoor_temps: List of outdoor temperatures (°C) for each time step
            dt: Time step (hours)
            
        Returns:
            Dictionary with simulation results
        """
        self.dt = dt
        
        results = {
            'time': [],
            'indoor_temp': [],
            'outdoor_temp': [],
            'power_consumption': [],
            'compressor_stage': [],
            'setpoint': [],
            'effective_setpoint': []
        }
        
        time = 0
        for outdoor_temp in outdoor_temps:
            indoor_temp, power, stage = self.simulate_step(outdoor_temp, dt)
            
            results['time'].append(time)
            results['indoor_temp'].append(indoor_temp)
            results['outdoor_temp'].append(outdoor_temp)
            results['power_consumption'].append(power)
            results['compressor_stage'].append(stage)
            results['setpoint'].append(self.setpoint)
            results['effective_setpoint'].append(self.get_effective_setpoint())
            
            time += dt
            
        return results
        
    def calculate_daily_energy(self, outdoor_temps: List[float], dt: float = 1/60) -> float:
        """
        Calculate total daily energy consumption
        
        Args:
            outdoor_temps: List of outdoor temperatures for 24 hours
            dt: Time step (hours)
            
        Returns:
            Total energy consumption (kWh)
        """
        results = self.simulate_period(outdoor_temps, dt)
        energy_consumption = sum(p * dt for p in results['power_consumption'])
        return energy_consumption
        
    def plot_simulation_results(self, results: dict, figsize: Tuple[int, int] = (12, 8)):
        """Plot simulation results"""
        fig, axes = plt.subplots(3, 1, figsize=figsize, sharex=True)
        
        # Temperature plot
        axes[0].plot(results['time'], results['indoor_temp'], 'b-', label='Indoor Temp', linewidth=2)
        axes[0].plot(results['time'], results['outdoor_temp'], 'r-', label='Outdoor Temp', linewidth=1)
        axes[0].plot(results['time'], results['setpoint'], 'g--', label='Setpoint', linewidth=1)
        axes[0].plot(results['time'], results['effective_setpoint'], 'm--', label='Effective Setpoint', linewidth=1)
        axes[0].set_ylabel('Temperature (°C)')
        axes[0].legend()
        axes[0].grid(True, alpha=0.3)
        axes[0].set_title('Air Conditioner 1R1C Model Simulation')
        
        # Power consumption plot
        axes[1].plot(results['time'], results['power_consumption'], 'k-', linewidth=2)
        axes[1].set_ylabel('Power (kW)')
        axes[1].grid(True, alpha=0.3)
        axes[1].set_title('Power Consumption')
        
        # Compressor stage plot
        axes[2].step(results['time'], results['compressor_stage'], 'orange', where='post', linewidth=2)
        axes[2].set_ylabel('Compressor Stage')
        axes[2].set_xlabel('Time (hours)')
        axes[2].grid(True, alpha=0.3)
        axes[2].set_title('Compressor Operation')
        axes[2].set_ylim(-0.1, 2.1)
        
        plt.tight_layout()
        return fig
        
    def get_model_info(self) -> dict:
        """Get current model state and parameters"""
        return {
            'ac_parameters': {
                'cooling_capacity_stage1': self.ac_params.cooling_capacity_stage1,
                'cooling_capacity_stage2': self.ac_params.cooling_capacity_stage2,
                'cop_stage1': self.ac_params.cop_stage1,
                'cop_stage2': self.ac_params.cop_stage2,
                'compressor_type': self.ac_params.compressor_type.value,
                'thermal_resistance': self.ac_params.thermal_resistance,
                'thermal_capacitance': self.ac_params.thermal_capacitance,
                'deadband': self.ac_params.deadband
            },
            'current_state': {
                'indoor_temp': self.indoor_temp,
                'setpoint': self.setpoint,
                'effective_setpoint': self.get_effective_setpoint(),
                'compressor_stage': self.compressor_stage,
                'power_consumption': self.power_consumption,
                'demand_response_active': self.demand_response_active,
                'dr_setpoint_offset': self.dr_setpoint_offset
            }
        }

# Example usage and demonstration
if __name__ == "__main__":
    # Create AC parameters for a two-stage system
    ac_params = ACParameters(
        cooling_capacity_stage1=3.5,  # kW
        cooling_capacity_stage2=7.0,  # kW (total capacity)
        cop_stage1=4.5,
        cop_stage2=3.8,
        compressor_type=CompressorType.TWO_STAGE,
        thermal_resistance=2.0,  # K/kW
        thermal_capacitance=5.0,  # kWh/K
        deadband=0.5  # K
    )
    
    # Initialize model
    ac_model = ResidentialACModel(ac_params, initial_temp=20.0)
    ac_model.set_setpoint(24.0)
    
    # Create sample outdoor temperature profile (hot summer day)
    hours = np.linspace(0, 24, 24*60)  # 1-minute resolution for 24 hours
    outdoor_temps = 32 + 8 * np.sin(2 * np.pi * (hours - 6) / 24)  # Sinusoidal temp profile
    outdoor_temps = np.maximum(outdoor_temps, 20)  # Minimum 20°C
    
    print("Simulating normal operation...")
    results_normal = ac_model.simulate_period(outdoor_temps.tolist(), dt=1/60)
    energy_normal = sum(p * (1/60) for p in results_normal['power_consumption'])
    
    # Reset model and test demand response
    ac_model = ResidentialACModel(ac_params, initial_temp=20.0)
    ac_model.set_setpoint(24.0)
    ac_model.set_demand_response(True, setpoint_offset=2.0)  # 2°C setpoint increase
    
    print("Simulating demand response operation...")
    results_dr = ac_model.simulate_period(outdoor_temps.tolist(), dt=1/60)
    energy_dr = sum(p * (1/60) for p in results_dr['power_consumption'])
    
    print(f"\nEnergy Consumption Comparison:")
    print(f"Normal operation: {energy_normal:.2f} kWh")
    print(f"Demand response: {energy_dr:.2f} kWh")
    print(f"Energy savings: {((energy_normal - energy_dr) / energy_normal * 100):.1f}%")
    
    # Display model information
    print("\nModel Configuration:")
    model_info = ac_model.get_model_info()
    for category, params in model_info.items():
        print(f"\n{category.upper()}:")
        for key, value in params.items():
            print(f"  {key}: {value}")
            
    # Plot results
    fig_normal = ac_model.plot_simulation_results(results_normal)
    fig_dr = ac_model.plot_simulation_results(results_dr)
    plt.show()
