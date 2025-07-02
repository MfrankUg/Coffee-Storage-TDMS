-- Helper function to get table information
CREATE OR REPLACE FUNCTION get_table_info()
RETURNS TABLE (
  table_name TEXT,
  table_type TEXT,
  row_count BIGINT,
  size TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::TEXT,
    t.table_type::TEXT,
    COALESCE(s.n_tup_ins + s.n_tup_upd - s.n_tup_del, 0) as row_count,
    pg_size_pretty(pg_total_relation_size(c.oid))::TEXT as size
  FROM information_schema.tables t
  LEFT JOIN pg_class c ON c.relname = t.table_name
  LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  ORDER BY t.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get field ranges
CREATE OR REPLACE FUNCTION get_field_range(field_name TEXT)
RETURNS TABLE (
  min_value DECIMAL,
  max_value DECIMAL,
  avg_value DECIMAL
) AS $$
BEGIN
  RETURN QUERY EXECUTE format('
    SELECT 
      MIN(%I) as min_value,
      MAX(%I) as max_value,
      AVG(%I) as avg_value
    FROM sensor_readings 
    WHERE %I IS NOT NULL
  ', field_name, field_name, field_name, field_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_table_info() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_field_range(TEXT) TO anon, authenticated;
