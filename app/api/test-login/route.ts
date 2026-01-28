import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Login Test</title>
    <script src="https://www.google.com/recaptcha/api.js?render=${siteKey}"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:disabled { background: #ccc; cursor: not-allowed; }
        .error { color: red; margin-top: 10px; }
        .success { color: green; margin-top: 10px; }
        .debug { background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px; font-family: monospace; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>reCAPTCHA Login Test</h1>
        <p>Site Key: ${siteKey}</p>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" value="test@example.com" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" value="testpassword123" required>
            </div>
            
            <button type="submit" id="submitBtn">Login with reCAPTCHA</button>
        </form>
        
        <div id="result"></div>
        <div id="debug" class="debug"></div>
    </div>
    
    <script>
        let debugLog = [];
        
        function log(message) {
            console.log(message);
            debugLog.push(new Date().toISOString() + ': ' + message);
            document.getElementById('debug').innerHTML = debugLog.join('<br>');
        }
        
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const resultDiv = document.getElementById('result');
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
            resultDiv.innerHTML = '';
            debugLog = [];
            
            try {
                log('🚀 Starting login process');
                log('🔍 Checking reCAPTCHA readiness...');
                
                if (!window.grecaptcha) {
                    throw new Error('reCAPTCHA not loaded');
                }
                
                grecaptcha.ready(async function() {
                    try {
                        log('✅ reCAPTCHA ready');
                        log('🎯 Executing reCAPTCHA with action: login');
                        
                        const token = await grecaptcha.execute('${siteKey}', {action: 'login'});
                        
                        log('🎫 Token received, length: ' + token.length);
                        log('🎫 Token preview: ' + token.substring(0, 50) + '...');
                        
                        log('🔍 Verifying token with server...');
                        
                        const response = await fetch('/api/verify-recaptcha', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                token: token,
                                action: 'login',
                                minScore: 0.5
                            })
                        });
                        
                        log('📡 Server response status: ' + response.status);
                        
                        const result = await response.json();
                        log('📊 Server response: ' + JSON.stringify(result, null, 2));
                        
                        if (response.ok && result.success) {
                            resultDiv.innerHTML = '<div class="success">✅ reCAPTCHA verification successful! Score: ' + result.score + '</div>';
                            log('✅ Login process completed successfully');
                        } else {
                            resultDiv.innerHTML = '<div class="error">❌ reCAPTCHA verification failed: ' + (result.error || 'Unknown error') + '</div>';
                            log('❌ Login process failed: ' + (result.error || 'Unknown error'));
                        }
                        
                    } catch (error) {
                        log('❌ Error in reCAPTCHA process: ' + error.message);
                        resultDiv.innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
                    } finally {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Login with reCAPTCHA';
                    }
                });
                
            } catch (error) {
                log('❌ Fatal error: ' + error.message);
                resultDiv.innerHTML = '<div class="error">❌ Fatal error: ' + error.message + '</div>';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login with reCAPTCHA';
            }
        });
        
        // Initial load check
        window.addEventListener('load', function() {
            log('🌐 Page loaded');
            log('🔍 Checking reCAPTCHA availability...');
            
            if (window.grecaptcha) {
                log('✅ reCAPTCHA script loaded');
            } else {
                log('⏳ Waiting for reCAPTCHA script...');
                
                // Check periodically
                const checkInterval = setInterval(function() {
                    if (window.grecaptcha) {
                        log('✅ reCAPTCHA script loaded (delayed)');
                        clearInterval(checkInterval);
                    }
                }, 100);
                
                // Stop checking after 10 seconds
                setTimeout(function() {
                    clearInterval(checkInterval);
                    if (!window.grecaptcha) {
                        log('❌ reCAPTCHA script failed to load after 10 seconds');
                    }
                }, 10000);
            }
        });
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