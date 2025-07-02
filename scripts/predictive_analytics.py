import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import json
import math

class CoffeePredictiveAnalytics:
    """
    Advanced predictive analytics for coffee storage optimization.
    Provides forecasting, trend analysis, and storage recommendations.
    """
    
    def __init__(self):
        self.optimal_ranges = {
            'temperature': {'min': 18, 'max': 25, 'ideal': 21.5},
            'humidity': {'min': 55, 'max': 70, 'ideal': 62.5},
            'dust_level': {'min': 0, 'max': 50, 'ideal': 25}
        }
        
        self.risk_thresholds = {
            'temperature': {'critical': 30, 'warning': 27},
            'humidity': {'critical': 80, 'warning': 75},
            'dust_level': {'critical': 100, 'warning': 75}
        }
    
    def analyze_trends(self, df: pd.DataFrame, days: int = 7) -> Dict:
        """Analyze trends in sensor data over specified period"""
        # Filter data for the specified period
        cutoff_date = datetime.now() - timedelta(days=days)
        df['timestamp'] = pd.to_datetime(df['created_at'])
        recent_df = df[df['timestamp'] >= cutoff_date].copy()
        
        if len(recent_df) == 0:
            return {'error': 'No data available for trend analysis'}
        
        trends = {}
        
        for metric in ['temperature', 'humidity', 'dust_level']:
            if metric in recent_df.columns:
                values = recent_df[metric].dropna()
                
                if len(values) > 1:
                    # Calculate trend using linear regression
                    x = np.arange(len(values))
                    slope = np.polyfit(x, values, 1)[0]
                    
                    # Calculate statistics
                    current_avg = values.tail(24).mean() if len(values) >= 24 else values.mean()
                    previous_avg = values.head(24).mean() if len(values) >= 48 else values.mean()
                    change_percent = ((current_avg - previous_avg) / previous_avg) * 100 if previous_avg != 0 else 0
                    
                    # Determine trend direction
                    if abs(slope) < 0.01:
                        direction = 'stable'
                    elif slope > 0:
                        direction = 'increasing'
                    else:
                        direction = 'decreasing'
                    
                    trends[metric] = {
                        'direction': direction,
                        'slope': float(slope),
                        'current_average': float(current_avg),
                        'change_percent': float(change_percent),
                        'min_value': float(values.min()),
                        'max_value': float(values.max()),
                        'std_deviation': float(values.std()),
                        'data_points': len(values)
                    }
        
        return trends
    
    def forecast_conditions(self, df: pd.DataFrame, hours_ahead: int = 24) -> Dict:
        """Forecast storage conditions using time series analysis"""
        forecasts = {}
        
        df['timestamp'] = pd.to_datetime(df['created_at'])
        df = df.sort_values('timestamp')
        
        for metric in ['temperature', 'humidity', 'dust_level']:
            if metric in df.columns:
                values = df[metric].dropna()
                
                if len(values) >= 24:  # Need at least 24 data points
                    # Simple moving average with trend
                    recent_values = values.tail(24)
                    moving_avg = recent_values.mean()
                    
                    # Calculate hourly trend
                    if len(values) >= 48:
                        recent_trend = recent_values.mean() - values.tail(48).head(24).mean()
                        hourly_trend = recent_trend / 24
                    else:
                        hourly_trend = 0
                    
                    # Forecast future values
                    forecast_value = moving_avg + (hourly_trend * hours_ahead)
                    
                    # Add seasonal adjustment (simple sine wave for daily cycle)
                    current_hour = datetime.now().hour
                    future_hour = (current_hour + hours_ahead) % 24
                    
                    if metric == 'temperature':
                        # Temperature typically peaks in afternoon
                        seasonal_adj = 2 * math.sin((future_hour - 6) * math.pi / 12)
                        forecast_value += seasonal_adj
                    elif metric == 'humidity':
                        # Humidity typically higher at night
                        seasonal_adj = -3 * math.sin((future_hour - 6) * math.pi / 12)
                        forecast_value += seasonal_adj
                    
                    # Calculate confidence based on recent stability
                    recent_std = recent_values.std()
                    confidence = max(0.5, 1 - (recent_std / moving_avg)) if moving_avg != 0 else 0.5
                    
                    # Determine risk level
                    risk_level = self._assess_risk_level(metric, forecast_value)
                    
                    forecasts[metric] = {
                        'forecast_value': float(forecast_value),
                        'confidence': float(confidence),
                        'hours_ahead': hours_ahead,
                        'risk_level': risk_level,
                        'current_value': float(values.iloc[-1]),
                        'trend': 'increasing' if hourly_trend > 0 else 'decreasing' if hourly_trend < 0 else 'stable'
                    }
        
        return forecasts
    
    def _assess_risk_level(self, metric: str, value: float) -> str:
        """Assess risk level for a given metric value"""
        thresholds = self.risk_thresholds.get(metric, {})
        
        if value >= thresholds.get('critical', float('inf')):
            return 'critical'
        elif value >= thresholds.get('warning', float('inf')):
            return 'warning'
        elif metric in self.optimal_ranges:
            optimal = self.optimal_ranges[metric]
            if optimal['min'] <= value <= optimal['max']:
                return 'optimal'
            else:
                return 'suboptimal'
        else:
            return 'unknown'
    
    def calculate_storage_quality_score(self, current_conditions: Dict) -> Dict:
        """Calculate overall storage quality score (0-100)"""
        scores = {}
        weights = {'temperature': 0.4, 'humidity': 0.4, 'dust_level': 0.2}
        
        total_score = 0
        total_weight = 0
        
        for metric, weight in weights.items():
            if metric in current_conditions:
                value = current_conditions[metric]
                optimal = self.optimal_ranges.get(metric, {})
                
                if optimal:
                    # Calculate score based on distance from ideal value
                    ideal = optimal['ideal']
                    min_val = optimal['min']
                    max_val = optimal['max']
                    
                    if min_val <= value <= max_val:
                        # Within optimal range
                        distance_from_ideal = abs(value - ideal)
                        range_size = (max_val - min_val) / 2
                        score = 100 - (distance_from_ideal / range_size) * 20
                    else:
                        # Outside optimal range
                        if value < min_val:
                            score = max(0, 80 - (min_val - value) * 10)
                        else:
                            score = max(0, 80 - (value - max_val) * 10)
                    
                    scores[metric] = {
                        'score': float(max(0, min(100, score))),
                        'status': self._assess_risk_level(metric, value),
                        'optimal_range': f"{min_val}-{max_val}",
                        'current_value': float(value)
                    }
                    
                    total_score += score * weight
                    total_weight += weight
        
        overall_score = total_score / total_weight if total_weight > 0 else 0
        
        return {
            'overall_score': float(max(0, min(100, overall_score))),
            'individual_scores': scores,
            'grade': self._get_grade(overall_score),
            'timestamp': datetime.now().isoformat()
        }
    
    def _get_grade(self, score: float) -> str:
        """Convert numeric score to letter grade"""
        if score >= 90:
            return 'A'
        elif score >= 80:
            return 'B'
        elif score >= 70:
            return 'C'
        elif score >= 60:
            return 'D'
        else:
            return 'F'
    
    def generate_optimization_recommendations(self, 
                                           current_conditions: Dict, 
                                           forecasts: Dict, 
                                           trends: Dict) -> List[Dict]:
        """Generate actionable recommendations for storage optimization"""
        recommendations = []
        
        # Temperature recommendations
        if 'temperature' in current_conditions:
            temp = current_conditions['temperature']
            temp_forecast = forecasts.get('temperature', {})
            temp_trend = trends.get('temperature', {})
            
            if temp > self.optimal_ranges['temperature']['max']:
                recommendations.append({
                    'type': 'temperature',
                    'priority': 'high',
                    'action': 'cooling',
                    'message': f"Temperature is {temp:.1f}°C, above optimal range. Consider increasing ventilation or cooling.",
                    'expected_impact': 'Prevent coffee bean deterioration and maintain quality'
                })
            elif temp < self.optimal_ranges['temperature']['min']:
                recommendations.append({
                    'type': 'temperature',
                    'priority': 'medium',
                    'action': 'heating',
                    'message': f"Temperature is {temp:.1f}°C, below optimal range. Consider reducing cooling or adding heating.",
                    'expected_impact': 'Optimize storage conditions for coffee preservation'
                })
            
            # Forecast-based recommendations
            if temp_forecast.get('risk_level') == 'critical':
                recommendations.append({
                    'type': 'temperature',
                    'priority': 'urgent',
                    'action': 'immediate_intervention',
                    'message': f"Temperature forecast shows critical levels in {temp_forecast.get('hours_ahead', 24)} hours. Take immediate action.",
                    'expected_impact': 'Prevent severe coffee quality degradation'
                })
        
        # Humidity recommendations
        if 'humidity' in current_conditions:
            humidity = current_conditions['humidity']
            humidity_forecast = forecasts.get('humidity', {})
            
            if humidity > self.optimal_ranges['humidity']['max']:
                recommendations.append({
                    'type': 'humidity',
                    'priority': 'high',
                    'action': 'dehumidification',
                    'message': f"Humidity is {humidity:.1f}%, above optimal range. Increase dehumidification or ventilation.",
                    'expected_impact': 'Prevent mold growth and maintain coffee bean quality'
                })
            elif humidity < self.optimal_ranges['humidity']['min']:
                recommendations.append({
                    'type': 'humidity',
                    'priority': 'medium',
                    'action': 'humidification',
                    'message': f"Humidity is {humidity:.1f}%, below optimal range. Consider reducing dehumidification.",
                    'expected_impact': 'Prevent coffee beans from becoming too dry'
                })
        
        # Dust level recommendations
        if 'dust_level' in current_conditions:
            dust = current_conditions['dust_level']
            
            if dust > self.optimal_ranges['dust_level']['max']:
                recommendations.append({
                    'type': 'air_quality',
                    'priority': 'high',
                    'action': 'air_filtration',
                    'message': f"Dust level is {dust:.1f} µg/m³, above optimal range. Improve air filtration and cleaning.",
                    'expected_impact': 'Maintain clean storage environment and coffee quality'
                })
        
        # Trend-based recommendations
        for metric, trend_data in trends.items():
            if trend_data.get('direction') == 'increasing' and trend_data.get('change_percent', 0) > 10:
                recommendations.append({
                    'type': metric,
                    'priority': 'medium',
                    'action': 'trend_monitoring',
                    'message': f"{metric.title()} showing increasing trend ({trend_data.get('change_percent', 0):.1f}% change). Monitor closely.",
                    'expected_impact': 'Early intervention to prevent optimal range violations'
                })
        
        # Sort by priority
        priority_order = {'urgent': 0, 'high': 1, 'medium': 2, 'low': 3}
        recommendations.sort(key=lambda x: priority_order.get(x['priority'], 3))
        
        return recommendations
    
    def calculate_energy_efficiency_score(self, df: pd.DataFrame) -> Dict:
        """Calculate energy efficiency score based on stability of conditions"""
        if len(df) < 24:
            return {'error': 'Insufficient data for energy efficiency calculation'}
        
        # Calculate stability (lower variation = higher efficiency)
        recent_data = df.tail(24)
        
        stability_scores = {}
        for metric in ['temperature', 'humidity']:
            if metric in recent_data.columns:
                values = recent_data[metric].dropna()
                if len(values) > 0:
                    std_dev = values.std()
                    mean_val = values.mean()
                    coefficient_of_variation = std_dev / mean_val if mean_val != 0 else 1
                    
                    # Lower CV = higher stability = higher efficiency
                    stability_score = max(0, 100 - (coefficient_of_variation * 100))
                    stability_scores[metric] = float(stability_score)
        
        overall_efficiency = np.mean(list(stability_scores.values())) if stability_scores else 0
        
        return {
            'overall_efficiency_score': float(overall_efficiency),
            'stability_scores': stability_scores,
            'grade': self._get_grade(overall_efficiency),
            'interpretation': self._interpret_efficiency_score(overall_efficiency)
        }
    
    def _interpret_efficiency_score(self, score: float) -> str:
        """Interpret energy efficiency score"""
        if score >= 90:
            return "Excellent - Very stable conditions with minimal energy waste"
        elif score >= 80:
            return "Good - Stable conditions with reasonable energy usage"
        elif score >= 70:
            return "Fair - Some fluctuations, room for efficiency improvements"
        elif score >= 60:
            return "Poor - Significant fluctuations, high energy usage likely"
        else:
            return "Critical - Very unstable conditions, major efficiency issues"

# Example usage
if __name__ == "__main__":
    # Initialize analytics engine
    analytics = CoffeePredictiveAnalytics()
    
    # Sample data
    sample_df = pd.DataFrame({
        'temperature': np.random.normal(22, 2, 100),
        'humidity': np.random.normal(65, 5, 100),
        'dust_level': np.random.normal(30, 10, 100),
        'created_at': pd.date_range(start='2024-01-01', periods=100, freq='H')
    })
    
    # Run analytics
    trends = analytics.analyze_trends(sample_df)
    forecasts = analytics.forecast_conditions(sample_df)
    
    current_conditions = {
        'temperature': 23.5,
        'humidity': 67.2,
        'dust_level': 35.8
    }
    
    quality_score = analytics.calculate_storage_quality_score(current_conditions)
    recommendations = analytics.generate_optimization_recommendations(
        current_conditions, forecasts, trends
    )
    efficiency = analytics.calculate_energy_efficiency_score(sample_df)
    
    print("Predictive Analytics Results:")
    print(f"Quality Score: {quality_score['overall_score']:.1f} ({quality_score['grade']})")
    print(f"Efficiency Score: {efficiency['overall_efficiency_score']:.1f}")
    print(f"Recommendations: {len(recommendations)} actions suggested")
