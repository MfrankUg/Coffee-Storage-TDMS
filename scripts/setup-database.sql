-- Create sensor_readings table
CREATE TABLE IF NOT EXISTS sensor_readings (
  id BIGSERIAL PRIMARY KEY,
  entry_id INTEGER UNIQUE NOT NULL,
  field1 DECIMAL(10,2), -- Temperature
  field2 DECIMAL(10,2), -- Humidity
  field3 DECIMAL(10,2), -- Dust Level (PM2.5)
  field4 DECIMAL(10,2), -- Additional sensor
  field5 DECIMAL(10,2), -- Additional sensor
  field6 DECIMAL(10,2), -- Additional sensor
  field7 DECIMAL(10,2), -- Additional sensor
  field8 DECIMAL(10,2), -- Additional sensor
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create channel_info table
CREATE TABLE IF NOT EXISTS channel_info (
  id BIGSERIAL PRIMARY KEY,
  channel_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(255),
  description TEXT,
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  field1 VARCHAR(255), -- Field descriptions
  field2 VARCHAR(255),
  field3 VARCHAR(255),
  field4 VARCHAR(255),
  field5 VARCHAR(255),
  field6 VARCHAR(255),
  field7 VARCHAR(255),
  field8 VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_created_at ON sensor_readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_entry_id ON sensor_readings(entry_id);

-- Enable Row Level Security (RLS)
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_info ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on sensor_readings" ON sensor_readings
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on channel_info" ON channel_info
  FOR SELECT USING (true);

-- Create policies for service role write access
CREATE POLICY "Allow service role full access on sensor_readings" ON sensor_readings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on channel_info" ON channel_info
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_sensor_readings_updated_at 
  BEFORE UPDATE ON sensor_readings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channel_info_updated_at 
  BEFORE UPDATE ON channel_info 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
