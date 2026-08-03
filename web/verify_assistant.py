import os
import time
from playwright.sync_api import sync_playwright, expect

def run_verification():
    os.makedirs("/home/jules/verification", exist_ok=True)

    with sync_playwright() as p:
        # Launch browser in headless mode
        browser = p.chromium.launch(headless=True)
        # Create a clean page with viewport size suited for screenshots
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        # 1. Open the web app
        print("Navigating to http://127.0.0.1:8000/web/public/index.html ...")
        page.goto("http://127.0.0.1:8000/web/public/index.html")
        page.wait_for_timeout(1000)

        # Take a screenshot of the login page in French (default)
        page.screenshot(path="/home/jules/verification/01_login_fr.png")
        print("Screenshot of login page in French saved.")

        # 2. Switch to Register mode
        print("Switching to register mode...")
        page.get_by_role("button", name="S'inscrire").click()
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/02_register_mode.png")

        # Fill in register credentials
        username_input = page.locator("input[type='text']")
        password_input = page.locator("input[type='password']")

        # Generate a unique username based on current time
        test_user = f"testuser_{int(time.time())}"
        print(f"Registering user: {test_user}")
        username_input.fill(test_user)
        password_input.fill("Password123!")

        # Click the register submit button
        page.get_by_role("button", name="S'inscrire").click()
        page.wait_for_timeout(1000)

        # Capture registration status
        page.screenshot(path="/home/jules/verification/03_after_registration.png")

        # 3. Login
        print("Logging in...")
        username_input.fill(test_user)
        password_input.fill("Password123!")
        page.get_by_role("button", name="Connexion").click()
        page.wait_for_timeout(2000)

        # Take a screenshot of the chat screen
        page.screenshot(path="/home/jules/verification/04_chat_screen_fr.png")
        print("Screenshot of chat screen saved.")

        # 4. Select exam and subject
        print("Selecting exam and subject...")
        exam_select = page.locator("select").nth(0)
        subject_select = page.locator("select").nth(1)

        # Select first available option after placeholder (index 1)
        exam_select.select_option(index=1)
        page.wait_for_timeout(500)
        subject_select.select_option(index=1)
        page.wait_for_timeout(500)

        page.screenshot(path="/home/jules/verification/05_selections_made.png")

        # 5. Send a chat message
        print("Sending message...")
        message_input = page.locator("input[placeholder=\"Tapez votre question...\"]")
        message_input.fill("Qu'est-ce que l'épreuve de mathématiques au Baccalauréat ?")

        page.get_by_role("button", name="Envoyer").click()
        print("Message sent, waiting for AI response...")
        page.wait_for_timeout(3000)

        page.screenshot(path="/home/jules/verification/06_chat_response_fr.png")

        # 6. Toggle language to English
        print("Toggling language to English...")
        page.get_by_role("button", name="English").click()
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/07_chat_screen_en.png")

        # Clean up
        browser.close()
        print("Verification completed successfully!")

if __name__ == "__main__":
    run_verification()
