import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const {
      user_id,
      items,
      total_amount,
      shipping_address,
      hub_id,
      payment_method = 'UPI'
    } = body;

    // Validation
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!total_amount || total_amount <= 0) {
      return NextResponse.json(
        { error: 'total_amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!shipping_address) {
      return NextResponse.json(
        { error: 'shipping_address is required' },
        { status: 400 }
      );
    }

    console.log('Creating order with data:', {
      user_id,
      items_count: items.length,
      total_amount,
      payment_method,
      timestamp: new Date().toISOString()
    });

    // Create order in database
    const orderData = {
      user_id,
      items: JSON.stringify(items), // Store as JSON string
      total_amount,
      shipping_address: JSON.stringify(shipping_address), // Store as JSON string
      hub_id: hub_id || null,
      payment_method,
      order_status: 'Pending',
      created_at: new Date().toISOString()
    };

    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        {
          error: 'Failed to create order',
          details: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      );
    }

    if (!order) {
      console.error('No order data returned after insert');
      return NextResponse.json(
        { error: 'Order created but no data returned' },
        { status: 500 }
      );
    }

    console.log('Order created successfully:', {
      orderId: order.id,
      userId: user_id,
      amount: total_amount,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        order: {
          id: order.id,
          total_amount: order.total_amount,
          order_status: order.order_status,
          created_at: order.created_at
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
