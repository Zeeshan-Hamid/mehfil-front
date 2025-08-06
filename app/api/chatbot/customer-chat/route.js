export async function POST(request) {
  try {
    console.log('Customer chatbot API route called');
    
    const body = await request.json();
    const { message } = body;
    
    console.log('Customer chatbot request:', { message });
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    console.log('Customer chatbot auth header present:', !!authHeader);
    
    if (!message) {
      return Response.json(
        { success: false, message: 'Message is required' },
        { status: 400 }
      );
    }
    const backUrl =  'https://mehfil-backend-tzep.onrender.com';
    const backendUrl = `${backUrl}/api/chatbot/customer-chat`;
    
    console.log('Making request to backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || ''
      },
      body: JSON.stringify({ message })
    });

    console.log('Backend response status:', response.status);
    
    const data = await response.json();
    console.log('Backend response data:', data);

    return Response.json(data);

  } catch (error) {
    console.error('Customer chatbot API error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 