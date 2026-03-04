import os
import threading
from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
from dotenv import load_dotenv
from reply_service import get_quick_reply, get_full_analysis_report
from land_service import get_land_by_location, get_land_by_survey

load_dotenv()  # loads .env file

# ── Twilio REST client for follow-up messages ──────────────────────────
TWILIO_SID   = os.environ.get("TWILIO_ACCOUNT_SID", "")
TWILIO_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM  = os.environ.get("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

twilio_client = Client(TWILIO_SID, TWILIO_TOKEN) if TWILIO_SID and TWILIO_TOKEN else None

def send_followup(to_number, survey_no, lat, lon):
    """Run in background thread — fetch GEE analysis and send via Twilio REST."""
    try:
        print(f"⏳ Background: fetching full analysis for survey {survey_no}...")
        report = get_full_analysis_report(survey_no, lat, lon)
        if twilio_client:
            twilio_client.messages.create(
                body=report,
                from_=TWILIO_FROM,
                to=to_number
            )
            print(f"✅ Follow-up sent to {to_number}")
        else:
            print("⚠️ Twilio client not configured — set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN env vars")
            print("Follow-up report:", report)
    except Exception as e:
        print(f"❌ Follow-up error: {e}")

app = Flask(__name__)

@app.route("/webhook", methods=["POST"])
def whatsapp_reply():
    print("🔔 Webhook triggered")

    msg_type    = request.form.get("MessageType", "text")
    from_number = request.form.get("From")
    incoming_msg = request.form.get("Body", "")

    print("From:", from_number)
    print("MessageType:", msg_type)
    print("Message body:", incoming_msg)

    # ── TEXT MESSAGE ───────────────────────────────────────────────────
    if msg_type == "text":
        survey_input = incoming_msg.lower().replace("survey", "").strip()
        land = get_land_by_survey(survey_input)

        if land:
            # 1. Instant reply from GeoJSON (no delay)
            response_text = get_quick_reply(land)

            # 2. Fire background thread for full GEE analysis
            t = threading.Thread(
                target=send_followup,
                args=(from_number, land["survey_no"], land["lat"], land["lon"]),
                daemon=True
            )
            t.start()
        else:
            response_text = get_quick_reply(None, incoming_msg)

    # ── LOCATION MESSAGE ───────────────────────────────────────────────
    elif msg_type == "location":
        lat = request.form.get("Latitude")
        lon = request.form.get("Longitude")
        print(f"📍 LOCATION: {lat}, {lon}")

        land = get_land_by_location(lat, lon)

        if land:
            response_text = get_quick_reply(land)
            t = threading.Thread(
                target=send_followup,
                args=(from_number, land["survey_no"], land["lat"], land["lon"]),
                daemon=True
            )
            t.start()
        else:
            response_text = "❌ No land record found for this location."

    else:
        response_text = "Unsupported message type."

    resp = MessagingResponse()
    resp.message(response_text)
    return str(resp)


if __name__ == "__main__":
    app.run(debug=True)
