# TDMS Dashboard - Coffee Warehouse Monitoring System

## Project Overview

The TDMS (Temperature, Dust, and Moisture Sensor) Dashboard is a comprehensive real-time monitoring system designed specifically for coffee warehouse storage conditions. It provides intelligent monitoring, predictive analysis, and AI-powered recommendations to maintain optimal coffee storage environments.

## Technologies & Frameworks Used

### Frontend Technologies
- **Next.js 14** - React framework with App Router for server-side rendering and routing
- **React 18** - Component-based UI library with hooks and modern patterns
- **TypeScript** - Type-safe JavaScript for better development experience
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Shadcn/UI** - Modern component library built on Radix UI primitives

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Next.js API Routes** - Server-side API endpoints
- **ThingSpeak API** - IoT sensor data integration
- **PostgreSQL** - Relational database for sensor data storage

### Data Visualization
- **Recharts** - React charting library for data visualization
- **Custom Chart Components** - Tailored charts for temperature, humidity, and dust monitoring

### AI & Analytics
- **Custom Predictive Engine** - Linear regression-based forecasting
- **Natural Language Processing** - Question parsing and intent recognition
- **Real-time Analysis** - Continuous condition assessment and recommendations

### Development Tools
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization
- **Vercel** - Deployment and hosting platform

## Project Structure

