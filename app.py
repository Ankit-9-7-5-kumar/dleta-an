from flask import Flask, render_template, request, jsonify
import requests
from datetime import datetime
import os
app = Flask(__name__)

API_KEY = os.getenv("OPENWEATHER_API_KEY")

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/weather")
def weather():
    city = request.args.get("city")
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    r = requests.get(url)

    if r.status_code != 200:
        return jsonify({"error": "City not found"})

    data = r.json()

    timezone_offset = data["timezone"]
    sunrise = datetime.utcfromtimestamp(data["sys"]["sunrise"] + timezone_offset).strftime("%H:%M")
    sunset = datetime.utcfromtimestamp(data["sys"]["sunset"] + timezone_offset).strftime("%H:%M")
    local_time = datetime.utcfromtimestamp(data["dt"] + timezone_offset).strftime("%d %b %Y, %H:%M")

    return jsonify({
        "city": data["name"],
        "country": data["sys"]["country"],
        "temp": data["main"]["temp"],
        "weather": data["weather"][0]["main"],
        "humidity": data["main"]["humidity"],
        "sunrise": sunrise,
        "sunset": sunset,
        "time": local_time,
        "lat": data["coord"]["lat"],
        "lon": data["coord"]["lon"]
    })

@app.route("/weather/location")
def weather_location():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    r = requests.get(url)

    if r.status_code != 200:
        return jsonify({"error": "Location error"})

    data = r.json()
    offset = data["timezone"]

    from datetime import datetime
    local_time = datetime.utcfromtimestamp(data["dt"] + offset).strftime("%d %b %Y, %H:%M")
    sunrise = datetime.utcfromtimestamp(data["sys"]["sunrise"] + offset).strftime("%H:%M")
    sunset = datetime.utcfromtimestamp(data["sys"]["sunset"] + offset).strftime("%H:%M")

    return jsonify({
        "city": data["name"],
        "country": data["sys"]["country"],
        "temp": data["main"]["temp"],
        "weather": data["weather"][0]["main"],
        "humidity": data["main"]["humidity"],
        "time": local_time,
        "sunrise": sunrise,
        "sunset": sunset,
        "lat": data["coord"]["lat"],
        "lon": data["coord"]["lon"]
    })

@app.route("/forecast")
def forecast():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    r = requests.get(url)

    data = r.json()
    hourly = []

    for item in data["list"][:8]:  # next 24 hours (3h interval)
        hourly.append({
            "time": item["dt_txt"].split(" ")[1][:5],  # HH:MM
            "temp": item["main"]["temp"],
            "weather": item["weather"][0]["main"]
        })

    return jsonify(hourly)
@app.route("/forecast/daily")
def daily_forecast():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    r = requests.get(url)
    data = r.json()

    daily = {}

    for item in data["list"]:
        date = item["dt_txt"].split(" ")[0]  # YYYY-MM-DD
        if date not in daily:
            daily[date] = {
                "date": date,
                "temp": item["main"]["temp"],
                "weather": item["weather"][0]["main"]
            }

    # next 5 days only
    result = list(daily.values())[1:6]
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

