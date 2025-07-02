void displayPredictions() {
  String prediction = predictAirQuality(concentration1, concentration2);
  String advice = getHealthAdvice(concentration1, concentration2);
  String effects = getSideEffects(concentration1, concentration2);

  lcd.setCursor(0, 0);
  lcd.print("AQI: ");
  lcd.print(prediction);

  lcd.setCursor(0, 1);
  lcd.print(advice.substring(0, 20));

  lcd.setCursor(0, 2);
  if (advice.length() > 20) {
    lcd.print(advice.substring(20));
  } else {
    lcd.print(effects.substring(0, 20));
  }

  lcd.setCursor(0, 3);
  lcd.print(effects.substring(0, 20));
}

String predictAirQuality(float grit, float mote) {
  float aqi = (grit * 0.7) + (mote * 0.3);

  if (aqi < 0.05) return "Excellent";
  else if (aqi < 0.1) return "Good";
  else if (aqi < 0.2) return "Moderate";
  else if (aqi < 0.5) return "Unhealthy";
  else return "Hazardous";
}

String getHealthAdvice(float grit, float mote) {
  float totalDust = grit + mote;

  if (totalDust < 0.05) return "Safe to work normally";
  else if (totalDust < 0.1) return "Consider short breaks";
  else if (totalDust < 0.2) return "Use masks, limit exposure";
  else if (totalDust < 0.5) return "Wear respirators, reduce hours";
  else return "EVACUATE or use full PPE";
}

String getSideEffects(float grit, float mote) {
  float totalDust = grit + mote;

  if (totalDust < 0.05) return "No health effects";
  else if (totalDust < 0.1) return "Minor irritation";
  else if (totalDust < 0.2) return "Coughing, eye irritation";
  else if (totalDust < 0.5) return "Respiratory issues";
  else return "Severe health risk!";
}
void displayMeasurements() {
  lcd.setCursor(0, 0);
  lcd.print("GRIT: ");
  lcd.print(concentration1);
  lcd.print(" mg/m3");

  lcd.setCursor(0, 1);
  lcd.print("MOTE: ");
  lcd.print(concentration2);
  lcd.print(" mg/m3");

  lcd.setCursor(0, 2);
  lcd.print("Temp: ");
  lcd.print(temperature);
  lcd.print("C");

  lcd.setCursor(0, 3);
  lcd.print("Humidity: ");
  lcd.print(humidity);
  lcd.print("%");
}
