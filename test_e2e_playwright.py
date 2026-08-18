import os
import time
from playwright.sync_api import sync_playwright

def main():
    os.makedirs("verification", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="verification/")
        page = context.new_page()

        # Navigate to web interface
        page.goto("http://127.0.0.1:8000/web/public/index.html")
        page.wait_for_selector("#root")

        username = f"student_{int(time.time())}"

        # Toggle to Register mode
        toggle_btn = page.locator('button:has-text("S\'inscrire"), button:has-text("Register")').first
        toggle_btn.click()
        time.sleep(0.5)

        # Fill credentials
        page.fill('input[type="text"]', username)
        page.fill('input[type="password"]', "Password123!")

        # Submit registration
        submit_btn = page.locator('form button').first
        submit_btn.click()
        time.sleep(1)

        # Login with registered credentials
        page.fill('input[type="text"]', username)
        page.fill('input[type="password"]', "Password123!")
        submit_btn = page.locator('form button').first
        submit_btn.click()

        # Wait for chat interface header or select
        page.wait_for_selector('select', timeout=10000)
        time.sleep(1)

        # Select exam and subject
        selects = page.locator('select')
        selects.nth(0).select_option(index=1)
        time.sleep(0.5)
        selects.nth(1).select_option(index=1)
        time.sleep(0.5)

        # Send a chat message using text input
        page.fill('input[type="text"]', "Comment réviser les mathématiques au Baccalauréat ?")
        send_btn = page.locator('button:has-text("Envoyer"), button:has-text("Send")').first
        send_btn.click()

        time.sleep(2)

        screenshot_path = "verification/exam_assistant_verified.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        context.close()
        browser.close()

if __name__ == "__main__":
    main()
