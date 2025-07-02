import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import json
import random

class CoffeeStorageAIRecommendationEngine:
    """
    AI-powered recommendation engine for coffee storage optimization.
    Provides intelligent, context-aware recommendations based on multiple data sources.
    """
    
    def __init__(self):
        self.knowledge_base = self._initialize_knowledge_base()
        self.recommendation_history = []
        self.user_preferences = {}
        
    def _initialize_knowledge_base(self) -> Dict:
        """Initialize coffee storage knowledge base"""
        return {
            'coffee_types': {
                'arabica': {
                    'optimal_temp': {'min': 18, 'max': 22, 'ideal': 20},
                    'optimal_humidity': {'min': 55, 'max': 65, 'ideal': 60},
                    'sensitivity': 'high',
                    'storage_duration': 12  # months
                },
                'robusta': {
                    'optimal_temp': {'min': 20, 'max': 25, 'ideal': 22.5},
                    'optimal_humidity': {'min': 60, 'max': 70, 'ideal': 65},
                    'sensitivity': 'medium',
                    'storage_duration': 18  # months
                },
                'blend': {
                    'optimal_temp': {'min': 19, 'max': 24, 'ideal': 21.5},
                    'optimal_humidity': {'min': 58, 'max': 68, 'ideal': 63},
                    'sensitivity': 'medium',
                    'storage_duration': 15  # months
                }
            },
            'processing_methods': {
                'washed': {'humidity_tolerance': 'low', 'temp_stability_required': 'high'},
                'natural': {'humidity_tolerance': 'medium', 'temp_stability_required': 'medium'},
                'honey': {'humidity_tolerance': 'medium', 'temp_stability_required': 'high'}
            },
            'storage_containers': {
                'jute_bags': {'breathability': 'high', 'moisture_protection': 'low'},
                'grain_pro': {'breathability': 'low', 'moisture_protection': 'high'},
                'silos': {'breathability': 'medium', 'moisture_protection': 'high'}
            },
            'seasonal_adjustments': {
                'summer': {'temp_offset': 2, 'humidity_offset': 5, 'ventilation_increase': 20},
                'winter': {'temp_offset': -1, 'humidity_offset': -3, 'ventilation_decrease': 10},
                'rainy': {'humidity_offset': 10, 'dehumidification_increase': 30},
                'dry': {'humidity_offset': -5, 'humidification_increase': 15}
            }
        }
    
    def generate_comprehensive_recommendations(self, 
                                            current_conditions: Dict,
                                            forecasts: Dict,
                                            trends: Dict,
                                            patterns: Dict,
                                            coffee_profile: Optional[Dict] = None) -> List[Dict]:
        """Generate comprehensive AI-powered recommendations"""
        
        recommendations = []
        
        # Get coffee-specific recommendations
        if coffee_profile:
            coffee_recs = self._get_coffee_specific_recommendations(
                current_conditions, coffee_profile
            )
            recommendations.extend(coffee_recs)
        
        # Get predictive recommendations based on forecasts
        predictive_recs = self._get_predictive_recommendations(
            current_conditions, forecasts
        )
        recommendations.extend(predictive_recs)
        
        # Get pattern-based recommendations
        pattern_recs = self._get_pattern_based_recommendations(patterns)
        recommendations.extend(pattern_recs)
        
        # Get seasonal recommendations
        seasonal_recs = self._get_seasonal_recommendations(current_conditions)
        recommendations.extend(seasonal_recs)
        
        # Get energy optimization recommendations
        energy_recs = self._get_energy_optimization_recommendations(
            current_conditions, trends
        )
        recommendations.extend(energy_recs)
        
        # Get maintenance recommendations
        maintenance_recs = self._get_maintenance_recommendations(patterns)
        recommendations.extend(maintenance_recs)
        
        # Prioritize and filter recommendations
        final_recommendations = self._prioritize_recommendations(recommendations)
        
        # Store in history
        self.recommendation_history.append({
            'timestamp': datetime.now().isoformat(),
            'conditions': current_conditions,
            'recommendations': final_recommendations
        })
        
        return final_recommendations
    
    def _get_coffee_specific_recommendations(self, 
                                           current_conditions: Dict, 
                                           coffee_profile: Dict) -> List[Dict]:
        """Generate recommendations based on specific coffee type and processing"""
        recommendations = []
        
        coffee_type = coffee_profile.get('type', 'blend')
        processing = coffee_profile.get('processing', 'washed')
        storage_duration = coffee_profile.get('storage_months', 12)
        
        # Get optimal ranges for this coffee type
        optimal_ranges = self.knowledge_base['coffee_types'].get(coffee_type, 
                                                               self.knowledge_base['coffee_types']['blend'])
        
        # Temperature recommendations
        current_temp = current_conditions.get('temperature', 20)
        optimal_temp = optimal_ranges['optimal_temp']
        
        if current_temp < optimal_temp['min']:
            recommendations.append({
                'type': 'coffee_specific',
                'category': 'temperature',
                'priority': 'high',
                'action': 'increase_temperature',
                'message': f"Temperature too low for {coffee_type} coffee. Increase to {optimal_temp['ideal']}°C for optimal preservation.",
                'technical_details': f"Current: {current_temp}°C, Optimal range: {optimal_temp['min']}-{optimal_temp['max']}°C",
                'expected_impact': f"Improved {coffee_type} bean preservation and flavor retention",
                'coffee_specific': True
            })
        elif current_temp > optimal_temp['max']:
            recommendations.append({
                'type': 'coffee_specific',
                'category': 'temperature',
                'priority': 'high',
                'action': 'decrease_temperature',
                'message': f"Temperature too high for {coffee_type} coffee. Reduce to {optimal_temp['ideal']}°C to prevent degradation.",
                'technical_details': f"Current: {current_temp}°C, Optimal range: {optimal_temp['min']}-{optimal_temp['max']}°C",
                'expected_impact': f"Prevent {coffee_type} bean deterioration and maintain quality",
                'coffee_specific': True
            })
        
        # Humidity recommendations based on processing method
        current_humidity = current_conditions.get('humidity', 60)
        optimal_humidity = optimal_ranges['optimal_humidity']
        processing_info = self.knowledge_base['processing_methods'].get(processing, {})
        
        if processing_info.get('humidity_tolerance') == 'low' and current_humidity > optimal_humidity['max']:
            recommendations.append({
                'type': 'coffee_specific',
                'category': 'humidity',
                'priority': 'urgent',
                'action': 'reduce_humidity',
                'message': f"{processing.title()}-processed coffee is sensitive to humidity. Reduce to {optimal_humidity['ideal']}% immediately.",
                'technical_details': f"Processing: {processing}, Current: {current_humidity}%, Optimal: {optimal_humidity['ideal']}%",
                'expected_impact': "Prevent mold growth and maintain coffee quality for humidity-sensitive processing method",
                'coffee_specific': True
            })
        
        # Storage duration recommendations
        if storage_duration > optimal_ranges['storage_duration']:
            recommendations.append({
                'type': 'coffee_specific',
                'category': 'inventory',
                'priority': 'medium',
                'action': 'inventory_rotation',
                'message': f"Coffee has been stored for {storage_duration} months. Consider rotation for {coffee_type} (recommended max: {optimal_ranges['storage_duration']} months).",
                'technical_details': f"Storage duration: {storage_duration} months, Recommended max: {optimal_ranges['storage_duration']} months",
                'expected_impact': "Maintain coffee freshness and prevent quality degradation",
                'coffee_specific': True
            })
        
        return recommendations
    
    def _get_predictive_recommendations(self, 
                                      current_conditions: Dict, 
                                      forecasts: Dict) -> List[Dict]:
        """Generate recommendations based on predictive forecasts"""
        recommendations = []
        
        for metric, forecast in forecasts.items():
            if forecast.get('risk_level') in ['warning', 'critical']:
                hours_ahead = forecast.get('hours_ahead', 24)
                predicted_value = forecast.get('forecast_value', 0)
                confidence = forecast.get('confidence', 0.5)
                
                if forecast['risk_level'] == 'critical':
                    priority = 'urgent'
                    action_time = 'immediate'
                else:
                    priority = 'high'
                    action_time = f"within {hours_ahead} hours"
                
                recommendations.append({
                    'type': 'predictive',
                    'category': metric,
                    'priority': priority,
                    'action': f'preventive_{metric}_adjustment',
                    'message': f"Forecast shows {metric} will reach {forecast['risk_level']} levels ({predicted_value:.1f}) in {hours_ahead} hours. Take {action_time} action.",
                    'technical_details': f"Predicted: {predicted_value:.1f}, Confidence: {confidence:.1%}, Time frame: {hours_ahead}h",
                    'expected_impact': f"Prevent {forecast['risk_level']} {metric} conditions and maintain storage quality",
                    'predictive': True,
                    'confidence': confidence
                })
        
        return recommendations
    
    def _get_pattern_based_recommendations(self, patterns: Dict) -> List[Dict]:
        """Generate recommendations based on identified patterns"""
        recommendations = []
        
        # Daily pattern recommendations
        daily_patterns = patterns.get('daily_patterns', {})
        for metric, pattern in daily_patterns.items():
            if pattern.get('variation_coefficient', 0) > 25:
                stable_hours = pattern.get('stable_hours', [])
                peak_hour = pattern.get('peak_hour', 12)
                
                recommendations.append({
                    'type': 'pattern_based',
                    'category': 'scheduling',
                    'priority': 'medium',
                    'action': 'optimize_hvac_schedule',
                    'message': f"High {metric} variation detected. Adjust HVAC scheduling around peak hour ({peak_hour}:00) and utilize stable hours {stable_hours}.",
                    'technical_details': f"Variation coefficient: {pattern.get('variation_coefficient', 0):.1f}%, Peak hour: {peak_hour}, Stable hours: {stable_hours}",
                    'expected_impact': f"Reduce {metric} fluctuations and improve storage stability",
                    'pattern_based': True
                })
        
        # Operational pattern recommendations
        operational_patterns = patterns.get('operational_patterns', {})
        for pattern_id, pattern in operational_patterns.items():
            if pattern.get('type') == 'high_stress' and pattern.get('percentage', 0) > 15:
                recommendations.append({
                    'type': 'pattern_based',
                    'category': 'operational',
                    'priority': 'high',
                    'action': 'reduce_stress_conditions',
                    'message': f"High-stress operational pattern detected {pattern.get('percentage', 0):.1f}% of the time. Review and adjust system parameters.",
                    'technical_details': f"Pattern type: {pattern.get('type')}, Frequency: {pattern.get('percentage', 0):.1f}%",
                    'expected_impact': "Reduce equipment stress and improve coffee storage conditions",
                    'pattern_based': True
                })
        
        return recommendations
    
    def _get_seasonal_recommendations(self, current_conditions: Dict) -> List[Dict]:
        """Generate seasonal adjustment recommendations"""
        recommendations = []
        
        current_month = datetime.now().month
        
        # Determine season
        if current_month in [12, 1, 2]:
            season = 'winter'
        elif current_month in [3, 4, 5]:
            season = 'spring'
        elif current_month in [6, 7, 8]:
            season = 'summer'
        else:
            season = 'fall'
        
        seasonal_adjustments = self.knowledge_base['seasonal_adjustments'].get(season, {})
        
        if seasonal_adjustments:
            current_temp = current_conditions.get('temperature', 20)
            current_humidity = current_conditions.get('humidity', 60)
            
            temp_offset = seasonal_adjustments.get('temp_offset', 0)
            humidity_offset = seasonal_adjustments.get('humidity_offset', 0)
            
            if abs(temp_offset) > 0:
                recommendations.append({
                    'type': 'seasonal',
                    'category': 'temperature',
                    'priority': 'medium',
                    'action': f'seasonal_{season}_temp_adjustment',
                    'message': f"Apply {season} temperature adjustment: {temp_offset:+.1f}°C from current settings for optimal seasonal storage.",
                    'technical_details': f"Season: {season}, Current temp: {current_temp}°C, Suggested adjustment: {temp_offset:+.1f}°C",
                    'expected_impact': f"Optimize storage conditions for {season} weather patterns",
                    'seasonal': True
                })
            
            if abs(humidity_offset) > 0:
                recommendations.append({
                    'type': 'seasonal',
                    'category': 'humidity',
                    'priority': 'medium',
                    'action': f'seasonal_{season}_humidity_adjustment',
                    'message': f"Apply {season} humidity adjustment: {humidity_offset:+.1f}% from current settings for seasonal optimization.",
                    'technical_details': f"Season: {season}, Current humidity: {current_humidity}%, Suggested adjustment: {humidity_offset:+.1f}%",
                    'expected_impact': f"Adapt to {season} humidity patterns and maintain optimal storage",
                    'seasonal': True
                })
        
        return recommendations
    
    def _get_energy_optimization_recommendations(self, 
                                               current_conditions: Dict, 
                                               trends: Dict) -> List[Dict]:
        """Generate energy efficiency recommendations"""
        recommendations = []
        
        # Check for energy waste patterns
        for metric, trend_data in trends.items():
            if trend_data.get('std_deviation', 0) > 2:  # High variation indicates energy waste
                recommendations.append({
                    'type': 'energy_optimization',
                    'category': 'efficiency',
                    'priority': 'medium',
                    'action': 'reduce_system_cycling',
                    'message': f"High {metric} variation detected (σ={trend_data.get('std_deviation', 0):.1f}). Optimize system cycling to reduce energy consumption.",
                    'technical_details': f"Standard deviation: {trend_data.get('std_deviation', 0):.1f}, Trend: {trend_data.get('direction', 'unknown')}",
                    'expected_impact': "Reduce energy consumption while maintaining storage quality",
                    'energy_focused': True
                })
        
        # Night setback recommendations
        current_hour = datetime.now().hour
        if 22 <= current_hour or current_hour <= 6:  # Night hours
            recommendations.append({
                'type': 'energy_optimization',
                'category': 'scheduling',
                'priority': 'low',
                'action': 'implement_night_setback',
                'message': "Consider implementing night setback schedules to reduce energy consumption during low-activity hours.",
                'technical_details': f"Current time: {current_hour}:00, Night hours: 22:00-06:00",
                'expected_impact': "Reduce overnight energy consumption by 15-25%",
                'energy_focused': True
            })
        
        return recommendations
    
    def _get_maintenance_recommendations(self, patterns: Dict) -> List[Dict]:
        """Generate maintenance recommendations based on patterns"""
        recommendations = []
        
        # Check for anomaly patterns that might indicate maintenance needs
        anomaly_patterns = patterns.get('anomaly_patterns', {})
        
        for metric, anomaly_data in anomaly_patterns.items():
            anomaly_percentage = anomaly_data.get('anomaly_percentage', 0)
            
            if anomaly_percentage > 5:  # More than 5% anomalies
                most_common_hour = anomaly_data.get('most_common_hour')
                
                recommendations.append({
                    'type': 'maintenance',
                    'category': 'preventive',
                    'priority': 'medium',
                    'action': f'inspect_{metric}_system',
                    'message': f"High {metric} anomaly rate ({anomaly_percentage:.1f}%) detected. Schedule system inspection and maintenance.",
                    'technical_details': f"Anomaly rate: {anomaly_percentage:.1f}%, Most common time: {most_common_hour}:00",
                    'expected_impact': "Prevent system failures and maintain consistent storage conditions",
                    'maintenance_focused': True
                })
        
        # Seasonal maintenance reminders
        current_month = datetime.now().month
        if current_month in [3, 9]:  # Spring and fall maintenance
            season = 'spring' if current_month == 3 else 'fall'
            recommendations.append({
                'type': 'maintenance',
                'category': 'seasonal',
                'priority': 'medium',
                'action': f'{season}_maintenance_check',
                'message': f"Schedule {season} maintenance: filter replacement, system calibration, and performance optimization.",
                'technical_details': f"Season: {season}, Recommended maintenance items: filters, sensors, HVAC components",
                'expected_impact': "Ensure optimal system performance for upcoming season",
                'maintenance_focused': True
            })
        
        return recommendations
    
    def _prioritize_recommendations(self, recommendations: List[Dict]) -> List[Dict]:
        """Prioritize and filter recommendations"""
        # Remove duplicates
        unique_recommendations = []
        seen_actions = set()
        
        for rec in recommendations:
            action_key = f"{rec['category']}_{rec['action']}"
            if action_key not in seen_actions:
                unique_recommendations.append(rec)
                seen_actions.add(action_key)
        
        # Sort by priority
        priority_order = {'urgent': 0, 'high': 1, 'medium': 2, 'low': 3}
        unique_recommendations.sort(key=lambda x: priority_order.get(x['priority'], 3))
        
        # Limit to top 10 recommendations
        return unique_recommendations[:10]
    
    def get_smart_insights(self, 
                          current_conditions: Dict, 
                          historical_data: List[Dict]) -> Dict:
        """Generate smart insights using AI analysis"""
        insights = {
            'efficiency_score': self._calculate_efficiency_score(historical_data),
            'optimization_potential': self._assess_optimization_potential(current_conditions, historical_data),
            'risk_assessment': self._assess_current_risks(current_conditions),
            'performance_trends': self._analyze_performance_trends(historical_data),
            'cost_impact': self._estimate_cost_impact(current_conditions, historical_data)
        }
        
        return insights
    
    def _calculate_efficiency_score(self, historical_data: List[Dict]) -> Dict:
        """Calculate overall system efficiency score"""
        if not historical_data:
            return {'score': 0, 'grade': 'F', 'message': 'Insufficient data'}
        
        df = pd.DataFrame(historical_data)
        
        # Calculate stability scores
        stability_scores = []
        for metric in ['temperature', 'humidity', 'dust_level']:
            if metric in df.columns:
                values = df[metric].dropna()
                if len(values) > 0:
                    cv = values.std() / values.mean() if values.mean() != 0 else 1
                    stability_score = max(0, 100 - (cv * 100))
                    stability_scores.append(stability_score)
        
        overall_score = np.mean(stability_scores) if stability_scores else 0
        
        return {
            'score': float(overall_score),
            'grade': self._score_to_grade(overall_score),
            'message': self._interpret_efficiency_score(overall_score)
        }
    
    def _assess_optimization_potential(self, 
                                     current_conditions: Dict, 
                                     historical_data: List[Dict]) -> Dict:
        """Assess potential for optimization"""
        potential_savings = {
            'energy': random.uniform(10, 30),  # Placeholder - would use real analysis
            'quality': random.uniform(5, 20),
            'maintenance': random.uniform(15, 25)
        }
        
        total_potential = sum(potential_savings.values()) / 3
        
        return {
            'total_potential': float(total_potential),
            'energy_savings': float(potential_savings['energy']),
            'quality_improvement': float(potential_savings['quality']),
            'maintenance_reduction': float(potential_savings['maintenance']),
            'priority_areas': ['energy', 'maintenance', 'quality']
        }
    
    def _assess_current_risks(self, current_conditions: Dict) -> Dict:
        """Assess current risk levels"""
        risks = []
        
        temp = current_conditions.get('temperature', 20)
        humidity = current_conditions.get('humidity', 60)
        dust = current_conditions.get('dust_level', 30)
        
        if temp > 27:
            risks.append({'type': 'temperature', 'level': 'high', 'impact': 'coffee_degradation'})
        elif temp > 25:
            risks.append({'type': 'temperature', 'level': 'medium', 'impact': 'quality_reduction'})
        
        if humidity > 75:
            risks.append({'type': 'humidity', 'level': 'high', 'impact': 'mold_growth'})
        elif humidity > 70:
            risks.append({'type': 'humidity', 'level': 'medium', 'impact': 'quality_issues'})
        
        if dust > 75:
            risks.append({'type': 'air_quality', 'level': 'high', 'impact': 'contamination'})
        
        overall_risk = 'high' if any(r['level'] == 'high' for r in risks) else 'medium' if risks else 'low'
        
        return {
            'overall_risk': overall_risk,
            'individual_risks': risks,
            'risk_count': len(risks)
        }
    
    def _analyze_performance_trends(self, historical_data: List[Dict]) -> Dict:
        """Analyze performance trends"""
        if not historical_data:
            return {'trend': 'unknown', 'message': 'Insufficient data'}
        
        df = pd.DataFrame(historical_data)
        df['timestamp'] = pd.to_datetime(df['created_at'])
        df = df.sort_values('timestamp')
        
        # Simple trend analysis
        recent_data = df.tail(24)  # Last 24 hours
        older_data = df.head(24)   # First 24 hours
        
        trends = {}
        for metric in ['temperature', 'humidity', 'dust_level']:
            if metric in df.columns:
                recent_avg = recent_data[metric].mean()
                older_avg = older_data[metric].mean()
                
                if recent_avg > older_avg * 1.05:
                    trends[metric] = 'increasing'
                elif recent_avg < older_avg * 0.95:
                    trends[metric] = 'decreasing'
                else:
                    trends[metric] = 'stable'
        
        return {
            'individual_trends': trends,
            'overall_trend': 'improving' if list(trends.values()).count('stable') > 1 else 'variable'
        }
    
    def _estimate_cost_impact(self, 
                            current_conditions: Dict, 
                            historical_data: List[Dict]) -> Dict:
        """Estimate cost impact of current conditions"""
        # Placeholder cost analysis - would use real energy and quality cost models
        base_energy_cost = 100  # Base monthly cost
        base_quality_cost = 50  # Base quality-related costs
        
        # Calculate energy impact based on deviation from optimal
        temp_deviation = abs(current_conditions.get('temperature', 21) - 21)
        humidity_deviation = abs(current_conditions.get('humidity', 62) - 62)
        
        energy_multiplier = 1 + (temp_deviation * 0.05) + (humidity_deviation * 0.02)
        estimated_energy_cost = base_energy_cost * energy_multiplier
        
        # Calculate quality impact
        quality_risk = self._assess_current_risks(current_conditions)['overall_risk']
        quality_multiplier = {'low': 1.0, 'medium': 1.2, 'high': 1.5}[quality_risk]
        estimated_quality_cost = base_quality_cost * quality_multiplier
        
        total_monthly_cost = estimated_energy_cost + estimated_quality_cost
        
        return {
            'monthly_energy_cost': float(estimated_energy_cost),
            'monthly_quality_cost': float(estimated_quality_cost),
            'total_monthly_cost': float(total_monthly_cost),
            'potential_savings': float(total_monthly_cost * 0.2),  # 20% potential savings
            'cost_drivers': ['temperature_deviation', 'humidity_control', 'quality_risk']
        }
    
    def _score_to_grade(self, score: float) -> str:
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
    
    def _interpret_efficiency_score(self, score: float) -> str:
        """Interpret efficiency score"""
        if score >= 90:
            return "Excellent system performance with optimal stability"
        elif score >= 80:
            return "Good performance with minor optimization opportunities"
        elif score >= 70:
            return "Acceptable performance with room for improvement"
        elif score >= 60:
            return "Below average performance requiring attention"
        else:
            return "Poor performance requiring immediate optimization"

