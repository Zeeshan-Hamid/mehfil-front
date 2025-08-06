import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('Frontend chatbot API called');
    const body = await request.json();
    const token = request.headers.get('authorization');

    console.log('Request details:', { 
      hasToken: !!token, 
      tokenLength: token?.length,
      body: body 
    });

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Forward the request to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    console.log('Forwarding to backend:', `${backendUrl}/api/chatbot/vendor-chat`);
    
    const response = await fetch(`${backendUrl}/api/chatbot/vendor-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(body)
    });

    console.log('Backend response status:', response.status);
    const data = await response.json();
    console.log('Backend response data:', data);

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Backend error' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Chatbot API proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 