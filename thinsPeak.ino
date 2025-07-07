
void sendDataToThingSpeak() {
  if (client.connect(host, httpPort)) {
    String url = "/update?api_key=" + writeApiKey;
    url += "&field1=" + String(concentration2);
    url += "&field2=" + String(concentration1);
    url += "&field5=" + String(temperature);
    url += "&field4=" + String(humidity);
    url += "&field6=" + latitude;
    url += "&field7=" + longitude;

    client.print(String("GET ") + url + " HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" +
               "Connection: close\r\n\r\n");
  }
  client.stop();
}

void getGeoLocation() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin("http://ip-api.com/json/");
    int httpCode = http.GET();

    if (httpCode > 0) {
      String payload = http.getString();
      StaticJsonDocument<512> doc;
      deserializeJson(doc, payload);

      latitude = String(doc["lat"].as<float>(), 6);
      longitude = String(doc["lon"].as<float>(), 6);
    }
    http.end();
  }
}
