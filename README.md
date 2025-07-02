# TDMS dashboard
Project deployed and you can try it out 
https://tdmsfinal.vercel.app/

# ☕ Coffee Storage TDMS - Temperature & Dust Monitoring System

A smart environmental monitoring and analytics dashboard built for coffee warehouses to maintain optimal storage conditions using real-time IoT data and AI-powered predictions.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [AI/ML Components](#aiml-components)
5. [Database Schema](#database-schema) <!-- Coming soon -->
6. [API Documentation](#api-documentation) <!-- Coming soon -->
7. [Component Documentation](#component-documentation)
8. [Python Scripts](#python-scripts)
9. [Installation](#installation)
10. [Configuration](#configuration)
11. [Usage](#usage)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)
14. [Contributing](#contributing)
15. [License](#license)

---

## 🧭 Overview

The **Coffee Storage TDMS** (Temperature, Dust, Moisture Sensor) Dashboard is an end-to-end smart system for monitoring environmental conditions in coffee storage warehouses. It combines **ESP32-based IoT sensors**, a **Supabase backend**, a **Next.js web dashboard**, and **Python AI models** to ensure optimal storage and early detection of anomalies.

### ✅ Key Features

- 🌡️ **Real-time Sensor Monitoring** (Temperature, Humidity, Dust)
- 📈 **AI-powered Forecasting** and anomaly detection
- 🧠 **Smart Recommendations** for warehouse adjustments
- 📊 **Quality Scoring** and pattern recognition
- 🔌 **ThingSpeak Integration** for fallback sensor data
- 🏭 **Multi-Warehouse Support**
- 🌗 **Dark/Light Responsive Design**
- 🛠️ **Pluggable ML Scripts** (Python)

---

## 🏗️ System Architecture

### 🔍 High-Level View
┌────────────┐ ┌────────────────┐ ┌───────────────┐
│ Sensor Node│ │ Web Dashboard │ │ AI Models │
│ (ESP32) │───▶│ (Next.js + API)│◀──▶│ (Python, ML) │
└────────────┘ └────────────────┘ └───────────────┘
│ │ │
│ ┌─────────────┐ │
└────────▶│ Supabase DB│◀─────────────┘
└─────────────┘



### 🧩 Component Tree (Frontend)

app/
├── page.tsx # Main dashboard
├── thresholds/page.tsx # Manage threshold limits
├── database-inspector/ # Data explorer
└── api/
├── sensor-data/ # Custom API routes
├── sync-thingspeak/
└── inspect-database/

components/
├── dashboard/ # Core widgets
└── ui/ # ShadCN UI components

scripts/
├── data_preprocessor.py
├── ml_model_trainer.py
├── predictive_analytics.py
├── pattern_recognition.py
└── ai_recommendation_engine.py


---

## 🧰 Technology Stack

### 💻 Frontend
- **Next.js 14** (App Router)
- **React 18**, **Tailwind CSS**
- **shadcn/ui**, **Lucide Icons**
- **Recharts**, **next-themes** for theme switching

### 🔧 Backend
- **Supabase** (PostgreSQL, Realtime)
- **Next.js API Routes** (Node.js)
- **Authentication** (Supabase Auth - coming soon)

### 🔍 AI/ML
- **Python 3.8+**
- **scikit-learn**, **pandas**, **numpy**, **scipy**
- **K-Means Clustering**, **Isolation Forest**, **Time-Series Forecasting**

### 🌐 Integrations
- **ThingSpeak** (IoT Sensor platform)
- **SendGrid/Resend** (Email alerts)
- **Vercel** (Frontend hosting)

---

## 🧠 AI/ML Components

| Script | Purpose |
|--------|---------|
| `data_preprocessor.py` | Cleans raw data, handles missing values, feature engineering |
| `ml_model_trainer.py` | Trains predictive and anomaly detection models |
| `predictive_analytics.py` | Forecasts temperature/humidity/dust conditions |
| `pattern_recognition.py` | Identifies operational trends |
| `ai_recommendation_engine.py` | Generates optimization recommendations |

> **Pipeline**: Sensor data → Cleaned → Trained → Prediction → Dashboard

---

## 🧩 Component Documentation

### Sensor Inputs
- **Temperature Sensor**: DHT11/DHT22
- **Dust Sensor**: PM2.5
- **Humidity Sensor**: Integrated in DHT

### Microcontroller
- **ESP32**: Sends data to ThingSpeak or custom REST endpoint

### Database Fields
- `timestamp`, `temperature`, `humidity`, `dust`, `device_id`, `warehouse_id`, `quality_score`

---

## 🐍 Python Scripts

Place your Python scripts inside the `/scripts` directory. These are run either on schedule (via CRON or Supabase Edge functions) or manually for training/testing models.

Example:
```bash
python scripts/ml_model_trainer.py --input=data.csv --output=model.pkl
🚀 Installation
bash
Copy code
# 1. Clone the repo
git clone https://github.com/MfrankUg/Coffee-Storage-TDMS.git
cd Coffee-Storage-TDMS

# 2. Install frontend dependencies
npm install

# 3. Run local development server
npm run dev
⚙️ Configuration
Create a .env.local file in the root directory:

ini
Copy code
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_key
THINGSPEAK_API_KEY=your_thingspeak_key
Connect your ESP32 device to your custom REST endpoint or ThingSpeak channel.

👨‍💻 Usage
Open the dashboard (localhost:3000 or deployed Vercel link)

Monitor real-time sensor updates

View:

Predictive warnings

Threshold alerts

Quality scores

Suggested actions

🌐 Deployment
Frontend: Deploy on Vercel

Backend (Supabase): Hosted DB and Auth

Sensors: ESP32 + Wi-Fi sending JSON data every 15–60s

🛠️ Troubleshooting
❌ Sensor not sending data? Check:

Wi-Fi credentials on ESP32

ThingSpeak API key or custom REST URL

❌ Dashboard not loading data?

Supabase credentials

Network/firewall issues

🤝 Contributing
Pull requests are welcome!
For major changes, open an issue first to discuss what you’d like to change.

Steps:


git checkout -b feature/your-feature
git commit -m "Add new feature"
git push origin feature/your-feature
📄 License
This project is licensed under the MIT License.

🙋 Author
Frank Muhindo

GitHub: @MfrankUg

LinkedIn: linkedin.com/in/frankmuhindo

Email: [your.email@example.com] (optional)

Empowering smarter agriculture through data-driven coffee storage ☕🌱



