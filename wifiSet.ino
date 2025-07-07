// Wi-Fi credentials
#define WIFI_SSID1 "derrickPhone"
#define WIFI_PASSWORD1 "12345678"
#define WIFI_SSID2 "RnD"
#define WIFI_PASSWORD2 "MegaBytes..."
#define WIFI_SSID3 "@idiot"
#define WIFI_PASSWORD3 "hook5000"
#define WIFI_SSID "CoDePro"
#define WIFI_PASSWORD "frank1122"

int attempt = 0;
bool isConnected() {
  return WiFi.status() == WL_CONNECTED;
}

void connectWifi() {
  const char* ssids[] = {WIFI_SSID, WIFI_SSID1, WIFI_SSID2, WIFI_SSID3};
  const char* passwords[] = {WIFI_PASSWORD, WIFI_PASSWORD1, WIFI_PASSWORD2, WIFI_PASSWORD3};

  for (int i = 0; i < 4; i++) {
    Serial.print("Connecting to: ");
    Serial.println(ssids[i]);

    WiFi.begin(ssids[i], passwords[i]);
    attempt = 0;

    while (WiFi.status() != WL_CONNECTED && attempt < 10) {
      delay(500);
      attempt++;
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("Connected with IP: ");
      Serial.println(WiFi.localIP());
      return;
    }
  }
  Serial.println("Connection failed!");
}

void connectToStrongestWiFi() {
  int n = WiFi.scanNetworks();
  int strongestSignal = -50;
  int strongestIndex = -1;

  for (int i = 0; i < n; i++) {
    int rssi = WiFi.RSSI(i);
    if (rssi > strongestSignal) {
      strongestSignal = rssi;
      strongestIndex = i;
    }
  }

  if (strongestIndex != -1) {
    const char* strongestPassword = "";
    String ssid = WiFi.SSID(strongestIndex);

    if (ssid == WIFI_SSID) strongestPassword = WIFI_PASSWORD;
    else if (ssid == WIFI_SSID1) strongestPassword = WIFI_PASSWORD1;
    else if (ssid == WIFI_SSID2) strongestPassword = WIFI_PASSWORD2;
    else if (ssid == WIFI_SSID3) strongestPassword = WIFI_PASSWORD3;

    WiFi.begin(ssid.c_str(), strongestPassword);
  }
}

void checkWiFi() {
  if (!isConnected()) {
    Serial.println("Reconnecting WiFi...");
    connectWifi();
  }
}
