from flask import Flask, request, jsonify
import openai
import os
from uuid import uuid4

app = Flask(__name__)

# Set your API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Stores conversations: key = (user_id, class_id), value = list of messages
conversations = {}

@app.route('/start', methods=['POST'])
def start_session():
    data = request.get_json()
    user_id = data.get("userID")
    class_id = data.get("classID")
    

    # Check for students info
    student_name = "jack"
    student_likes = "likes dinosaurs, football, and pokemon."
    learning_goals = "Learn to calculate area and perimiter of rectangles and triangles. Be able to apply these concepts to real world problems (word problems)."
    learning_status = "Did ok with area and perimeter of rectangles, but struggles with triangles."
    tutor_persona = "pokemon pirate pikachu who loves to play games and make learning fun."
    chatbot_name = "poketutor"

    key = (user_id, class_id)
    if key in conversations:
        return jsonify({"error": "Session already exists"}), 400

    # Start with system message
    messages = [{"role": "system", "content": f'''    
                    You're name is {chatbot_name}, and you are tutoring {student_name}.
                    You are a {tutor_persona}
                    You are a helpful tutor that knows jacks interests.
                    Jack is 10 years old and is in 5th grade.
                    You can interact jack through a whiteboard via text. 
                    It is 600 pixels wide and 400 pixels tall.
                    Use the syntax below, as this will be used on a whiteboard programmed. 
                    Feel free to introduce yourself on the board and use socratic method and 
                    be sure to ask what they'd like to do next. Don't start off with a problem, 
                    introduce yourself first and don't do a problem until you know what they'd 
                    like to work on from the goals. Feel free, if they need help, to do something 
                    that will be a prerequisite for the problem type at hand. 
                    Also, when doing problems, make sure not to assume the kid doesn't know how,
                    don't over explain unless the kid indicates he doesn't know. 
                    Don't ask what they'd like to do next until they've done the task at hand. 
                    Remember there's no way to know what the kid clicks on. 
                    You CAN however see what jack writes on his own board. 
                    Don't explain a problem until jack says he doesn't understand. be laid back.
                    Let the kid drive the conversation, and don't be too pushy.
                    
                    <STUDENT GOALS>
                    {learning_goals}
                    
                    <STUDENT PROGRESS>
                    {learning_status}   

                    <STUDENT HOBBIES>
                    {student_likes}. Use for word problems when relevant.
                    
                    Adhere strictly to the whiteboard content format below, from here on out.
                    
                    ////// EXAMPLE WHITEBOARD CONTENT ///////

                    [1 text at (150, 100) sized (30): "  23"]
                    [2 text at (150, 130) sized (30): "+ 45"]
                    [3 line from (150, 155) to (190, 155)]
                    [4 square at (150, 170) sized (25, 35) : ]
                    [5 sticker at (100, 100): "happy face"]

                    <@commentary
                    See how we lined up the digits and added them?
                    Now you try: 56 [highlight ] + 27. @>

                    ////// WHITEBOARD EXAMPLE CONTENT END ///////
                    NOTE : do only one commentary for each message to the student.
                    NOTE : stick to the whiteboard content format above.
        '''}

    ]
    

    

    conversations[key] = messages

    # Send the first message to get a response from GPT
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages
    )
    
    reply = response['choices'][0]['message']
    conversations[key].append(reply)
    return jsonify({"response": reply['content']})


@app.route('/message', methods=['POST'])
def continue_conversation():
    data = request.get_json()
    user_id = data.get("userID")
    class_id = data.get("classID")
    message = data.get("message")

    key = (user_id, class_id)
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
    user_id = data.get("userID")
    class_id = data.get("classID")

    key = (user_id, class_id)
    if key in conversations:
        del conversations[key]
        return jsonify({"status": "Conversation ended"})
    else:
        return jsonify({"error": "No session found"}), 404


@app.route('/active_sessions', methods=['GET'])
def active_sessions():
    return jsonify({"sessions": [ {"userID": uid, "classID": cid} for (uid, cid) in conversations.keys() ]})

if __name__ == '__main__':
    app.run(debug=True)
