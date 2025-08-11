import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const createAttributeSchema = z.object({
  name: z.string().min(2).max(50),
  label: z.string().min(2).max(100),
  type: z.enum([
    'text', 'long_text', 'number', 'date', 'checkbox', 'dropdown', 
    'label', 'checklist', 'link', 'member', 'vote', 'progress', 
    'rating', 'created_at', 'updated_at', 'created_by', 'button', 'custom_id'
  ]),
  description: z.string().optional(),
  is_required: z.boolean().default(false),
  default_value: z.string().optional(),
  options: z.array(z.string()).optional(),
  validation_rules: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional()
  }).optional()
})

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClerkSupabaseClient()

    const { data: attributes, error } = await supabase
      .from('custom_attributes')
      .select(`
        *,
        created_by_user:users!custom_attributes_created_by_fkey(id, first_name, last_name)
      `)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching custom attributes:', error)
      return NextResponse.json({ error: 'Failed to fetch custom attributes' }, { status: 500 })
    }

    return NextResponse.json({ attributes })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAttributeSchema.parse(body)

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

    // Check permissions (admin and manager can create custom attributes)
    if (!['admin', 'manager'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if attribute name already exists
    const { data: existingAttribute } = await supabase
      .from('custom_attributes')
      .select('id')
      .eq('name', validatedData.name)
      .single()

    if (existingAttribute) {
      return NextResponse.json({ 
        error: 'An attribute with this name already exists' 
      }, { status: 400 })
    }

    // Get the next display order
    const { data: maxOrderResult } = await supabase
      .from('custom_attributes')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrderResult?.display_order || 0) + 1

    // Create the custom attribute
    const { data: attribute, error: createError } = await supabase
      .from('custom_attributes')
      .insert({
        name: validatedData.name,
        label: validatedData.label,
        type: validatedData.type,
        description: validatedData.description,
        is_required: validatedData.is_required,
        default_value: validatedData.default_value,
        options: validatedData.options,
        validation_rules: validatedData.validation_rules,
        display_order: nextOrder,
        created_by: currentUser.id
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating custom attribute:', createError)
      return NextResponse.json({ error: 'Failed to create custom attribute' }, { status: 500 })
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_user_id: currentUser.id,
      p_action: 'custom_attribute_created',
      p_entity_type: 'custom_attribute',
      p_entity_id: attribute.id,
      p_new_values: { name: attribute.name, type: attribute.type }
    })

    return NextResponse.json({ attribute }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    const validatedData = createAttributeSchema.partial().parse(updateData)

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

    // Check permissions
    if (!['admin', 'manager'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update the custom attribute
    const { data: attribute, error: updateError } = await supabase
      .from('custom_attributes')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating custom attribute:', updateError)
      return NextResponse.json({ error: 'Failed to update custom attribute' }, { status: 500 })
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_user_id: currentUser.id,
      p_action: 'custom_attribute_updated',
      p_entity_type: 'custom_attribute',
      p_entity_id: attribute.id,
      p_new_values: validatedData
    })

    return NextResponse.json({ attribute })

  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Attribute ID is required' }, { status: 400 })
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
      .eq('attribute_id', id)

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
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting custom attribute:', deleteError)
      return NextResponse.json({ error: 'Failed to delete custom attribute' }, { status: 500 })
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_user_id: currentUser.id,
      p_action: 'custom_attribute_deleted',
      p_entity_type: 'custom_attribute',
      p_entity_id: id
    })

    return NextResponse.json({ message: 'Custom attribute deleted successfully' })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
