const axios = require('axios');

const QWEN_API_KEY = 'sk-21f7c7b4d30a4ad0b01905c7ae7366e4';
const QWEN_MODEL = 'qwen-plus';

async function testQwen() {
  try {
    console.log('Testing Qwen AI API...');
    console.log('API Key:', QWEN_API_KEY.substring(0, 10) + '...');
    
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        model: QWEN_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello, how are you?' }
        ],
        max_tokens: 100,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('✅ Qwen API Response:', response.data.choices[0].message.content);
  } catch (error) {
    console.error('❌ Qwen API Error:', error.response?.data || error.message);
    console.log('\nPossible solutions:');
    console.log('1. Make sure API key is activated at: https://bailian.console.aliyun.com/');
    console.log('2. Check if Qwen model is activated in your account');
    console.log('3. Verify you have available credits/free tier');
  }
}

testQwen();
