import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>reCAPTCHA Test</title>
    <script src="https://www.google.com/recaptcha/api.js?render=${siteKey}"></script>
</head>
<body>
    <h1>reCAPTCHA v3 Test</h1>
    <p>Site Key: ${siteKey}</p>
    
    <button onclick="testRecaptcha('login')">Test Login Action</button>
    <button onclick="testRecaptcha('submit')">Test Submit Action</button>
    <button onclick="testRecaptcha('test')">Test Custom Action</button>
    
    <div id="results"></div>
    
    <script>
        function testRecaptcha(action) {
            console.log('Testing reCAPTCHA with action:', action);
            
            grecaptcha.ready(function() {
                grecaptcha.execute('${siteKey}', {action: action}).then(function(token) {
                    console.log('Token received:', token);
                    console.log('Token length:', token.length);
                    
                    // Test the token
                    fetch('/api/test-recaptcha-token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({token: token})
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Test result:', data);
                        document.getElementById('results').innerHTML = 
                            '<h3>Results for action: ' + action + '</h3>' +
                            '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        document.getElementById('results').innerHTML = 
                            '<h3>Error for action: ' + action + '</h3>' +
                            '<pre>' + error.toString() + '</pre>';
                    });
                });
            });
        }
    </script>
</body>
</html>
  `
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}