import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// Button import removed - not used in this component
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AttributeForm } from '@/components/custom-attributes/attribute-form'
import { AttributesList } from '@/components/custom-attributes/attributes-list'
import {
  Settings,
  Type,
  Calendar,
  Hash,
  CheckSquare,
  List,
  Users,
  ThumbsUp,
  BarChart3
} from 'lucide-react'

async function AttributesStats() {
  // TODO: Implement real stats from database
  const stats = {
    total: 12,
    active: 10,
    required: 3,
    byType: {
      text: 3,
      dropdown: 2,
      date: 2,
      checkbox: 2,
      number: 1,
      other: 2
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Attributes</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.active} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Required Fields</CardTitle>
          <CheckSquare className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.required}</div>
          <p className="text-xs text-muted-foreground">
            Must be filled
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Used Type</CardTitle>
          <Type className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">Text</div>
          <p className="text-xs text-muted-foreground">
            {stats.byType.text} attributes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usage Rate</CardTitle>
          <BarChart3 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">87%</div>
          <p className="text-xs text-muted-foreground">
            Projects using custom fields
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CustomAttributesPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Attributes</h1>
          <p className="text-muted-foreground">
            Create and manage custom fields for your projects
          </p>
        </div>
        <AttributeForm />
      </div>

      {/* Statistics */}
      <Suspense fallback={<LoadingSpinner text="Loading statistics..." />}>
        <AttributesStats />
      </Suspense>

      {/* Attribute Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Available Attribute Types</CardTitle>
          <CardDescription>
            Choose from various field types to capture the data you need
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Type className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Text Fields</h3>
                <p className="text-sm text-muted-foreground">Single line and multi-line text inputs</p>
                <div className="flex gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">Text</Badge>
                  <Badge variant="outline" className="text-xs">Long Text</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <List className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Selection Fields</h3>
                <p className="text-sm text-muted-foreground">Dropdowns, checklists, and options</p>
                <div className="flex gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">Dropdown</Badge>
                  <Badge variant="outline" className="text-xs">Checklist</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Date & Time</h3>
                <p className="text-sm text-muted-foreground">Date pickers and timestamps</p>
                <div className="flex gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">Date</Badge>
                  <Badge variant="outline" className="text-xs">Created At</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Hash className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Numeric Fields</h3>
                <p className="text-sm text-muted-foreground">Numbers, ratings, and progress</p>
                <div className="flex gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">Number</Badge>
                  <Badge variant="outline" className="text-xs">Rating</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Users className="h-5 w-5 text-indigo-500 mt-0.5" />
              <div>
                <h3 className="font-medium">People & Links</h3>
                <p className="text-sm text-muted-foreground">Team members and external links</p>
                <div className="flex gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">Member</Badge>
                  <Badge variant="outline" className="text-xs">Link</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <ThumbsUp className="h-5 w-5 text-pink-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Interactive</h3>
                <p className="text-sm text-muted-foreground">Voting, progress bars, and buttons</p>
                <div className="flex gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">Vote</Badge>
                  <Badge variant="outline" className="text-xs">Progress</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attributes List */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Attributes</CardTitle>
          <CardDescription>
            View, edit, and organize your custom project attributes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingSpinner text="Loading attributes..." />}>
            <AttributesList />
          </Suspense>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
          <CardDescription>
            Tips for creating effective custom attributes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium text-green-600">✓ Do</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use clear, descriptive labels</li>
                <li>• Group related attributes logically</li>
                <li>• Set appropriate default values</li>
                <li>• Use required fields sparingly</li>
                <li>• Test attributes with sample data</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-red-600">✗ Don&apos;t</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create too many required fields</li>
                <li>• Use technical names for labels</li>
                <li>• Duplicate existing functionality</li>
                <li>• Make dropdown lists too long</li>
                <li>• Forget to test with real users</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
