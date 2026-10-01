"""
Run this to check your Google Apps Script OTP mailer WITHOUT starting the whole app.

    python test_otp.py yourname@gmail.com

It reads OTP_SCRIPT_URL and OTP_SCRIPT_SECRET from backend/.env, sends a test OTP mail
and tells you exactly what is wrong if it fails.
"""
import os
import sys

import requests
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("OTP_SCRIPT_URL", "").strip()
secret = os.getenv("OTP_SCRIPT_SECRET", "").strip()
to = sys.argv[1] if len(sys.argv) > 1 else input("Gmail to send the test OTP to: ").strip()

print("\nOTP_SCRIPT_URL   :", url or "(EMPTY!)")
print("OTP_SCRIPT_SECRET:", "set" if secret else "(empty)")

if not url:
    sys.exit("\n[FAIL] OTP_SCRIPT_URL is empty in backend/.env")
if not url.endswith("/exec"):
    print("\n[WARN] URL should end with /exec (the 'Web app' URL from Deploy). /dev URLs do not work for others.")

payload = {"email": to, "otp": "123456", "name": "Test User"}
if secret:
    payload["secret"] = secret

try:
    r = requests.post(url, json=payload, timeout=40)
except Exception as e:
    sys.exit(f"\n[FAIL] Could not reach the URL: {e}")

print("\nHTTP status :", r.status_code)
print("Final URL   :", r.url[:90])
print("Response    :", (r.text or "")[:400].replace("\n", " "))

try:
    data = r.json()
except ValueError:
    sys.exit(
        "\n[FAIL] Apps Script did not return JSON (you got a Google page).\n"
        "  1. Apps Script > Deploy > Manage deployments > pencil icon > Who has access = ANYONE\n"
        "  2. Version = 'New version' > Deploy (every code change needs a new version)\n"
        "  3. Use the Web app URL that ends with /exec"
    )

if data.get("ok") is True:
    print(f"\n[OK] Mail sent. Check the inbox (and Spam) of {to} for OTP 123456.")
elif data.get("error") == "Forbidden":
    print("\n[FAIL] SECRET mismatch. 'SECRET' in Apps Script and OTP_SCRIPT_SECRET in .env must be exactly the same")
    print("       (or leave both empty).")
else:
    print("\n[FAIL] Apps Script replied:", data.get("error") or data)
    if "doPost" in str(data) or "not a function" in str(data):
        print("       Paste the latest Code.gs and deploy a New version.")