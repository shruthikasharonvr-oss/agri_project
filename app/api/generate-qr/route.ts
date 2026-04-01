import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const upiId = searchParams.get('upiId') || 'farmtohome@upi';

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    if (!amount) {
      return NextResponse.json(
        { error: 'amount is required' },
        { status: 400 }
      );
    }

    // UPI URL format for generating QR codes
    // Format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&tn=DESCRIPTION&tr=TXN_REF
    const upiUrl = `upi://pay?pa=${upiId}&pn=FarmToHome&am=${amount}&cu=INR&tn=Order_${orderId}&tr=${orderId}`;

    // Generate QR code using external service
    // Using QR Server API (free, no authentication needed)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiUrl)}`;

    console.log('QR Code generated:', {
      orderId,
      amount,
      upiId,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: true,
        orderId,
        amount,
        upiUrl,
        qrCodeUrl, // URL to the generated QR code image
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate QR code',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
