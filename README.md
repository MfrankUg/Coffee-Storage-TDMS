## 🌐 IoT Module Section for  TDMS Project
This module handles real-time environmental data collection in coffee storage warehouses using ESP32-based IoT devices.

## 📦 Components Used
ESP32 (Wi-Fi enabled microcontroller)

DHT11 – Temperature & Humidity Sensor

PM2.5 Dust Sensor – Air quality monitoring

I2C LCD – Real-time local display

Buzzer – Alert system for threshold breaches

## ⚙️ Key Features
Periodic sensor data collection

Sends data via HTTP POST to Supabase REST API

Displays current readings on LCD

Triggers buzzer alerts when thresholds are exceeded

## 🔌 Setup Summary
Connect sensors and LCD to ESP32 pins

Configure Wi-Fi and API credentials in the code

Upload code using Arduino IDE or PlatformIO

Monitor data on the dashboard

## 📡 Data Sent
json

{
  "temperature": 25.5,
  "humidity": 60,
  "dust": 45,
  "timestamp": "2025-07-05T12:34:00Z"
}

## 📄 License
This project is licensed under the MIT License.

## 🙋 Author
Frank Muhindo

GitHub: @MfrankUg