# Example usage
if __name__ == "__main__":
    # Initialize recommendation engine
    ai_engine = CoffeeStorageAIRecommendationEngine()
    
    # Sample current conditions
    current_conditions = {
        'temperature': 26.5,
        'humidity': 72.3,
        'dust_level': 45.2
    }
    
    # Sample forecasts
    forecasts = {
        'temperature': {
            'forecast_value': 28.2,
            'risk_level': 'warning',
            'hours_ahead': 12,
            'confidence': 0.85
        }
    }
    
    # Sample coffee profile
    coffee_profile = {
        'type': 'arabica',
        'processing': 'washed',
        'storage_months': 8
    }
    
    # Generate recommendations
    recommendations = ai_engine.generate_comprehensive_recommendations(
        current_conditions=current_conditions,
        forecasts=forecasts,
        trends={},
        patterns={},
        coffee_profile=coffee_profile
    )
    
    # Generate insights
    insights = ai_engine.get_smart_insights(current_conditions, [])
    
    print("AI Recommendation Engine Results:")
    print(f"Generated {len(recommendations)} recommendations")
    print(f"Efficiency Score: {insights['efficiency_score']['score']:.1f} ({insights['efficiency_score']['grade']})")
    print(f"Optimization Potential: {insights['optimization_potential']['total_potential']:.1f}%")
    print(f"Current Risk Level: {insights['risk_assessment']['overall_risk']}")
