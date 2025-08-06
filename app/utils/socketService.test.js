// Simple test file for socket service
// This can be run manually to test the socket service behavior

import socketService from './socketService';

// Mock console methods to capture output
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error
};

let consoleOutput = [];

beforeEach(() => {
  consoleOutput = [];
  console.log = (...args) => consoleOutput.push(['log', ...args]);
  console.warn = (...args) => consoleOutput.push(['warn', ...args]);
  console.error = (...args) => consoleOutput.push(['error', ...args]);
});

afterEach(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Test that socket service handles no token gracefully
function testNoTokenHandling() {
  console.log('🧪 Testing socket service no-token handling...');
  
  // Test 1: Connect with no token
  socketService.connect(null);
  
  // Test 2: Connect with empty string
  socketService.connect('');
  
  // Test 3: Connect with undefined
  socketService.connect(undefined);
  
  // Test 4: Attempt reconnection with no token
  socketService.attemptReconnection();
  
  // Test 5: Check authentication status
  const isAuth = socketService.isAuthenticated();
  console.log('🔍 Authentication status:', isAuth);
  
  // Test 6: Send message when not connected
  const sent = socketService.sendMessage({ text: 'test' });
  console.log('📤 Message sent:', sent);
  
  console.log('✅ No-token handling tests completed');
  console.log('📊 Console output:', consoleOutput);
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testSocketService = testNoTokenHandling;
  console.log('🧪 Socket service test available as window.testSocketService()');
} else {
  // Node environment
  testNoTokenHandling();
}

export { testNoTokenHandling }; 