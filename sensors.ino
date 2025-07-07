void dustConc() {
  unsigned long duration1 = pulseIn(VOUT1_PIN, LOW);
  unsigned long duration2 = pulseIn(VOUT2_PIN, LOW);

  float lowRatio1 = (duration1 / 30000.0) * 100.0;
  float lowRatio2 = (duration2 / 30000.0) * 100.0;

  concentration1 = (lowRatio1 - 0.5) * 1.1;
  concentration2 = (lowRatio2 - 0.5) * 1.1;
}

void readDHTSensor() {
  int temp = 0;
  int hum = 0;

  int result = dht11.readTemperatureHumidity(temp, hum);

  if (result == 0) {
    temperature = temp;
    humidity = hum;
  } else {
    Serial.println(DHT11::getErrorString(result));
  }
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
void soundBuzzer(float grit, float mote) {
  float aqi = (grit * 0.7) + (mote * 0.3);

  if (aqi < 0.1) {
    digitalWrite(BUZZER_PIN, LOW); // No buzz
    delay(1000);
  }
  else if (aqi < 0.2) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);  // Short beep
    digitalWrite(BUZZER_PIN, LOW);
    delay(3000); // Long pause
  }
  else if (aqi < 0.5) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(300);  // Beep
    digitalWrite(BUZZER_PIN, LOW);
    delay(1000); // Medium pause
  }
  else {
    for (int i = 0; i < 3; i++) {
      digitalWrite(BUZZER_PIN, HIGH);
      delay(400);  // Long beep
      digitalWrite(BUZZER_PIN, LOW);
      delay(200);  // Short pause
    }
  }
}
