import requests

try:
    from .land_service import get_land_by_survey
except ImportError:
    from land_service import get_land_by_survey

BACKEND_URL = "http://127.0.0.1:8000"

def get_encroachment_analysis(lat, lon, language="en"):
    """Call FastAPI /getinfo endpoint for full encroachment analysis."""
    try:
        print(f"🛰️  Calling GEE backend for ({lat}, {lon})...")
        res = requests.post(
            f"{BACKEND_URL}/getinfo",
            json={"lat": lat, "lon": lon, "language": language},
            timeout=(10, 180)  # 10s connect, 180s read — GEE takes time
        )
        if res.status_code == 200:
            print("✅ GEE backend responded!")
            return res.json()
        else:
            print(f"⚠️ Backend returned status {res.status_code}")
    except Exception as e:
        print(f"⚠️ Backend error: {e}")
    return None

def format_whatsapp_report(land, analysis):
    """Format full encroachment report for WhatsApp."""
    survey_no = land["survey_no"]
    land_type = land["land_type"]
    owner     = land["owner"]

    # Encroachment status from vao_summary
    vao = analysis.get("vao_summary", {}) if analysis else {}
    risk = analysis.get("risk_assessment", {}) if analysis else {}
    enhanced = analysis.get("enhanced_detection", {}) if analysis else {}

    enc_detected  = vao.get("encroachment_detected", None)
    alert_color   = vao.get("alert_color", "UNKNOWN")
    severity_score = vao.get("severity_score", "N/A")
    urgency       = vao.get("urgency_level", "N/A")
    action        = vao.get("recommended_action", "N/A")
    findings      = vao.get("what_was_found", [])
    total_flags   = risk.get("total_flags", 0)
    activity      = analysis.get("current_activity", "N/A") if analysis else "N/A"

    # Enhanced detection
    fence       = enhanced.get("fencing_analysis", {}).get("fence_detected")
    agri        = enhanced.get("agricultural_pattern", {}).get("agricultural_activity")
    nightlight  = enhanced.get("nighttime_lights", {}).get("nighttime_lights_detected")

    # Encroachment status icon
    if enc_detected is True:
        enc_icon = "🔴 YES"
    elif enc_detected is False:
        enc_icon = "🟢 NO"
    else:
        enc_icon = "⚪ Unknown"

    # Alert color icon
    color_icon = {"RED": "🔴", "ORANGE": "🟠", "YELLOW": "🟡", "GREEN": "🟢"}.get(alert_color, "⚪")

    # Poramboke warning
    is_gov = land_type.lower() in ["public", "poramboke", "government"]
    warning = "\n⚠️ *Government Poramboke Land!*" if is_gov else ""

    # Findings list
    findings_text = ""
    if findings:
        findings_text = "\n🔎 *Findings:*\n" + "\n".join(f"  • {f}" for f in findings[:3])

    report = (
        f"📋 *Land Intelligence Report*\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"📌 Survey No     : {survey_no}\n"
        f"🏷️ Land Type    : {land_type}\n"
        f"👤 Owner         : {owner}\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"🔍 Encroachment  : {enc_icon}\n"
        f"🚦 Alert Level   : {color_icon} {alert_color}\n"
        f"📊 Severity Score: {severity_score}\n"
        f"⚡ Urgency       : {urgency}\n"
        f"🏗️ Activity      : {activity}\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"🚧 Fence Change  : {'✅ Yes' if fence else '❌ No' if fence is False else 'N/A'}\n"
        f"🌾 Agri Activity : {'✅ Yes' if agri else '❌ No' if agri is False else 'N/A'}\n"
        f"💡 Night Lights  : {'✅ Yes' if nightlight else '❌ No' if nightlight is False else 'N/A'}\n"
        f"🚩 Flags Raised  : {total_flags}\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"📝 Action        : {action}"
        f"{warning}"
        f"{findings_text}"
    )
    return report

def get_quick_reply(land, message=None):
    """Instant reply using only GeoJSON data — no backend call, no delay."""
    if land is None:
        if message:
            msg = message.lower().strip()
            if msg in ["hi", "hello", "hey"]:
                return (
                    "👋 Hello!\n\n"
                    "I am *TLIS Land Intelligence Bot* 🏞️\n\n"
                    "You can:\n"
                    "📍 Send live location\n"
                    "🧾 Send survey number\n\n"
                    "Example: `126` or `44/2`"
                )
        return (
            "❓ Survey number not found.\n\n"
            "Try:\n"
            "• `126`\n"
            "• `44/2`\n"
            "• Send live location 📍"
        )

    is_gov = land["land_type"].lower() in ["public", "poramboke", "government"]
    warning = "\n⚠️ *Government Poramboke Land!*" if is_gov else ""

    return (
        f"📄 *Survey Lookup Result*\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"📌 Survey No : {land['survey_no']}\n"
        f"🏷️ Land Type : {land['land_type']}\n"
        f"👤 Owner     : {land['owner']}"
        f"{warning}\n\n"
        f"⏳ _Full encroachment analysis in progress..._\n"
        f"_(You will receive a detailed report shortly)_"
    )


def get_full_analysis_report(survey_no, lat, lon):
    """Called from background thread — fetches GEE analysis and returns formatted report."""
    land = {"survey_no": survey_no, "lat": lat, "lon": lon}

    # Re-fetch land details for display
    try:
        from land_service import get_land_by_survey
        full_land = get_land_by_survey(str(survey_no))
        if full_land:
            land = full_land
    except Exception:
        pass

    analysis = get_encroachment_analysis(lat, lon)

    if analysis and analysis.get("status") == "success":
        return format_whatsapp_report(land, analysis)
    else:
        return (
            f"⚠️ *Encroachment Analysis Failed*\n"
            f"Survey No: {survey_no}\n"
            f"Could not reach satellite analysis backend.\n"
            f"Please try again or contact field officer."
        )