\`\`\`
tdms-dashboard/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── sensor-data/          # Sensor data endpoints
│   │   ├── sync-thingspeak/      # ThingSpeak integration
│   │   ├── send-feedback/        # User feedback system
│   │   └── setup-email/          # Email configuration
│   ├── thresholds/               # Threshold configuration page
│   ├── thank-you/                # Feedback confirmation page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Main dashboard page
├── components/                   # React components
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── ai-assistant-chat.tsx # AI chatbot interface
│   │   ├── monitoring-cards.tsx  # Real-time monitoring cards
│   │   ├── graphical-trends.tsx  # Data visualization charts
│   │   ├── smart-recommendations.tsx # AI recommendations
│   │   ├── system-status.tsx     # System health indicators
│   │   ├── database-status.tsx   # Database connection status
│   │   ├── cleaning-countdown.tsx # Maintenance scheduling
│   │   ├── warehouse-selector.tsx # Multi-warehouse support
│   │   ├── dashboard-header.tsx  # Header with controls
│   │   └── feedback-button.tsx   # User feedback collection
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card layouts
│   │   ├── dialog.tsx            # Modal dialogs
│   │   ├── input.tsx             # Form inputs
│   │   ├── badge.tsx             # Status badges
│   │   ├── chart.tsx             # Chart components
│   │   ├── table.tsx             # Data tables
│   │   ├── sheet.tsx             # Side panels
│   │   └── ...                   # Other UI primitives
│   ├── mode-toggle.tsx           # Dark/light mode switcher
│   └── theme-provider.tsx        # Theme context provider
├── hooks/                        # Custom React hooks
│   └── use-sensor-data.ts        # Sensor data management hook
├── lib/                          # Utility libraries
│   ├── supabase.ts               # Supabase client configuration
│   ├── sensor-data-generator.ts  # Mock data generation
│   ├── notification-system.ts    # Alert and notification system
│   └── utils.ts                  # General utilities
├── scripts/                      # Database scripts
│   ├── setup-database.sql        # Initial database schema
│   └── setup-database-v2.sql     # Schema updates
├── package.json                  # Dependencies and scripts
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── next.config.mjs               # Next.js configuration
\`\`\`

## Key Features

### 1. Real-Time Monitoring
- **Live Sensor Data**: Continuous monitoring of temperature, humidity, and dust levels
- **Auto-Sync**: Automatic data synchronization with ThingSpeak IoT platform
- **Real-Time Updates**: WebSocket-based live updates every 30-120 seconds
- **Multi-Warehouse Support**: Monitor multiple warehouse locations

### 2. Data Visualization
- **Interactive Charts**: Real-time charts with 0-100 µg/m³ range for dust sensors
- **Historical Trends**: 24-hour historical data visualization
- **Status Indicators**: Color-coded status badges for quick assessment
- **Responsive Design**: Mobile-friendly charts and layouts

### 3. AI-Powered Assistant
- **Natural Language Interface**: Chat-based interaction for querying conditions
- **100+ Question Types**: Comprehensive question understanding and responses
- **Predictive Analysis**: Forecasting future conditions based on trends
- **Expert Recommendations**: Context-aware advice and best practices

### 4. Alert System
- **Threshold Monitoring**: Configurable alerts for critical conditions
- **Smart Notifications**: Intelligent alerting based on coffee storage requirements
- **Emergency Protocols**: Detailed emergency response procedures
- **Maintenance Scheduling**: Automated cleaning and maintenance reminders

## Predictive Analysis System

### How It Works

The predictive analysis system uses a sophisticated multi-layered approach to forecast warehouse conditions and provide intelligent recommendations:

#### 1. Data Collection & Processing
\`\`\`typescript
// Real-time data ingestion from multiple sources
const sensorData = {
  temperature: number,    // °C (18-30°C optimal range)
  humidity: number,       // % (50-65% optimal range)  
  smallDustParticles: number, // µg/m³ (0-20 optimal range)
  largeParticles: number,     // µg/m³ (0-15 optimal range)
  timestamp: string
}
\`\`\`

#### 2. Linear Regression Forecasting
The system implements a custom linear regression algorithm to predict future values:

\`\`\`typescript
const predictValue = (dataPoints, field, minutesAhead) => {
  // 1. Extract recent data points (last 6 readings)
  const recentPoints = dataPoints.slice(-6)
  
  // 2. Calculate time differences and value changes
  const xValues = [] // Time intervals in minutes
  const yValues = [] // Value changes between readings
  
  // 3. Compute average rate of change per minute
  const avgRatePerMinute = totalRate / count
  
  // 4. Project future value
  const predictedValue = currentValue + (avgRatePerMinute * minutesAhead)
  
  return {
    current: currentValue,
    predicted: predictedValue,
    change: avgRatePerMinute * minutesAhead,
    confidence: calculateConfidence(dataPoints)
  }
}
\`\`\`

#### 3. Pattern Recognition
The system identifies patterns in sensor data:

- **Daily Cycles**: Temperature variations throughout the day
- **Seasonal Trends**: Long-term environmental changes
- **Dust Accumulation**: Predictable dust buildup patterns
- **Humidity Fluctuations**: Moisture level variations

#### 4. Coffee Storage Expertise
Built-in knowledge base for coffee storage requirements:

\`\`\`typescript
const coffeeStorageStandards = {
  temperature: {
    optimal: { min: 18, max: 24 }, // °C
    acceptable: { min: 15, max: 28 },
    critical: { min: 10, max: 35 }
  },
  humidity: {
    optimal: { min: 50, max: 65 }, // %
    acceptable: { min: 40, max: 75 },
    critical: { min: 30, max: 85 }
  },
  dust: {
    good: { max: 20 },      // µg/m³
    moderate: { max: 35 },
    poor: { max: 50 },
    critical: { max: 100 }
  }
}
\`\`\`

#### 5. AI Question Processing
The AI assistant processes natural language queries through multiple stages:

\`\`\`typescript
const processQuestion = (question) => {
  // 1. Text normalization and keyword extraction
  const keywords = extractKeywords(question.toLowerCase())
  
  // 2. Intent classification
  const intent = classifyIntent(keywords) // temperature, humidity, dust, prediction, advice
  
  // 3. Context analysis
  const context = analyzeContext(question) // current, historical, predictive, comparative
  
  // 4. Data retrieval and analysis
  const relevantData = getRelevantData(intent, context)
  
  // 5. Response generation with recommendations
  return generateResponse(intent, context, relevantData)
}
\`\`\`

#### 6. Recommendation Engine
The system provides three types of recommendations:

**Immediate Actions**: Urgent responses to critical conditions
\`\`\`typescript
if (temperature > 30) {
  urgentActions.push("🚨 Activate cooling systems immediately")
}
\`\`\`

**Preventive Measures**: Proactive steps to avoid problems
\`\`\`typescript
if (humidity > 65) {
  preventiveActions.push("💧 Monitor humidity and prepare dehumidifiers")
}
\`\`\`

**Long-term Optimization**: Strategic improvements
\`\`\`typescript
longTermRecommendations.push("📊 Implement predictive maintenance schedules")
\`\`\`

### Predictive Accuracy

The system achieves predictive accuracy through:

1. **Multi-Point Analysis**: Uses 6 most recent data points for trend calculation
2. **Weighted Averaging**: Recent data points have higher influence
3. **Confidence Scoring**: Provides confidence levels for predictions
4. **Adaptive Learning**: Adjusts predictions based on historical accuracy

### Real-World Application

The predictive system helps warehouse managers:

- **Prevent Quality Loss**: Predict and prevent conditions that degrade coffee quality
- **Optimize Energy Usage**: Anticipate HVAC needs to reduce energy costs
- **Schedule Maintenance**: Predict when cleaning or equipment service is needed
- **Emergency Prevention**: Early warning system for critical conditions

## Database Schema

### Sensor Readings Table
\`\`\`sql
CREATE TABLE sensor_readings (
  id SERIAL PRIMARY KEY,
  field1 DECIMAL(10,2),  -- Small dust particles (µg/m³)
  field2 DECIMAL(10,2),  -- Large particles (µg/m³)
  field3 DECIMAL(10,2),  -- Reserved field
  field4 DECIMAL(10,2),  -- Humidity (%)
  field5 DECIMAL(10,2),  -- Temperature (°C)
  field6 DECIMAL(10,2),  -- Reserved field
  field7 DECIMAL(10,2),  -- Reserved field
  field8 DECIMAL(10,2),  -- Reserved field
  created_at TIMESTAMP DEFAULT NOW(),
  entry_id INTEGER,
  channel_id INTEGER
);
\`\`\`

### Thresholds Configuration Table
\`\`\`sql
CREATE TABLE thresholds (
  id SERIAL PRIMARY KEY,
  parameter VARCHAR(50) NOT NULL,
  min_value DECIMAL(10,2),
  max_value DECIMAL(10,2),
  warning_threshold DECIMAL(10,2),
  critical_threshold DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## API Endpoints

### Sensor Data API
- `GET /api/sensor-data` - Retrieve sensor readings with filtering
- `POST /api/sync-thingspeak` - Synchronize data from ThingSpeak
- `GET /api/test-supabase` - Test database connectivity

### Configuration API
- `POST /api/setup-email` - Configure email notifications
- `POST /api/send-feedback` - Submit user feedback

## Deployment

### Environment Variables
\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ThingSpeak Configuration  
SENSOR_API_KEY=your_thingspeak_api_key

# Email Configuration
SENDGRID_API_KEY=your_sendgrid_key
RESEND_API_KEY=your_resend_key

# Database Configuration
POSTGRES_URL=your_postgres_connection_string
\`\`\`

### Deployment Steps
1. **Database Setup**: Run SQL scripts to create tables
2. **Environment Configuration**: Set all required environment variables
3. **Dependency Installation**: `npm install`
4. **Build Process**: `npm run build`
5. **Deployment**: Deploy to Vercel or similar platform

## Performance Optimizations

### Data Management
- **Efficient Queries**: Optimized database queries with proper indexing
- **Data Pagination**: Limited result sets to prevent memory issues
- **Caching Strategy**: Client-side caching of sensor data
- **Real-time Subscriptions**: WebSocket connections for live updates

### UI Performance
- **Component Optimization**: React.memo and useMemo for expensive operations
- **Lazy Loading**: Dynamic imports for non-critical components
- **Responsive Design**: Mobile-first approach with efficient breakpoints
- **Chart Optimization**: Efficient rendering of real-time charts

## Security Features

### Data Protection
- **Environment Variables**: Secure storage of API keys and secrets
- **Input Validation**: Sanitization of all user inputs
- **SQL Injection Prevention**: Parameterized queries
- **CORS Configuration**: Proper cross-origin resource sharing setup

### Access Control
- **API Rate Limiting**: Protection against abuse
- **Error Handling**: Secure error messages without sensitive information
- **Authentication Ready**: Prepared for user authentication integration

## Future Enhancements

### Planned Features
1. **Machine Learning**: Advanced ML models for better predictions
2. **Multi-Tenant Support**: Support for multiple organizations
3. **Mobile App**: Native mobile application
4. **Advanced Analytics**: Detailed reporting and analytics dashboard
5. **Integration APIs**: Connect with other warehouse management systems

### Scalability Considerations
- **Microservices Architecture**: Break down into smaller services
- **Load Balancing**: Handle increased traffic
- **Database Sharding**: Scale database horizontally
- **CDN Integration**: Improve global performance

## Conclusion

The TDMS Dashboard represents a comprehensive solution for coffee warehouse monitoring, combining real-time data collection, predictive analytics, and AI-powered recommendations. The system's architecture ensures scalability, reliability, and ease of use while providing the intelligence needed to maintain optimal coffee storage conditions.

The predictive analysis system is the core innovation, using mathematical models and domain expertise to forecast conditions and provide actionable insights, making it an invaluable tool for warehouse managers in the coffee industry.
