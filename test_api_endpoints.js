// Test script to check API endpoints and user authentication
// Run this in the browser console while logged in

async function testAPIEndpoints() {
  console.log('🔍 Testing API Endpoints...\n');
  
  // Test 1: Check current user authentication
  console.log('1. Testing user authentication...');
  try {
    const authResponse = await fetch('/api/auth/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const authData = await authResponse.json();
    console.log('✅ Auth response:', authData);
  } catch (error) {
    console.error('❌ Auth test failed:', error);
  }
  
  // Test 2: Check user sync
  console.log('\n2. Testing user sync...');
  try {
    const syncResponse = await fetch('/api/sync-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const syncData = await syncResponse.json();
    console.log('✅ Sync response:', syncData);
  } catch (error) {
    console.error('❌ Sync test failed:', error);
  }
  
  // Test 3: Test projects GET endpoint
  console.log('\n3. Testing projects GET endpoint...');
  try {
    const projectsResponse = await fetch('/api/projects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const projectsData = await projectsResponse.json();
    console.log('✅ Projects GET response:', projectsData);
  } catch (error) {
    console.error('❌ Projects GET test failed:', error);
  }
  
  // Test 4: Test projects POST endpoint (create new project)
  console.log('\n4. Testing projects POST endpoint...');
  try {
    const createResponse = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Project ' + Date.now(),
        description: 'Test project created by API test',
        priority: 'medium',
        owner_id: 'test-user-id', // This should be replaced with actual user ID
        stage: 'assigned'
      }),
    });
    
    const createData = await createResponse.json();
    console.log('✅ Projects POST response:', createData);
  } catch (error) {
    console.error('❌ Projects POST test failed:', error);
  }
  
  // Test 5: Test diagnostics endpoint
  console.log('\n5. Testing diagnostics endpoint...');
  try {
    const diagResponse = await fetch('/api/diagnostics/auth', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const diagData = await diagResponse.json();
    console.log('✅ Diagnostics response:', diagData);
  } catch (error) {
    console.error('❌ Diagnostics test failed:', error);
  }
  
  console.log('\n🏁 API endpoint testing complete!');
}

// Run the test
testAPIEndpoints();
