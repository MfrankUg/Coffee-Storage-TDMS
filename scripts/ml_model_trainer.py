import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional

class CoffeeStorageMLTrainer:
    """
    Machine Learning model trainer for coffee storage optimization.
    Trains models for temperature, humidity, and dust level prediction.
    """
    
    def __init__(self):
        self.models = {}
        self.model_metrics = {}
        self.anomaly_detector = None
        
    def train_prediction_models(self, df: pd.DataFrame) -> Dict:
        """Train prediction models for temperature, humidity, and dust"""
        results = {}
        
        # Prepare features (excluding target variables)
        feature_columns = [
            'hour', 'day_of_week', 'month', 'is_weekend',
            'temp_rolling_24h', 'humidity_rolling_24h', 'dust_rolling_24h',
            'temp_change_rate', 'humidity_change_rate', 'dust_change_rate'
        ]
        
        X = df[feature_columns].fillna(0)
        
        # Train models for each target variable
        targets = {
            'temperature': 'temperature',
            'humidity': 'humidity', 
            'dust_level': 'dust_level'
        }
        
        for target_name, target_col in targets.items():
            print(f"Training model for {target_name}...")
            
            y = df[target_col].fillna(df[target_col].mean())
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Train Random Forest model
            rf_model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            rf_model.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = rf_model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            # Cross-validation
            cv_scores = cross_val_score(rf_model, X, y, cv=5, scoring='r2')
            
            # Store model and metrics
            self.models[target_name] = rf_model
            self.model_metrics[target_name] = {
                'mse': float(mse),
                'r2': float(r2),
                'cv_mean': float(cv_scores.mean()),
                'cv_std': float(cv_scores.std()),
                'feature_importance': dict(zip(feature_columns, rf_model.feature_importances_))
            }
            
            results[target_name] = {
                'model_trained': True,
                'r2_score': float(r2),
                'cross_val_score': float(cv_scores.mean())
            }
            
            print(f"✓ {target_name} model - R² Score: {r2:.3f}, CV Score: {cv_scores.mean():.3f}")
        
        return results
    
    def train_anomaly_detector(self, df: pd.DataFrame) -> Dict:
        """Train anomaly detection model"""
        print("Training anomaly detection model...")
        
        # Use all sensor readings for anomaly detection
        features = df[['temperature', 'humidity', 'dust_level']].fillna(0)
        
        # Train Isolation Forest
        self.anomaly_detector = IsolationForest(
            contamination=0.1,  # Expect 10% anomalies
            random_state=42,
            n_jobs=-1
        )
        
        self.anomaly_detector.fit(features)
        
        # Test anomaly detection
        anomaly_scores = self.anomaly_detector.decision_function(features)
        anomalies = self.anomaly_detector.predict(features)
        
        anomaly_count = (anomalies == -1).sum()
        anomaly_percentage = (anomaly_count / len(features)) * 100
        
        print(f"✓ Anomaly detector trained - Found {anomaly_count} anomalies ({anomaly_percentage:.1f}%)")
        
        return {
            'model_trained': True,
            'anomaly_count': int(anomaly_count),
            'anomaly_percentage': float(anomaly_percentage)
        }
    
    def predict_future_conditions(self, current_data: Dict, hours_ahead: int = 24) -> Dict:
        """Predict future storage conditions"""
        predictions = {}
        
        # Create feature vector from current data
        features = np.array([[
            current_data.get('hour', 12),
            current_data.get('day_of_week', 1),
            current_data.get('month', 1),
            current_data.get('is_weekend', 0),
            current_data.get('temp_rolling_24h', current_data.get('temperature', 20)),
            current_data.get('humidity_rolling_24h', current_data.get('humidity', 60)),
            current_data.get('dust_rolling_24h', current_data.get('dust_level', 50)),
            current_data.get('temp_change_rate', 0),
            current_data.get('humidity_change_rate', 0),
            current_data.get('dust_change_rate', 0)
        ]])
        
        # Make predictions for each target
        for target_name, model in self.models.items():
            try:
                prediction = model.predict(features)[0]
                confidence = self.model_metrics[target_name]['r2']
                
                predictions[target_name] = {
                    'predicted_value': float(prediction),
                    'confidence': float(confidence),
                    'hours_ahead': hours_ahead
                }
            except Exception as e:
                print(f"Error predicting {target_name}: {e}")
                predictions[target_name] = {
                    'predicted_value': current_data.get(target_name.replace('_level', ''), 0),
                    'confidence': 0.0,
                    'hours_ahead': hours_ahead
                }
        
        return predictions
    
    def detect_anomalies(self, sensor_data: List[Dict]) -> List[Dict]:
        """Detect anomalies in sensor data"""
        if not self.anomaly_detector:
            return []
        
        # Prepare data
        df = pd.DataFrame(sensor_data)
        features = df[['temperature', 'humidity', 'dust_level']].fillna(0)
        
        # Detect anomalies
        anomaly_scores = self.anomaly_detector.decision_function(features)
        anomalies = self.anomaly_detector.predict(features)
        
        # Return anomalous readings
        anomalous_data = []
        for i, (is_anomaly, score) in enumerate(zip(anomalies, anomaly_scores)):
            if is_anomaly == -1:  # Anomaly detected
                anomalous_data.append({
                    'index': i,
                    'data': sensor_data[i],
                    'anomaly_score': float(score),
                    'severity': 'high' if score < -0.5 else 'medium'
                })
        
        return anomalous_data
    
    def save_models(self, filepath_prefix: str = 'coffee_storage_models'):
        """Save trained models to disk"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Save prediction models
        for target_name, model in self.models.items():
            filename = f"{filepath_prefix}_{target_name}_{timestamp}.joblib"
            joblib.dump(model, filename)
            print(f"Saved {target_name} model to {filename}")
        
        # Save anomaly detector
        if self.anomaly_detector:
            anomaly_filename = f"{filepath_prefix}_anomaly_detector_{timestamp}.joblib"
            joblib.dump(self.anomaly_detector, anomaly_filename)
            print(f"Saved anomaly detector to {anomaly_filename}")
        
        # Save metrics
        metrics_filename = f"{filepath_prefix}_metrics_{timestamp}.json"
        with open(metrics_filename, 'w') as f:
            json.dump(self.model_metrics, f, indent=2)
        print(f"Saved model metrics to {metrics_filename}")
    
    def load_models(self, filepath_prefix: str, timestamp: str):
        """Load trained models from disk"""
        targets = ['temperature', 'humidity', 'dust_level']
        
        for target in targets:
            filename = f"{filepath_prefix}_{target}_{timestamp}.joblib"
            try:
                self.models[target] = joblib.load(filename)
                print(f"Loaded {target} model from {filename}")
            except FileNotFoundError:
                print(f"Model file not found: {filename}")
        
        # Load anomaly detector
        anomaly_filename = f"{filepath_prefix}_anomaly_detector_{timestamp}.joblib"
        try:
            self.anomaly_detector = joblib.load(anomaly_filename)
            print(f"Loaded anomaly detector from {anomaly_filename}")
        except FileNotFoundError:
            print(f"Anomaly detector file not found: {anomaly_filename}")

# Example usage
if __name__ == "__main__":
    # Initialize trainer
    trainer = CoffeeStorageMLTrainer()
    
    # Sample training data
    sample_df = pd.DataFrame({
        'temperature': np.random.normal(22, 3, 1000),
        'humidity': np.random.normal(65, 10, 1000),
        'dust_level': np.random.normal(50, 15, 1000),
        'hour': np.random.randint(0, 24, 1000),
        'day_of_week': np.random.randint(0, 7, 1000),
        'month': np.random.randint(1, 13, 1000),
        'is_weekend': np.random.randint(0, 2, 1000),
        'temp_rolling_24h': np.random.normal(22, 2, 1000),
        'humidity_rolling_24h': np.random.normal(65, 8, 1000),
        'dust_rolling_24h': np.random.normal(50, 12, 1000),
        'temp_change_rate': np.random.normal(0, 0.5, 1000),
        'humidity_change_rate': np.random.normal(0, 2, 1000),
        'dust_change_rate': np.random.normal(0, 3, 1000)
    })
    
    # Train models
    prediction_results = trainer.train_prediction_models(sample_df)
    anomaly_results = trainer.train_anomaly_detector(sample_df)
    
    print("\nTraining completed successfully!")
    print("Prediction models:", prediction_results)
    print("Anomaly detection:", anomaly_results)
