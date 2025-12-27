const axios = require('axios');

// Get token from your browser localStorage (admin_token)
const TOKEN = 'YOUR_ADMIN_TOKEN_HERE'; // Replace with actual token from browser

const testOrdersAPI = async () => {
  try {
    console.log('Testing orders API...\n');
    
    const response = await axios.get('http://localhost:3000/api/v1/orders/admin/all', {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      },
      params: {
        limit: 5,
        sort_by: 'created_at',
        sort_order: 'desc'
      }
    });

    console.log('Status:', response.status);
    console.log('Response data structure:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.orders) {
      console.log('\n✓ Orders array found:', response.data.orders.length, 'orders');
    } else {
      console.log('\n✗ No orders array in response');
      console.log('Available keys:', Object.keys(response.data));
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testOrdersAPI();
