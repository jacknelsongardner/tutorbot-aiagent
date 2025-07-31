from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from uuid import uuid4
from dotenv import load_dotenv
import re
import json



# Load environment variables from .env file
load_dotenv()
print("OPENAI_API_KEY:", os.getenv("OPENAI_API_KEY"))

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # ✅ This enables CORS for all routes and all origins

openai_client = OpenAI(api_key="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")
conversations = {}






def handle_whiteboard(input_text):
 # Extract the commentary
    commentary_match = re.search(r'<@(.+?)@>', input_text, re.DOTALL)
    commentary = commentary_match.group(1).strip() if commentary_match else ""

    # Extract the whiteboard part
    whiteboard_match = re.search(r'<#(.*?)#>', input_text, re.DOTALL)
    whiteboard_content = whiteboard_match.group(1).strip() if whiteboard_match else input_text.strip()

    whiteboard_items = []

    # Pattern for text items
    text_pattern = re.compile(
        r'\[(\d+)\s+text\s+position\s+\((\d+),\s*(\d+)\)\s+sized\s+\((\d+)\):\s+"(.*?)"\]'
    )

    # Pattern for line items
    line_pattern = re.compile(
        r'\[(\d+)\s+line\s+from\s+\((\d+),\s*(\d+)\)\s+to\s+\((\d+),\s*(\d+)\)\s*\]'
    )

    # Pattern for rect items
    rect_pattern = re.compile(
        r'\[(\d+)\s+rect\s+at\s+\((\d+),\s*(\d+)\)\s+sized\s+\((\d+),\s*(\d+)\)\s*\]'
    )

    for match in text_pattern.finditer(whiteboard_content):
        item_id, x, y, size, text = match.groups()
        whiteboard_items.append({
            "id": int(item_id),
            "type": "text",
            "position": [int(x), int(y)],
            "size": int(size),
            "content": text
        })

    for match in line_pattern.finditer(whiteboard_content):
        item_id, x1, y1, x2, y2 = match.groups()
        whiteboard_items.append({
            "id": int(item_id),
            "type": "line",
            "from": [int(x1), int(y1)],
            "to": [int(x2), int(y2)]
        })

    for match in rect_pattern.finditer(whiteboard_content):
        item_id, x, y, width, height = match.groups()
        whiteboard_items.append({
            "id": int(item_id),
            "type": "rect",
            "position": [int(x), int(y)],
            "size": [int(width), int(height)]
        })

    return {
        "commentary": commentary,
        "whiteboard": whiteboard_items
    }



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
            del conversations[key]

        raw_instruction = f'''
                    You're name is {chatbot_name}, and you are tutoring {student_name}.
                    You are a {tutor_persona}
                    You are a helpful tutor that knows Jack's interests.
                    Remember to use whiteboard content format for all messages.
                    <@ @> surrounding commentary to the student.
                    <# #> surrounding whiteboard content.

                    make sure to label the width and height of rectangles, when relevant.
                    your canvas is 100x100 pixels

                    <STUDENT HOBBIES>
                    {student_likes}. Use for word problems when relevant.
                    
                    Adhere strictly to the whiteboard content format below, from here on out.
                    
                    ////// EXAMPLE WHITEBOARD CONTENT ///////
                    <#
                    [1 text position (150, 100) sized (30): "  23"]
                    [2 text position (150, 130) sized (30): "+ 45"]
                    [3 line from (150, 155) to (190, 155) ]
                    [4 rect at (150, 170) sized (25, 35) ]
                    #>

                    /////// EXAMPLE COMMENTARY! NOTE THE <@ @> FORMAT ///////
                    <@
                    See how we lined up the digits and added them?
                    Now you try.
                    @>

                    NOTE: Do only one commentary for each message to the student.
                    NOTE: Stick to the whiteboard content format above.

                    Draw something on the whiteboard to start the conversation! 
                    And some commentary to the student, asking how they're doing.
                    be sure to label shapes sides when drawn

                '''
        
        processed_instruction = [line.strip() for line in raw_instruction.splitlines() if line.strip()]  # Remove empty lines and strip whitespace
        processed_prompt = " ".join(processed_instruction)  # Join into a single line with spaces
         
        # Start with system message
        messages = [
            {
                "role": "system",
                "content": processed_prompt
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
        
        reply_json = handle_whiteboard(reply_content)

        return jsonify({"response": reply_json, "response_raw": reply_content})

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
    messages = conversations[key]

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
    
    reply_json = handle_whiteboard(reply_content)

    return jsonify({"response": reply_json, "response_raw": reply_content})


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
