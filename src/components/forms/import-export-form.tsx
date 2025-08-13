'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { FormErrorBoundary } from '@/components/error/error-boundary'
import { 
  Upload, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Database,
  CheckCircle,
  X,
  FileDown,
  FileUp
} from 'lucide-react'
import { toast } from 'sonner'

interface ImportExportFormProps {
  onClose?: () => void
}

export function ImportExportForm({ onClose }: ImportExportFormProps) {
  const [activeTab, setActiveTab] = useState('import')
  const [isLoading, setIsLoading] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [importResults, setImportResults] = useState<any>(null)
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportOptions, setExportOptions] = useState({
    includeComments: true,
    includeSubtasks: true,
    includeTags: true,
    includeCustomFields: true,
    dateRange: 'all'
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/json'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Please upload a CSV, Excel, or JSON file'
        })
        return
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'Please upload a file smaller than 10MB'
        })
        return
      }

      setImportFile(file)
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import')
      return
    }

    setIsLoading(true)
    setImportProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', importFile)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/projects/import', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setImportProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Import failed')
      }

      const results = await response.json()
      setImportResults(results)

      toast.success('Import completed successfully', {
        description: `Imported ${results.successful} projects, ${results.failed} failed`
      })
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Import failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        format: exportFormat,
        ...Object.entries(exportOptions)
          .filter(([, value]) => value === true)
          .reduce((acc, [key]) => ({ ...acc, [key]: 'true' }), {}),
        dateRange: exportOptions.dateRange
      })

      const response = await fetch(`/api/projects/export?${params}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Export failed')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `projects-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Export completed successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormErrorBoundary>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Import & Export Data
          </CardTitle>
          <CardDescription>
            Import projects from external sources or export your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import" className="flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                Import
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                Export
              </TabsTrigger>
            </TabsList>

            {/* Import Tab */}
            <TabsContent value="import" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="importFile">Select File</Label>
                  <div className="mt-2">
                    <Input
                      id="importFile"
                      type="file"
                      accept=".csv,.xlsx,.xls,.json"
                      onChange={handleFileUpload}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported formats: CSV, Excel (.xlsx, .xls), JSON (max 10MB)
                    </p>
                  </div>
                </div>

                {importFile && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium">{importFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(importFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setImportFile(null)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Importing data...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} />
                  </div>
                )}

                {importResults && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Import Results
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Successful:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {importResults.successful}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failed:</span>
                        <span className="ml-2 font-medium text-red-600">
                          {importResults.failed}
                        </span>
                      </div>
                    </div>
                    {importResults.errors?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-600 mb-2">Errors:</p>
                        <ul className="text-xs text-red-600 space-y-1">
                          {importResults.errors.slice(0, 5).map((error: string, index: number) => (
                            <li key={index}>• {error}</li>
                          ))}
                          {importResults.errors.length > 5 && (
                            <li>• ... and {importResults.errors.length - 5} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  onClick={handleImport} 
                  disabled={!importFile || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Start Import
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          CSV (Comma Separated Values)
                        </div>
                      </SelectItem>
                      <SelectItem value="xlsx">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          Excel (.xlsx)
                        </div>
                      </SelectItem>
                      <SelectItem value="json">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          JSON
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Include Data</Label>
                  <div className="mt-2 space-y-3">
                    {[
                      { key: 'includeComments', label: 'Comments' },
                      { key: 'includeSubtasks', label: 'Subtasks' },
                      { key: 'includeTags', label: 'Tags' },
                      { key: 'includeCustomFields', label: 'Custom Fields' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={exportOptions[key as keyof typeof exportOptions] as boolean}
                          onCheckedChange={(checked) =>
                            setExportOptions(prev => ({ ...prev, [key]: checked }))
                          }
                        />
                        <Label htmlFor={key} className="text-sm">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Date Range</Label>
                  <Select 
                    value={exportOptions.dateRange} 
                    onValueChange={(value) => 
                      setExportOptions(prev => ({ ...prev, dateRange: value }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      <SelectItem value="last30">Last 30 Days</SelectItem>
                      <SelectItem value="last90">Last 90 Days</SelectItem>
                      <SelectItem value="thisYear">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleExport} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Close Button */}
          {onClose && (
            <div className="flex justify-end mt-6 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </FormErrorBoundary>
  )
}
