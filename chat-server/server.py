from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from uuid import uuid4
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
print("OPENAI_API_KEY:", os.getenv("OPENAI_API_KEY"))

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # ✅ This enables CORS for all routes and all origins

openai_client = OpenAI(api_key="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")
conversations = {}

@app.route('/start', methods=['POST'])
def start_session():
    try:
        # Parse JSON data from request
        data = request.get_json()
        if not data or "userID" not in data:
            return jsonify({"error": "Missing userID in request"}), 400
        
        user_name = data.get("userID")

        # Check for student info
        student_name = "jack"
        student_likes = "likes pirates and mario bros."
        learning_goals = "Learn to calculate area and perimeter of rectangles and triangles. Be able to apply these concepts to real world problems (word problems)."
        learning_status = "Did ok with area and perimeter of rectangles, but struggles with triangles."
        tutor_persona = "pokemon pirate who loves make learning fun. You also say ARGGH a lot and use pirate slang."
        chatbot_name = "pokepirate"

        key = user_name
        if key in conversations:
            return jsonify({"error": "Session already exists"}), 400

        # Start with system message
        messages = [
            {
                "role": "system",
                "content": f'''
                    You're name is {chatbot_name}, and you are tutoring {student_name}.
                    You are a {tutor_persona}
                    You are a helpful tutor that knows Jack's interests.
                    Remember to use whiteboard content format for all messages.
                    <@ @> surrounding commentary to the student.
                    <# #> surrounding whiteboard content.
                    
                    <STUDENT GOALS>
                    {learning_goals}
                    
                    <STUDENT PROGRESS>
                    {learning_status}   

                    <STUDENT HOBBIES>
                    {student_likes}. Use for word problems when relevant.
                    
                    Adhere strictly to the whiteboard content format below, from here on out.
                    
                    ////// EXAMPLE WHITEBOARD CONTENT ///////
                    <#
                    [1 text at (150, 100) sized (30): "  23"]
                    [2 text at (150, 130) sized (30): "+ 45"]
                    [3 line from (150, 155) to (190, 155)]
                    [4 square at (150, 170) sized (25, 35) : ]
                    [5 sticker at (100, 100): "happy face"]
                    #>

                    <@
                    See how we lined up the digits and added them?
                    Now you try: 56 [highlight ] + 27. 
                    @>

                    ////// WHITEBOARD EXAMPLE CONTENT END ///////
                    NOTE: Do only one commentary for each message to the student.
                    NOTE: Stick to the whiteboard content format above.

                    Draw something on the whiteboard to start the conversation!

                '''
            },
            {"role": "user", "content": f"Hi, I'm {student_name}!"}
        ]
        
        # Store messages in conversations
        conversations[key] = messages

        # Send the first message to get a response from OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.3  # Optional: adjust for creativity/consistency
        )

        # Extract the reply content
        reply_content = response.choices[0].message.content
        reply = {"role": "assistant", "content": reply_content}
        
        # Append the reply to conversations
        conversations[key].append(reply)
        
        return jsonify({"response": reply_content})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route('/message', methods=['POST'])
def continue_conversation():
    data = request.get_json()
    user_name = data.get("userID")
    message = data.get("message")

    key = user_name
    if key not in conversations:
        return jsonify({"error": "No session found"}), 404

    # Add user message
    conversations[key].append({"role": "user", "content": message})

    # Query GPT
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=conversations[key]
    )

    reply = response['choices'][0]['message']
    conversations[key].append(reply)
    return jsonify({"response": reply['content']})


@app.route('/end', methods=['POST'])
def end_conversation():
    data = request.get_json()
    user_name = data.get("userID")
    class_id = data.get("classID")

    key = user_name
    if key in conversations:
        del conversations[key]
        return jsonify({"status": "Conversation ended"})
    else:
        return jsonify({"error": "No session found"}), 404


@app.route('/active_sessions', methods=['GET'])
def active_sessions():
    return jsonify({"sessions": [ {"userID": uid, "classID": cid} for (uid, cid) in conversations.keys() ]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
