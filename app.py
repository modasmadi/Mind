@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "user", "content": user_message}
        ]
    }

    response = requests.post(API_URL, headers=headers, json=payload)

    try:
        data = response.json()
    except:
        return jsonify({"reply": "⚠️ خطأ في قراءة الرد من السيرفر"})

    # لو في خطأ من DeepSeek
    if "choices" not in data:
        return jsonify({
            "reply": f"⚠️ خطأ من DeepSeek API:\n{data}"
        })

    return jsonify({
        "reply": data["choices"][0]["message"]["content"]
    })
