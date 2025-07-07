void displayEnvironmentStatus() {
  float avgDust = (concentration1 + concentration2) / 2.0;

  // First line: Temperature status
  lcd.setCursor(0, 0);
  if (temperature > TEMP_CRITICAL) {
    lcd.print("TEMP: CRITICAL! >");
    lcd.print(TEMP_CRITICAL);
    lcd.print("C");
  } else if (temperature > TEMP_WARNING) {
    lcd.print("TEMP: High >");
    lcd.print(TEMP_WARNING);
    lcd.print("C");
  } else {
    lcd.print("Temp: OK ");
    lcd.print(temperature);
    lcd.print("C");
  }

  // Second line: Humidity status
  lcd.setCursor(0, 1);
  if (humidity > HUMIDITY_CRITICAL) {
    lcd.print("HUM: CRITICAL! >");
    lcd.print(HUMIDITY_CRITICAL);
    lcd.print("%");
  } else if (humidity > HUMIDITY_WARNING) {
    lcd.print("HUM: High >");
    lcd.print(HUMIDITY_WARNING);
    lcd.print("%");
  } else {
    lcd.print("Humidity: OK ");
    lcd.print(humidity);
    lcd.print("%");
  }

  // Third line: Dust status
  lcd.setCursor(0, 2);
  if (avgDust > DUST_CRITICAL) {
    lcd.print("DUST: CRITICAL! >");
    lcd.print(DUST_CRITICAL);
    lcd.print("ug/m3");
  } else if (avgDust > DUST_WARNING) {
    lcd.print("DUST: High >");
    lcd.print(DUST_WARNING);
    lcd.print("ug/m3");
  } else {
    lcd.print("Dust: OK ");
    lcd.print(avgDust);
    lcd.print("ug/m3");
  }

  // Fourth line: Recommended action
  lcd.setCursor(0, 3);
  if (temperature > TEMP_CRITICAL) {
    lcd.print("ACT: Cool room now!");
  } else if (humidity > HUMIDITY_CRITICAL) {
    lcd.print("ACT: Reduce humidity!");
  } else if (avgDust > DUST_CRITICAL) {
    lcd.print("ACT: Clean area now!");
  } else if (temperature > TEMP_WARNING) {
    lcd.print("ACT: Monitor temp");
  } else if (humidity > HUMIDITY_WARNING) {
    lcd.print("ACT: Monitor humidity");
  } else if (avgDust > DUST_WARNING) {
    lcd.print("ACT: Clean soon");
  } else {
    lcd.print("Conditions optimal");
  }
}

String getHealthAdvice(float grit, float mote) {
  float avgDust = (grit + mote) / 2.0;

  if (avgDust < DUST_WARNING && temperature < TEMP_WARNING && humidity < HUMIDITY_WARNING) {
    return "Conditions optimal";
  } else if (temperature > TEMP_CRITICAL) {
    return "Cool storage immediately";
  } else if (humidity > HUMIDITY_CRITICAL) {
    return "Reduce humidity now";
  } else if (avgDust > DUST_CRITICAL) {
    return "Clean area immediately";
  } else if (temperature > TEMP_WARNING) {
    return "Monitor temperature";
  } else if (humidity > HUMIDITY_WARNING) {
    return "Monitor humidity";
  } else if (avgDust > DUST_WARNING) {
    return "Clean area soon";
  } else {
    return "Conditions acceptable";
  }
}

String getSideEffects(float grit, float mote) {
  float avgDust = (grit + mote) / 2.0;

  if (temperature > TEMP_CRITICAL) {
    return "Coffee may degrade quickly";
  } else if (humidity > HUMIDITY_CRITICAL) {
    return "Mold risk! Beans may clump";
  } else if (avgDust > DUST_CRITICAL) {
    return "Dust affects flavor quality";
  } else if (temperature > TEMP_WARNING) {
    return "Long-term storage affected";
  } else if (humidity > HUMIDITY_WARNING) {
    return "Potential flavor changes";
  } else if (avgDust > DUST_WARNING) {
    return "Dust may contaminate";
  } else {
    return "No negative effects";
  }
}

String predictAirQuality(float grit, float mote) {
  float avgDust = (grit + mote) / 2.0;

  if (avgDust < DUST_WARNING && temperature < TEMP_WARNING && humidity < HUMIDITY_WARNING) {
    return "Perfect";
  } else if (temperature > TEMP_CRITICAL || humidity > HUMIDITY_CRITICAL || avgDust > DUST_CRITICAL) {
    return "Critical";
  } else if (temperature > TEMP_WARNING || humidity > HUMIDITY_WARNING || avgDust > DUST_WARNING) {
    return "Caution";
  } else {
    return "Good";
  }
}
