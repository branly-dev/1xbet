import sys
import subprocess
import time
import os
import urllib.request
import json

def run_tests():
    print("==================================================")
    print("  Cameroon Marketplace Automated Verification")
    print("==================================================")

    # 1. Start PHP backend server locally on port 8000
    print("[1/5] Starting local PHP server...")
    server_process = subprocess.Popen(
        ["php", "-S", "127.0.0.1:8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(1.5) # Wait for startup

    # Check if server is running
    try:
        urllib.request.urlopen("http://127.0.0.1:8000/web/public/index.html")
        print("  -> Local server is successfully running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"  -> ERROR: Failed to contact server: {e}")
        server_process.kill()
        sys.exit(1)

    # 2. Verify User Login / JWT token generation
    print("[2/5] Testing Auth Endpoint (Login)...")
    try:
        login_payload = json.dumps({
            "action": "login",
            "email": "acheteur@marketplace.cm",
            "password": "password123"
        }).encode("utf-8")

        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/endpoints/auth.php",
            data=login_payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            token = res_data.get("token")
            if token:
                print(f"  -> SUCCESS: Received valid JWT Token!")
            else:
                print("  -> ERROR: Token missing from response.")
                sys.exit(1)
    except Exception as e:
        print(f"  -> ERROR: Login request failed: {e}")
        server_process.kill()
        sys.exit(1)

    # 3. Test Gemini Smart Recommendation Search
    print("[3/5] Testing Gemini Search Recommendation...")
    try:
        # Search for "nourriture" should mock Gemini semantic helper returning 'Alimentation' products
        url = "http://127.0.0.1:8000/api/endpoints/products.php?search=nourriture"
        with urllib.request.urlopen(url) as response:
            products = json.loads(response.read().decode("utf-8"))
            if len(products) > 0 and any("Alimentation" in p["categorie"] for p in products):
                print(f"  -> SUCCESS: Gemini recommendations returned {len(products)} products correctly!")
            else:
                print("  -> ERROR: Gemini search returned unexpected output or empty list.")
                sys.exit(1)
    except Exception as e:
        print(f"  -> ERROR: Products search failed: {e}")
        server_process.kill()
        sys.exit(1)

    # 4. Test Webhook Orange Money / MTN MoMo
    print("[4/5] Testing Mobile Money Webhook validation...")
    try:
        webhook_payload = json.dumps({
            "operator": "orange",
            "transaction_reference": "ORANGE-TEST-999",
            "status": "success",
            "order_id": 1,
            "amount": 4500.0
        }).encode("utf-8")

        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/endpoints/payments.php?webhook=1",
            data=webhook_payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            if "processed successfully" in res_data.get("message", ""):
                print("  -> SUCCESS: Webhook processing completed successfully!")
            else:
                print("  -> ERROR: Unexpected webhook response.")
                sys.exit(1)
    except Exception as e:
        print(f"  -> ERROR: Webhook test failed: {e}")
        server_process.kill()
        sys.exit(1)

    # 5. Check if frontend React file is responsive and loading translation assets
    print("[5/5] Testing React Index rendering and bilinguism definition...")
    try:
        url = "http://127.0.0.1:8000/web/public/index.html"
        with urllib.request.urlopen(url) as response:
            html_content = response.read().decode("utf-8")
            if "translations.js" in html_content and "id=\"root\"" in html_content:
                print("  -> SUCCESS: HTML contains React root element and translation script imports!")
            else:
                print("  -> ERROR: React loading script elements or root targets are missing.")
                sys.exit(1)
    except Exception as e:
        print(f"  -> ERROR: Frontend render check failed: {e}")
        server_process.kill()
        sys.exit(1)

    # Teardown
    print("Shutting down development PHP server...")
    server_process.kill()
    print("==================================================")
    print("  ALL TESTS PASSED SUCCESSFULLY! ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
