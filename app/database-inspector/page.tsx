"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  TableIcon,
  Users,
  Key,
  Settings,
  Activity,
  BarChart3,
  Clock,
  Zap,
} from "lucide-react"
import Link from "next/link"

interface DatabaseInfo {
  tables: any[]
  sensorReadings: any[]
  channelInfo: any[]
  recentReadings: any[]
  statistics: any
  connectionStatus: any
  policies: any[]
  indexes: any[]
}

export default function DatabaseInspector() {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const inspectDatabase = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/inspect-database")
      const data = await response.json()

      if (response.ok) {
        setDbInfo(data)
      } else {
        setError(data.error || "Failed to inspect database")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    inspectDatabase()
  }, [])

  if (loading && !dbInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-lg font-medium">Inspecting Database...</p>
              <p className="text-sm text-gray-500">Analyzing tables, data, and connections</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold">Database Inspector</h1>
                <p className="text-sm text-gray-500">Supabase Database Analysis for TDMS</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={inspectDatabase} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Link href="/">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {dbInfo && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {dbInfo.connectionStatus?.connected ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">Connected</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-red-600">Disconnected</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dbInfo.connectionStatus?.database || "Unknown database"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
                    <TableIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dbInfo.tables?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {dbInfo.tables?.filter((t) => t.table_name.startsWith("sensor")).length || 0} sensor tables
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sensor Readings</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dbInfo.statistics?.totalReadings || 0}</div>
                    <p className="text-xs text-muted-foreground">{dbInfo.statistics?.todayReadings || 0} today</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last Update</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">
                      {dbInfo.statistics?.lastUpdate
                        ? new Date(dbInfo.statistics.lastUpdate).toLocaleString()
                        : "No data"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dbInfo.statistics?.lastUpdate
                        ? `${Math.floor((Date.now() - new Date(dbInfo.statistics.lastUpdate).getTime()) / 60000)} min ago`
                        : "Never"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Environment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Environment Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Supabase Configuration</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL ? "default" : "destructive"}>
                            {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓" : "✗"}
                          </Badge>
                          <span className="text-sm">SUPABASE_URL</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "default" : "destructive"}>
                            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓" : "✗"}
                          </Badge>
                          <span className="text-sm">SUPABASE_ANON_KEY</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={process.env.SUPABASE_SERVICE_ROLE_KEY ? "default" : "destructive"}>
                            {process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗"}
                          </Badge>
                          <span className="text-sm">SERVICE_ROLE_KEY</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Database Information</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Host:</strong> {dbInfo.connectionStatus?.host || "Unknown"}
                        </p>
                        <p>
                          <strong>Database:</strong> {dbInfo.connectionStatus?.database || "Unknown"}
                        </p>
                        <p>
                          <strong>Schema:</strong> public
                        </p>
                        <p>
                          <strong>SSL:</strong> Enabled
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tables Tab */}
            <TabsContent value="tables" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TableIcon className="h-5 w-5" />
                    Database Tables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Table Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Rows</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dbInfo.tables?.map((table, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{table.table_name}</TableCell>
                            <TableCell>{table.table_type}</TableCell>
                            <TableCell>{table.row_count || "Unknown"}</TableCell>
                            <TableCell>{table.size || "Unknown"}</TableCell>
                            <TableCell>
                              <Badge variant={table.exists ? "default" : "destructive"}>
                                {table.exists ? "Active" : "Missing"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Table Schema Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Sensor Readings Schema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Columns</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>id:</strong> BIGSERIAL PRIMARY KEY
                        </p>
                        <p>
                          <strong>entry_id:</strong> INTEGER UNIQUE
                        </p>
                        <p>
                          <strong>field1:</strong> DECIMAL(10,2) - Small Dust Particles
                        </p>
                        <p>
                          <strong>field2:</strong> DECIMAL(10,2) - Large Particles
                        </p>
                        <p>
                          <strong>field4:</strong> DECIMAL(10,2) - Humidity (%)
                        </p>
                        <p>
                          <strong>field5:</strong> DECIMAL(10,2) - Temperature (°C)
                        </p>
                        <p>
                          <strong>created_at:</strong> TIMESTAMPTZ
                        </p>
                        <p>
                          <strong>updated_at:</strong> TIMESTAMPTZ
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Indexes</h4>
                      <div className="space-y-1 text-sm">
                        {dbInfo.indexes?.map((index, i) => (
                          <p key={i}>
                            <strong>{index.indexname}:</strong> {index.indexdef}
                          </p>
                        )) || <p>No custom indexes found</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Tab */}
            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Recent Sensor Readings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Temperature</TableHead>
                          <TableHead>Humidity</TableHead>
                          <TableHead>Small Dust</TableHead>
                          <TableHead>Large Particles</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dbInfo.recentReadings?.map((reading, index) => (
                          <TableRow key={index}>
                            <TableCell>{reading.id}</TableCell>
                            <TableCell>{reading.field5 ? `${reading.field5}°C` : "N/A"}</TableCell>
                            <TableCell>{reading.field4 ? `${reading.field4}%` : "N/A"}</TableCell>
                            <TableCell>{reading.field1 ? `${reading.field1} µg/m³` : "N/A"}</TableCell>
                            <TableCell>{reading.field2 ? `${reading.field2} µg/m³` : "N/A"}</TableCell>
                            <TableCell>{new Date(reading.created_at).toLocaleString()}</TableCell>
                          </TableRow>
                        )) || (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-500">
                              No sensor readings found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Channel Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {dbInfo.channelInfo?.length > 0 ? (
                    <div className="space-y-4">
                      {dbInfo.channelInfo.map((channel, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-medium">{channel.name || "Unnamed Channel"}</h4>
                          <p className="text-sm text-gray-600 mb-2">{channel.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p>
                              <strong>Channel ID:</strong> {channel.channel_id}
                            </p>
                            <p>
                              <strong>Created:</strong> {new Date(channel.created_at).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Field 1:</strong> {channel.field1}
                            </p>
                            <p>
                              <strong>Field 2:</strong> {channel.field2}
                            </p>
                            <p>
                              <strong>Field 4:</strong> {channel.field4}
                            </p>
                            <p>
                              <strong>Field 5:</strong> {channel.field5}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No channel information found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Readings:</span>
                        <span className="font-medium">{dbInfo.statistics?.totalReadings || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Today:</span>
                        <span className="font-medium">{dbInfo.statistics?.todayReadings || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>This Week:</span>
                        <span className="font-medium">{dbInfo.statistics?.weekReadings || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>This Month:</span>
                        <span className="font-medium">{dbInfo.statistics?.monthReadings || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Complete Records:</span>
                        <span className="font-medium">{dbInfo.statistics?.completeRecords || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Missing Temperature:</span>
                        <span className="font-medium">{dbInfo.statistics?.missingTemp || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Missing Humidity:</span>
                        <span className="font-medium">{dbInfo.statistics?.missingHumidity || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Missing Dust Data:</span>
                        <span className="font-medium">{dbInfo.statistics?.missingDust || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Ranges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Temp Range:</span>
                        <span className="font-medium">
                          {dbInfo.statistics?.tempRange
                            ? `${dbInfo.statistics.tempRange.min}°C - ${dbInfo.statistics.tempRange.max}°C`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Humidity Range:</span>
                        <span className="font-medium">
                          {dbInfo.statistics?.humidityRange
                            ? `${dbInfo.statistics.humidityRange.min}% - ${dbInfo.statistics.humidityRange.max}%`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dust Range:</span>
                        <span className="font-medium">
                          {dbInfo.statistics?.dustRange
                            ? `${dbInfo.statistics.dustRange.min} - ${dbInfo.statistics.dustRange.max} µg/m³`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Row Level Security (RLS) Policies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Table</TableHead>
                          <TableHead>Policy Name</TableHead>
                          <TableHead>Command</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dbInfo.policies?.map((policy, index) => (
                          <TableRow key={index}>
                            <TableCell>{policy.tablename}</TableCell>
                            <TableCell>{policy.policyname}</TableCell>
                            <TableCell>{policy.cmd}</TableCell>
                            <TableCell>{policy.roles?.join(", ") || "All"}</TableCell>
                            <TableCell>
                              <Badge variant="default">Active</Badge>
                            </TableCell>
                          </TableRow>
                        )) || (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-500">
                              No RLS policies found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Public Access</h4>
                      <div className="space-y-1 text-sm">
                        <p>• Read access to sensor_readings</p>
                        <p>• Read access to channel_info</p>
                        <p>• No write permissions</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Service Role</h4>
                      <div className="space-y-1 text-sm">
                        <p>• Full read/write access</p>
                        <p>• Database administration</p>
                        <p>• Policy management</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Database Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Query Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Avg Query Time:</span>
                          <span className="font-medium">{dbInfo.statistics?.avgQueryTime || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Slow Queries:</span>
                          <span className="font-medium">{dbInfo.statistics?.slowQueries || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Index Usage:</span>
                          <span className="font-medium">{dbInfo.statistics?.indexUsage || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Storage</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Database Size:</span>
                          <span className="font-medium">{dbInfo.statistics?.dbSize || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Table Size:</span>
                          <span className="font-medium">{dbInfo.statistics?.tableSize || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Index Size:</span>
                          <span className="font-medium">{dbInfo.statistics?.indexSize || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Optimization Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Index Optimization</p>
                        <p className="text-sm text-gray-600">
                          Consider adding indexes on frequently queried columns like created_at and entry_id.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Data Archiving</p>
                        <p className="text-sm text-gray-600">
                          Archive old sensor readings to maintain optimal query performance.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Connection Pooling</p>
                        <p className="text-sm text-gray-600">
                          Use connection pooling to optimize database connections.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
