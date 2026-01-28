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
    <button onclick="testDirectCall()">Test Direct Call (No Action)</button>
    
    <div id="results"></div>
    
    <script>
        function testRecaptcha(action) {
            console.log('Testing reCAPTCHA with action:', action);
            
            grecaptcha.ready(function() {
                console.log('reCAPTCHA ready, executing with action:', action);
                grecaptcha.execute('${siteKey}', {action: action}).then(function(token) {
                    console.log('Token received for action "' + action + '":', token);
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
                        console.log('Test result for action "' + action + '":', data);
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
                }).catch(function(error) {
                    console.error('reCAPTCHA execution failed for action "' + action + '":', error);
                    document.getElementById('results').innerHTML = 
                        '<h3>reCAPTCHA execution failed for action: ' + action + '</h3>' +
                        '<pre>' + error.toString() + '</pre>';
                });
            });
        }
        
        function testDirectCall() {
            console.log('Testing direct reCAPTCHA call without action parameter');
            
            grecaptcha.ready(function() {
                // Test what happens if we don't provide action
                try {
                    grecaptcha.execute('${siteKey}').then(function(token) {
                        console.log('Token received (no action):', token);
                        
                        fetch('/api/test-recaptcha-token', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({token: token})
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log('Test result (no action):', data);
                            document.getElementById('results').innerHTML = 
                                '<h3>Results for direct call (no action)</h3>' +
                                '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                        });
                    }).catch(function(error) {
                        console.error('Direct call failed:', error);
                        document.getElementById('results').innerHTML = 
                            '<h3>Direct call failed</h3>' +
                            '<pre>' + error.toString() + '</pre>';
                    });
                } catch (error) {
                    console.error('Exception in direct call:', error);
                    document.getElementById('results').innerHTML = 
                        '<h3>Exception in direct call</h3>' +
                        '<pre>' + error.toString() + '</pre>';
                }
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