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
