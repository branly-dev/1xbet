import time
from playwright.sync_api import sync_playwright, expect

def main():
    print("Starting Playwright verification...")
    with sync_playwright() as p:
        # Launch browser in headless mode
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # Navigate to the Cameroonian Exam AI Assistant web app
        print("Navigating to index.html...")
        page.goto("http://127.0.0.1:8000/web/public/index.html")

        # Wait for the page to load
        page.wait_for_timeout(2000)

        # Generate a unique username for registration
        unique_username = f"student_{int(time.time())}"
        print(f"Using unique username: {unique_username}")

        # Step 1: Click "S'inscrire" toggle
        print("Toggling to registration mode...")
        register_toggle = page.get_by_role("button", name="S'inscrire", exact=True)
        register_toggle.click()
        page.wait_for_timeout(500)

        # Step 2: Fill registration details
        print("Filling registration form...")
        # Locate inputs. We can use first and second inputs, or locate by text
        username_input = page.locator('input[type="text"]')
        password_input = page.locator('input[type="password"]')

        username_input.fill(unique_username)
        password_input.fill("password123")

        # Click registration submit button
        print("Submitting registration...")
        submit_button = page.locator('button', has_text="S'inscrire").first
        submit_button.click()
        page.wait_for_timeout(1000)

        # Step 3: Fill login details and submit
        print("Logging in...")
        username_input.fill(unique_username)
        password_input.fill("password123")

        login_button = page.locator('button', has_text="Connexion").first
        login_button.click()
        page.wait_for_timeout(1500)

        # Step 4: Verify login successful and in Chat view
        print("Verifying chat view...")
        expect(page.get_by_text("Assistant d'Examen")).to_be_visible()

        # Step 5: Toggle Language to English and back
        print("Testing language toggle (FR -> EN)...")
        lang_button = page.get_by_role("button", name="English")
        lang_button.click()
        page.wait_for_timeout(500)
        expect(page.get_by_text("Exam Assistant")).to_be_visible()

        print("Testing language toggle (EN -> FR)...")
        lang_button_fr = page.get_by_role("button", name="Français")
        lang_button_fr.click()
        page.wait_for_timeout(500)
        expect(page.get_by_text("Assistant d'Examen")).to_be_visible()

        # Step 6: Select Exam and Subject
        print("Selecting exam (Baccalauréat)...")
        # First select is exam
        exam_select = page.locator('select').first
        exam_select.select_option(label="Baccalauréat")
        page.wait_for_timeout(500)

        print("Selecting subject (Mathématiques)...")
        # Second select is subject
        subject_select = page.locator('select').nth(1)
        subject_select.select_option(label="Mathématiques")
        page.wait_for_timeout(500)

        # Step 7: Send a message
        print("Typing message...")
        chat_input = page.locator('input[type="text"]')
        chat_input.fill("Comment résoudre une équation du second degré de type ax^2 + bx + c = 0 ?")
        page.wait_for_timeout(500)

        print("Sending message...")
        send_button = page.get_by_role("button", name="Envoyer")
        send_button.click()

        # Wait for the thinking text to disappear or response to arrive
        print("Waiting for AI response...")
        page.wait_for_timeout(3000)

        # Step 8: Capture screenshot
        screenshot_path = "web/public/web_chat_interface.png"
        print(f"Taking screenshot and saving to {screenshot_path}...")
        page.screenshot(path=screenshot_path)
        print("Verification completed successfully!")

        browser.close()

if __name__ == "__main__":
    main()
