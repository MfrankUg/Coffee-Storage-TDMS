import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from scipy import stats
import json

class CoffeeStoragePatternRecognition:
    """
    Advanced pattern recognition for coffee storage systems.
    Identifies operational patterns, anomalies, and optimization opportunities.
    """
    
    def __init__(self):
        self.patterns = {}
        self.seasonal_patterns = {}
        self.anomaly_patterns = {}
        
    def identify_daily_patterns(self, df: pd.DataFrame) -> Dict:
        """Identify daily patterns in sensor data"""
        df['timestamp'] = pd.to_datetime(df['created_at'])
        df['hour'] = df['timestamp'].dt.hour
        
        daily_patterns = {}
        
        for metric in ['temperature', 'humidity', 'dust_level']:
            if metric in df.columns:
                # Group by hour and calculate statistics
                hourly_stats = df.groupby('hour')[metric].agg([
                    'mean', 'std', 'min', 'max', 'count'
                ]).round(2)
                
                # Find peak and low hours
                peak_hour = hourly_stats['mean'].idxmax()
                low_hour = hourly_stats['mean'].idxmin()
                
                # Calculate daily variation
                daily_range = hourly_stats['mean'].max() - hourly_stats['mean'].min()
                avg_value = hourly_stats['mean'].mean()
                variation_coefficient = (daily_range / avg_value) * 100 if avg_value != 0 else 0
                
                # Identify stable hours (low variation)
                stable_hours = hourly_stats[hourly_stats['std'] < hourly_stats['std'].quantile(0.25)].index.tolist()
                
                daily_patterns[metric] = {
                    'peak_hour': int(peak_hour),
                    'peak_value': float(hourly_stats.loc[peak_hour, 'mean']),
                    'low_hour': int(low_hour),
                    'low_value': float(hourly_stats.loc[low_hour, 'mean']),
                    'daily_range': float(daily_range),
                    'variation_coefficient': float(variation_coefficient),
                    'stable_hours': stable_hours,
                    'hourly_averages': hourly_stats['mean'].to_dict()
                }
        
        return daily_patterns
    
    def identify_weekly_patterns(self, df: pd.DataFrame) -> Dict:
        """Identify weekly patterns in sensor data"""
        df['timestamp'] = pd.to_datetime(df['created_at'])
        df['day_of_week'] = df['timestamp'].dt.day_name()
        df['is_weekend'] = df['timestamp'].dt.dayofweek.isin([5, 6])
        
        weekly_patterns = {}
        
        for metric in ['temperature', 'humidity', 'dust_level']:
            if metric in df.columns:
                # Compare weekday vs weekend patterns
                weekday_data = df[~df['is_weekend']][metric].dropna()
                weekend_data = df[df['is_weekend']][metric].dropna()
                
                if len(weekday_data) > 0 and len(weekend_data) > 0:
                    # Statistical comparison
                    weekday_mean = weekday_data.mean()
                    weekend_mean = weekend_data.mean()
                    
                    # T-test for significant difference
                    t_stat, p_value = stats.ttest_ind(weekday_data, weekend_data)
                    
                    # Daily averages
                    daily_averages = df.groupby('day_of_week')[metric].mean().to_dict()
                    
                    weekly_patterns[metric] = {
                        'weekday_average': float(weekday_mean),
                        'weekend_average': float(weekend_mean),
                        'difference': float(weekend_mean - weekday_mean),
                        'significant_difference': bool(p_value < 0.05),
                        'p_value': float(p_value),
                        'daily_averages': daily_averages,
                        'pattern_strength': float(abs(weekend_mean - weekday_mean) / weekday_mean) if weekday_mean != 0 else 0
                    }
        
        return weekly_patterns
    
    def identify_seasonal_patterns(self, df: pd.DataFrame) -> Dict:
        """Identify seasonal patterns in sensor data"""
        df['timestamp'] = pd.to_datetime(df['created_at'])
        df['month'] = df['timestamp'].dt.month
        df['season'] = df['month'].map({
            12: 'Winter', 1: 'Winter', 2: 'Winter',
            3: 'Spring', 4: 'Spring', 5: 'Spring',
            6: 'Summer', 7: 'Summer', 8: 'Summer',
            9: 'Fall', 10: 'Fall', 11: 'Fall'
        })
        
        seasonal_patterns = {}
        
        for metric in ['temperature', 'humidity', 'dust_level']:
            if metric in df.columns:
                # Group by season
                seasonal_stats = df.groupby('season')[metric].agg([
                    'mean', 'std', 'min', 'max'
                ]).round(2)
                
                # Monthly averages
                monthly_averages = df.groupby('month')[metric].mean().to_dict()
                
                # Find seasonal trends
                seasonal_means = seasonal_stats['mean'].to_dict()
                highest_season = max(seasonal_means, key=seasonal_means.get)
                lowest_season = min(seasonal_means, key=seasonal_means.get)
                
                seasonal_patterns[metric] = {
                    'seasonal_averages': seasonal_means,
                    'monthly_averages': monthly_averages,
                    'highest_season': highest_season,
                    'lowest_season': lowest_season,
                    'seasonal_range': float(max(seasonal_means.values()) - min(seasonal_means.values())),
                    'seasonal_stats': seasonal_stats.to_dict()
                }
        
        return seasonal_patterns
    
    def detect_operational_patterns(self, df: pd.DataFrame) -> Dict:
        """Detect operational patterns using clustering"""
        # Prepare features for clustering
        df['timestamp'] = pd.to_datetime(df['created_at'])
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        
        features = ['temperature', 'humidity', 'dust_level', 'hour', 'day_of_week']
        available_features = [f for f in features if f in df.columns]
        
        if len(available_features) < 3:
            return {'error': 'Insufficient features for pattern detection'}
        
        # Prepare data for clustering
        cluster_data = df[available_features].dropna()
        
        if len(cluster_data) < 10:
            return {'error': 'Insufficient data for clustering'}
        
        # Normalize features
        scaler = StandardScaler()
        normalized_data = scaler.fit_transform(cluster_data)
        
        # Perform clustering
        n_clusters = min(5, len(cluster_data) // 10)  # Adaptive number of clusters
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(normalized_data)
        
        # Analyze clusters
        cluster_data['cluster'] = cluster_labels
        
        operational_patterns = {}
        
        for cluster_id in range(n_clusters):
            cluster_subset = cluster_data[cluster_data['cluster'] == cluster_id]
            
            if len(cluster_subset) > 0:
                # Calculate cluster characteristics
                cluster_stats = {}
                for feature in available_features:
                    if feature in ['hour', 'day_of_week']:
                        cluster_stats[feature] = {
                            'mode': float(cluster_subset[feature].mode().iloc[0]) if len(cluster_subset[feature].mode()) > 0 else 0,
                            'range': [float(cluster_subset[feature].min()), float(cluster_subset[feature].max())]
                        }
                    else:
                        cluster_stats[feature] = {
                            'mean': float(cluster_subset[feature].mean()),
                            'std': float(cluster_subset[feature].std()),
                            'range': [float(cluster_subset[feature].min()), float(cluster_subset[feature].max())]
                        }
                
                # Determine cluster characteristics
                cluster_size = len(cluster_subset)
                cluster_percentage = (cluster_size / len(cluster_data)) * 100
                
                # Classify cluster type
                cluster_type = self._classify_cluster_type(cluster_stats)
                
                operational_patterns[f'pattern_{cluster_id}'] = {
                    'type': cluster_type,
                    'size': cluster_size,
                    'percentage': float(cluster_percentage),
                    'characteristics': cluster_stats,
                    'description': self._describe_cluster(cluster_stats, cluster_type)
                }
        
        return operational_patterns
    
    def _classify_cluster_type(self, cluster_stats: Dict) -> str:
        """Classify cluster type based on characteristics"""
        temp_mean = cluster_stats.get('temperature', {}).get('mean', 20)
        humidity_mean = cluster_stats.get('humidity', {}).get('mean', 60)
        dust_mean = cluster_stats.get('dust_level', {}).get('mean', 50)
        
        # Define cluster types based on conditions
        if temp_mean > 25 and humidity_mean > 70:
            return 'high_stress'
        elif temp_mean < 18 or humidity_mean < 50:
            return 'suboptimal_low'
        elif 20 <= temp_mean <= 24 and 55 <= humidity_mean <= 70 and dust_mean < 40:
            return 'optimal'
        elif dust_mean > 75:
            return 'high_contamination'
        else:
            return 'normal'
    
    def _describe_cluster(self, cluster_stats: Dict, cluster_type: str) -> str:
        """Generate human-readable description of cluster"""
        descriptions = {
            'optimal': 'Ideal storage conditions with temperature, humidity, and air quality within optimal ranges',
            'high_stress': 'High temperature and humidity conditions that may stress coffee beans',
            'suboptimal_low': 'Below-optimal temperature or humidity that may affect coffee quality',
            'high_contamination': 'Elevated dust levels requiring air filtration attention',
            'normal': 'Standard operating conditions within acceptable ranges'
        }
        
        return descriptions.get(cluster_type, 'Unclassified operational pattern')
    
    def detect_anomaly_patterns(self, df: pd.DataFrame) -> Dict:
        """Detect patterns in anomalous behavior"""
        df['timestamp'] = pd.to_datetime(df['created_at'])
        
        anomaly_patterns = {}
        
        for metric in ['temperature', 'humidity', 'dust_level']:
            if metric in df.columns:
                values = df[metric].dropna()
                
                if len(values) > 10:
                    # Calculate z-scores to identify anomalies
                    z_scores = np.abs(stats.zscore(values))
                    anomaly_threshold = 2.5
                    anomalies = z_scores > anomaly_threshold
                    
                    if anomalies.sum() > 0:
                        anomaly_data = df[anomalies]
                        
                        # Analyze timing patterns of anomalies
                        anomaly_hours = anomaly_data['timestamp'].dt.hour.value_counts()
                        anomaly_days = anomaly_data['timestamp'].dt.day_name().value_counts()
                        
                        # Calculate anomaly statistics
                        anomaly_values = values[anomalies]
                        
                        anomaly_patterns[metric] = {
                            'total_anomalies': int(anomalies.sum()),
                            'anomaly_percentage': float((anomalies.sum() / len(values)) * 100),
                            'most_common_hour': anomaly_hours.index[0] if len(anomaly_hours) > 0 else None,
                            'most_common_day': anomaly_days.index[0] if len(anomaly_days) > 0 else None,
                            'anomaly_value_range': [float(anomaly_values.min()), float(anomaly_values.max())],
                            'average_anomaly_value': float(anomaly_values.mean()),
                            'hourly_distribution': anomaly_hours.to_dict(),
                            'daily_distribution': anomaly_days.to_dict()
                        }
        
        return anomaly_patterns
    
    def generate_pattern_insights(self, 
                                daily_patterns: Dict, 
                                weekly_patterns: Dict, 
                                seasonal_patterns: Dict,
                                operational_patterns: Dict) -> List[Dict]:
        """Generate actionable insights from identified patterns"""
        insights = []
        
        # Daily pattern insights
        for metric, pattern in daily_patterns.items():
            if pattern['variation_coefficient'] > 20:
                insights.append({
                    'type': 'daily_variation',
                    'metric': metric,
                    'severity': 'high' if pattern['variation_coefficient'] > 30 else 'medium',
                    'message': f"{metric.title()} shows high daily variation ({pattern['variation_coefficient']:.1f}%). Peak at {pattern['peak_hour']}:00, low at {pattern['low_hour']}:00.",
                    'recommendation': f"Consider adjusting HVAC scheduling around peak hours ({pattern['peak_hour']}:00) to reduce variation."
                })
            
            if len(pattern['stable_hours']) >= 6:
                insights.append({
                    'type': 'stability_window',
                    'metric': metric,
                    'severity': 'info',
                    'message': f"{metric.title()} is most stable during hours: {', '.join(map(str, pattern['stable_hours']))}",
                    'recommendation': "Schedule maintenance and inspections during stable hours to minimize disruption."
                })
        
        # Weekly pattern insights
        for metric, pattern in weekly_patterns.items():
            if pattern['significant_difference'] and abs(pattern['difference']) > 2:
                insights.append({
                    'type': 'weekend_effect',
                    'metric': metric,
                    'severity': 'medium',
                    'message': f"{metric.title()} differs significantly between weekdays and weekends ({pattern['difference']:.1f} difference).",
                    'recommendation': "Adjust weekend operational parameters to maintain consistency."
                })
        
        # Operational pattern insights
        for pattern_id, pattern in operational_patterns.items():
            if pattern['type'] == 'high_stress' and pattern['percentage'] > 20:
                insights.append({
                    'type': 'operational_concern',
                    'metric': 'multiple',
                    'severity': 'high',
                    'message': f"High-stress conditions occur {pattern['percentage']:.1f}% of the time.",
                    'recommendation': "Review HVAC settings and consider system upgrades to reduce stress conditions."
                })
            elif pattern['type'] == 'optimal' and pattern['percentage'] > 60:
                insights.append({
                    'type': 'operational_success',
                    'metric': 'multiple',
                    'severity': 'info',
                    'message': f"Optimal conditions maintained {pattern['percentage']:.1f}% of the time.",
                    'recommendation': "Current operational parameters are working well. Document settings for consistency."
                })
        
        return insights

# Example usage
if __name__ == "__main__":
    # Initialize pattern recognition
    pattern_recognizer = CoffeeStoragePatternRecognition()
    
    # Generate sample data
    dates = pd.date_range(start='2024-01-01', end='2024-03-31', freq='H')
    sample_df = pd.DataFrame({
        'created_at': dates,
        'temperature': 22 + 3 * np.sin(np.arange(len(dates)) * 2 * np.pi / 24) + np.random.normal(0, 1, len(dates)),
        'humidity': 65 + 5 * np.cos(np.arange(len(dates)) * 2 * np.pi / 24) + np.random.normal(0, 2, len(dates)),
        'dust_level': 30 + np.random.normal(0, 10, len(dates))
    })
    
    # Run pattern recognition
    daily_patterns = pattern_recognizer.identify_daily_patterns(sample_df)
    weekly_patterns = pattern_recognizer.identify_weekly_patterns(sample_df)
    seasonal_patterns = pattern_recognizer.identify_seasonal_patterns(sample_df)
    operational_patterns = pattern_recognizer.detect_operational_patterns(sample_df)
    anomaly_patterns = pattern_recognizer.detect_anomaly_patterns(sample_df)
    
    # Generate insights
    insights = pattern_recognizer.generate_pattern_insights(
        daily_patterns, weekly_patterns, seasonal_patterns, operational_patterns
    )
    
    print("Pattern Recognition Results:")
    print(f"Daily patterns identified: {len(daily_patterns)}")
    print(f"Weekly patterns identified: {len(weekly_patterns)}")
    print(f"Operational patterns identified: {len(operational_patterns)}")
    print(f"Insights generated: {len(insights)}")
