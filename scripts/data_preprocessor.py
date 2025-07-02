import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
from typing import Dict, List, Tuple, Optional

class SensorDataPreprocessor:
    """
    Preprocesses sensor data for machine learning models.
    Handles cleaning, normalization, and feature engineering.
    """
    
    def __init__(self):
        self.temperature_bounds = (-10, 50)  # Celsius
        self.humidity_bounds = (0, 100)      # Percentage
        self.dust_bounds = (0, 1000)         # PM2.5 µg/m³
        
    def clean_sensor_data(self, data: List[Dict]) -> pd.DataFrame:
        """Clean and validate sensor data"""
        df = pd.DataFrame(data)
        
        # Convert timestamp to datetime
        df['timestamp'] = pd.to_datetime(df['created_at'])
        df = df.sort_values('timestamp')
        
        # Remove outliers
        df = self._remove_outliers(df)
        
        # Handle missing values
        df = self._handle_missing_values(df)
        
        # Add time-based features
        df = self._add_time_features(df)
        
        return df
    
    def _remove_outliers(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove sensor reading outliers"""
        # Temperature outliers
        temp_mask = (df['temperature'] >= self.temperature_bounds[0]) & \
                   (df['temperature'] <= self.temperature_bounds[1])
        
        # Humidity outliers
        humidity_mask = (df['humidity'] >= self.humidity_bounds[0]) & \
                       (df['humidity'] <= self.humidity_bounds[1])
        
        # Dust outliers
        dust_mask = (df['dust_level'] >= self.dust_bounds[0]) & \
                   (df['dust_level'] <= self.dust_bounds[1])
        
        # Keep only valid readings
        valid_mask = temp_mask & humidity_mask & dust_mask
        
        print(f"Removed {len(df) - valid_mask.sum()} outlier readings")
        return df[valid_mask].copy()
    
    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing sensor values using interpolation"""
        # Forward fill then backward fill for small gaps
        df['temperature'] = df['temperature'].fillna(method='ffill').fillna(method='bfill')
        df['humidity'] = df['humidity'].fillna(method='ffill').fillna(method='bfill')
        df['dust_level'] = df['dust_level'].fillna(method='ffill').fillna(method='bfill')
        
        # For larger gaps, use linear interpolation
        df['temperature'] = df['temperature'].interpolate(method='linear')
        df['humidity'] = df['humidity'].interpolate(method='linear')
        df['dust_level'] = df['dust_level'].interpolate(method='linear')
        
        return df
    
    def _add_time_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add time-based features for better predictions"""
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['month'] = df['timestamp'].dt.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Add rolling averages
        df['temp_rolling_24h'] = df['temperature'].rolling(window=24, min_periods=1).mean()
        df['humidity_rolling_24h'] = df['humidity'].rolling(window=24, min_periods=1).mean()
        df['dust_rolling_24h'] = df['dust_level'].rolling(window=24, min_periods=1).mean()
        
        # Add rate of change
        df['temp_change_rate'] = df['temperature'].diff()
        df['humidity_change_rate'] = df['humidity'].diff()
        df['dust_change_rate'] = df['dust_level'].diff()
        
        return df
    
    def create_features_for_prediction(self, df: pd.DataFrame) -> np.ndarray:
        """Create feature matrix for ML models"""
        features = [
            'temperature', 'humidity', 'dust_level',
            'hour', 'day_of_week', 'month', 'is_weekend',
            'temp_rolling_24h', 'humidity_rolling_24h', 'dust_rolling_24h',
            'temp_change_rate', 'humidity_change_rate', 'dust_change_rate'
        ]
        
        # Fill any remaining NaN values
        feature_df = df[features].fillna(0)
        
        return feature_df.values
    
    def normalize_features(self, features: np.ndarray) -> Tuple[np.ndarray, Dict]:
        """Normalize features and return normalization parameters"""
        from sklearn.preprocessing import StandardScaler
        
        scaler = StandardScaler()
        normalized_features = scaler.fit_transform(features)
        
        # Store normalization parameters
        norm_params = {
            'mean': scaler.mean_.tolist(),
            'scale': scaler.scale_.tolist()
        }
        
        return normalized_features, norm_params

# Example usage
if __name__ == "__main__":
    # Sample data processing
    preprocessor = SensorDataPreprocessor()
    
    # Sample sensor data
    sample_data = [
        {
            'temperature': 23.5,
            'humidity': 65.2,
            'dust_level': 45.8,
            'created_at': '2024-01-01T10:00:00Z'
        },
        {
            'temperature': 24.1,
            'humidity': 63.8,
            'dust_level': 47.2,
            'created_at': '2024-01-01T11:00:00Z'
        }
    ]
    
    # Process the data
    cleaned_df = preprocessor.clean_sensor_data(sample_data)
    features = preprocessor.create_features_for_prediction(cleaned_df)
    normalized_features, norm_params = preprocessor.normalize_features(features)
    
    print("Data preprocessing completed successfully!")
    print(f"Processed {len(cleaned_df)} sensor readings")
    print(f"Created {features.shape[1]} features for ML models")
