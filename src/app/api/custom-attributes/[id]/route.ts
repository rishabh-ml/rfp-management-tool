import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const updateAttributeSchema = z.object({
  is_active: z.boolean().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  is_required: z.boolean().optional(),
  default_value: z.string().optional(),
  options: z.array(z.string()).optional(),
  validation_rules: z.record(z.any()).optional(),
  display_order: z.number().optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateAttributeSchema.parse(body)

    const supabase = await createClerkSupabaseClient()

    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('clerk_id', userId)
      .single()

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check permissions (admin and manager can update custom attributes)
    if (!['admin', 'manager'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update the custom attribute
    const { data: attribute, error: updateError } = await supabase
      .from('custom_attributes')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating custom attribute:', updateError)
      return NextResponse.json({ error: 'Failed to update custom attribute' }, { status: 500 })
    }

    return NextResponse.json({ attribute })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClerkSupabaseClient()

    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('clerk_id', userId)
      .single()

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check permissions (admin only for deletion)
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if attribute is in use
    const { data: usageCount } = await supabase
      .from('project_attribute_values')
      .select('id', { count: 'exact' })
      .eq('attribute_id', params.id)

    if (usageCount && usageCount.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete attribute that is in use by projects',
        usage_count: usageCount.length
      }, { status: 400 })
    }

    // Delete the custom attribute
    const { error: deleteError } = await supabase
      .from('custom_attributes')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting custom attribute:', deleteError)
      return NextResponse.json({ error: 'Failed to delete custom attribute' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Custom attribute deleted successfully' })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
