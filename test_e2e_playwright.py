import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to Exam Assistant web interface...")
        page.goto("http://127.0.0.1:8000/web/public/index.html")
        page.wait_for_selector("h2")

        uname = f"eleve_{int(time.time())}"
        pwd = "password123"

        # Register
        print(f"Registering new student user: {uname}...")
        page.click("text=Pas encore de compte ? S'inscrire")
        page.fill("input[placeholder='ex: paul_biya']", uname)
        page.fill("input[placeholder='••••••••']", pwd)
        page.click("button:has-text(\"S'inscrire\")")
        time.sleep(1)

        # Login
        print("Logging in user...")
        page.fill("input[placeholder='ex: paul_biya']", uname)
        page.fill("input[placeholder='••••••••']", pwd)
        page.click("button:has-text('Se connecter')")

        # Wait for chat view
        page.wait_for_selector("select", timeout=5000)
        print("Logged in successfully. Testing language switch...")

        # Language Switch to EN and back
        page.click("button:has-text('English')")
        page.wait_for_selector("text=Cameroon Exam AI Assistant")
        page.click("button:has-text('Français')")
        page.wait_for_selector("text=Assistant IA Examens Camerounais")

        # Select Exam & Subject
        print("Selecting Exam and Subject...")
        selects = page.query_selector_all("select")
        if len(selects) >= 2:
            selects[0].select_option(index=1) # BAC
            time.sleep(0.5)
            selects[1].select_option(index=1) # Maths or Physics

        # Send a prompt
        print("Sending message to AI Assistant...")
        page.fill("input[placeholder*='Posez votre question']", "Comment reviser les mathematiques au BAC?")
        page.click("button:has-text('Envoyer')")

        time.sleep(2)

        # Take screenshot
        screenshot_path = "verification/exam_assistant_verified.png"
        page.screenshot(path=screenshot_path)
        print(f"E2E test complete! Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run()
