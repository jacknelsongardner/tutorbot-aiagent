from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from uuid import uuid4
from dotenv import load_dotenv
import re
import json

from find import search_entities, find_entities

import pytesseract
from PIL import Image
import io
import base64


# Load environment variables from .env file
load_dotenv()


# Initialize Flask app
app = Flask(__name__)
CORS(app)  # ✅ This enables CORS for all routes and all origins

openai_client = OpenAI(api_key="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")

            
conversations = {}
favorites = {}




def handle_whiteboard(input_text):
 # Extract the commentary
    
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

    return whiteboard_items
    

def generate_whiteboard(problem):
    
        raw_instruction = f'''
                    You are writing problems on a board for a tutor. the whiteboard will be seen by human child.
                    Adhere strictly to the whiteboard content format below, from here on out. 
                    whiteboard is 100x100
                    ////// EXAMPLE WHITEBOARD CONTENT ///////
                    <#
                    [1 text position (150, 130) sized (30): "45"]
                    [2 line from (150, 155) to (190, 155) ]
                    
                    #>
                    Illustrate the problem: {problem}
                    If drawing shapes, remember to label sides, no text, just numbers
                    don't give away answer to problem in the whiteboard ok?
                    but give clear instructions to the child

                    Be sure to write the problem on the board as well.
                    
                    
                '''
        #[3 rect at (150, 170) sized (25, 35) ]
        processed_instruction = [line.strip() for line in raw_instruction.splitlines() if line.strip()]  # Remove empty lines and strip whitespace
        processed_prompt = " ".join(processed_instruction)  # Join into a single line with spaces
         
        # Start with system message
        messages = [
            {
                "role": "system",
                "content": processed_prompt
            }
        ]

        # Send the first message to get a response from OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=messages,
            temperature=0.3  # Optional: adjust for creativity/consistency
        )

        # Extract the reply content
        reply_content = response.choices[0].message.content
        reply = {"role": "assistant", "content": reply_content}
        
        reply_json = handle_whiteboard(reply_content)
        return reply_json

        

def generate_problem(next, type, likes, difficulty, special):
    
        raw_instruction = f'''
                    You are going to generate a problem for this tutor to help teach
                    surround the problem instructions with <# #> brackets e.g. <# simplify, solve, etc #>
                    surround the problem itself with <@ @> brackets e.g. <@ if mary has 5 apples, etc@>
                    give the answer to the problem with <! !> e.g. <! 2 square feet !>
                    remember to write the answer or it won't work!!!!

                    WARNING : KEEP AWAY FROM COPYRIGHTED CONTENT
                '''
        
        processed_instruction = [line.strip() for line in raw_instruction.splitlines() if line.strip()]  # Remove empty lines and strip whitespace
        processed_prompt = " ".join(processed_instruction)  # Join into a single line with spaces
         
        # Start with system message
        messages = [
            {
                "role": "system",
                "content": processed_prompt
            },
            {"role": "user", "content": f"My child needs a problem based on {next}! Make it {type} with {difficulty} themed around one of these {likes}. Special instructions: {special}"}
        ]

        # Send the first message to get a response from OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=messages,
            temperature=0.3  # Optional: adjust for creativity/consistency
        )

        # Extract the reply content
        reply_content = response.choices[0].message.content

        result = {}

        problem = ""
        instructions = ""
        answer = ""

        pattern = r"<#(.+?)#>"
        match = re.search(pattern, reply_content)
        if not match:
            pass
        else: 
            instructions = match.group(1)  # e.g. "body:choice|hat:choice|glasses:choice|holding:choice"
        
        pattern = r"<@(.+?)@>"
        match = re.search(pattern, reply_content, re.DOTALL)
        if not match:
            pass
        else:
            problem = match.group(1)  # e.g. "body:choice|hat:choice|glasses:choice|holding:choice"
       

        pattern = r"<!(.+?)!>"
        match = re.search(pattern, reply_content, re.DOTALL)
        if not match:
            pass
        else:
            answer = match.group(1)  # e.g. "body:choice|hat:choice|glasses:choice|holding:choice"
        

        whiteboard = {}
        whiteboard = generate_whiteboard(problem)
        
        print(instructions)
        print(problem)
        
        result["instructions"] = instructions
        result["problem"] = problem
        result["raw"] = reply_content
        result["whiteboard"] = whiteboard
        result["answer"] = answer

        return result

@app.route('/generate-problem', methods=['POST'])
def generate_problem_endpoint():
    try:
        data = request.get_json()
        next_topic = data.get("next")
        type_level = data.get("type")
        likes = data.get("likes")
        difficulty = data.get("difficulty")
        special = data.get("special")

        if not next_topic or not type_level or not likes:
            return jsonify({"error": "Missing required fields"}), 400

        result = generate_problem(next_topic, type_level, likes, difficulty, special)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@app.route('/start', methods=['POST'])
def start_session():
    try:
        # Parse JSON data from request
        data = request.get_json()
        if not data or "userID" not in data:
            return jsonify({"error": "Missing userID in request"}), 400
        
        user_name = data.get("userID")

        # Check for student info
        student_likes = data.get("favorites")
        tutor_persona = data["tutor"]["name"]
        chatbot_name = data["tutor"]["description"]

        favorites[user_name] = student_likes
        print(student_likes)

        key = user_name
        if key in conversations:
            del conversations[key]

        raw_instruction = f'''
                    You're name is {chatbot_name}, and you are tutoring {user_name}.
                    You are a {tutor_persona} using the socratic method
                    You are a helpful tutor that knows Jack's interests.
                    Remember to use whiteboard content format for all messages.
                    <@ @> surrounding commentary to the student.
                    <# #> surrounding whiteboard content.

                    make sure to label the width and height of rectangles, when relevant.
                    your canvas is 100x100 pixels

                    <STUDENT HOBBIES>
                    
                    {student_likes}. Use for word problems when relevant.
                    
                    Adhere strictly to the problem and commentary content format below, from here on out. 
                    Theme should be based on something in the kids favorites i've shown you

                    
                    /////// EXAMPLE COMMENTARY! NOTE THE <@ @> FORMAT ///////
                    <@
                    Let's try a perimeter problem! Let me know if you need help!
                    @>
                    ////// EXAMPLE WHITEBOARD GENERATION ///////

                    <#
                    [1 text position (150, 130) sized (30): "find the perimeter of the shape"]
                    [2 line from (150, 155) to (190, 155)]   // top edge
                    [3 line from (190, 155) to (190, 195)]   // right edge
                    [4 line from (190, 195) to (150, 195)]   // bottom edge
                    [5 line from (150, 195) to (150, 155)]   // left edge
                    [1 text position (150, 100) sized (30): "width 10"]
                    [1 text position (150, 120) sized (30): "height 15"]
                    #>

                    IMPORTANT: don't generate another problem until the kid asks you
                    ask before messing with the whiteboard at all

                    NOTE: After they get one right, ask before creating another problem
                    NOTE: Mostly just give hints. Keep commentary short, 10-15 words tops
                    NOTE: Don't construct problems until you've found out what the kid wants to learn
                    NOTE: Don't repeat the problem to the user, they can already see it
                    NOTE: always do some commentary, when you make a problem, say you're to help if needed

                    Any time you write to the whiteboard, the whiteboard will clear itself.
                    If you don't write to it with the <##>, it will keep whatever you wrote

                    DON'T EVER WRITE TWO PROBLEMS ON SAME BOARD! DON'T CLEAR UNTIL THE KID SAYS YES TO DOING ANOTHER

                    if kid gets it right, write <#    #> and congradulate them before moving on to the next one
                    when they get problem completely solved, post a <WIN> element
                    if they tell you about something they like, write in your next response <- thing|type| -> brackets e.g. <+catsanddogs+>
                    LIMIT : type can be tv_show, movie, or videogame, nothing else
                '''
        
        processed_instruction = [line.strip() for line in raw_instruction.splitlines() if line.strip()]  # Remove empty lines and strip whitespace
        processed_prompt = " ".join(processed_instruction)  # Join into a single line with spaces
         
        # Start with system message
        messages = [
            {
                "role": "system",
                "content": processed_prompt
            },
            {"role": "user", "content": f"Hi, I'm {user_name}!"}
        ]
        
        # Store messages in conversations
        conversations[key] = messages

        # Send the first message to get a response from OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=messages,
            temperature=0.3  # Optional: adjust for creativity/consistency
        )

        # Extract the reply content
        reply_content = response.choices[0].message.content
        reply = {"role": "assistant", "content": reply_content}
        
        # Append the reply to conversations
        conversations[key].append(reply)

        commentary_match = re.search(r'<@(.+?)@>', reply_content, re.DOTALL)
        commentary = commentary_match.group(1).strip() if commentary_match else ""

        reply_json = {"commentary": commentary}

        return jsonify({"response": reply_json, "response_raw": reply_content})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/message', methods=['POST'])
def continue_conversation():

    student_work = ""

    data = request.get_json()

    if 'image' in data:
        print("image in data")
        image_data_url = data['image']

        # Extract base64 part from data URL
        match = re.search(r'base64,(.*)', image_data_url)
        if not match:
            return jsonify({'error': 'Invalid base64 image'}), 400

        image_data = base64.b64decode(match.group(1))

        try:
            image = Image.open(io.BytesIO(image_data))
            text = pytesseract.image_to_string(image)
            student_work = text.strip()
        except Exception as e:
            student_work = ""

    print(student_work)
    
    user_name = data.get("userID")
    user_favorites = data.get("favorites")
    message = data.get("message")

    message = f"{message}, student whiteboard work: , {student_work}"

    key = user_name
    if key not in conversations:
        return jsonify({"error": "No session found"}), 404

    # Add user message
    conversations[key].append({"role": "user", "content": message})
    messages = conversations[key]

    # Send the first message to get a response from OpenAI
    response = openai_client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=messages,
        temperature=0.3  # Optional: adjust for creativity/consistency
    )

    # Extract the reply content
    reply_content = response.choices[0].message.content
    reply = {"role": "assistant", "content": reply_content}
    
    clear = False

    pattern = r"<#(.+?)#>"
    match = re.search(pattern, reply_content, re.DOTALL)
    if match:
        clear = True

    whiteboard = handle_whiteboard(reply_content)

    favorites_match = re.search(r'<-(.+?)->', reply_content, re.DOTALL)
    favorite = favorites_match.group(1).strip() if commentary_match else ""
    new_favorites = favorite.split("|")

    if favorites_match:
        new_fav = search_entities(new_favorites[0], new_favorites[1], 2)[0]
        favorites.append(new_fav)
        second_elements = [t[1] for t in favorites]
        possible_fav = find_entities(new_favorites[0], second_elements, 1990, 2025, 2)[0]

        win_reply = {"role": "system", "content": f"awesome! now remember to ask him if he likes {possible_fav} after next problem"}
        conversations[user_name].append(win_reply)


    if "<WIN>" in reply_content:
        win_reply = {"role": "system", "content": "awesome! now remember to congradulate the student and talk to him about things he likes before moving on"}
        conversations[user_name].append(win_reply)


    commentary_match = re.search(r'<@(.+?)@>', reply_content, re.DOTALL)
    commentary = commentary_match.group(1).strip() if commentary_match else ""
    
    
    reply_json = { "commentary": commentary, "clear": clear, "whiteboard": whiteboard} #"problem": problem, }

    return jsonify({"response": reply_json, "response_raw": reply_content})


@app.route('/character', methods=['POST'])
def create_character():
    try:
        # Parse JSON data from request
        data = request.get_json()

        if not data or "userID" not in data:
            return jsonify({"error": "Missing userID in request"}), 400
        
        user_name = data.get("userID")
        user_age = data.get("age")
        user_sex = data.get("sex")
        user_favorites = data.get("favorites")

        key = user_name
        if key in conversations:
            del conversations[key]

        raw_instruction = f'''
                    a kid named {user_name} {user_sex} aged {user_age} likes {user_favorites}, 
                    create his tutor from these materials (remember only one of each) 
                    body: bluebody.GIF, greenbody.GIF, whitebody.GIF, pinkbody.GIF 
                    hat: piratehat.PNG, knighthat.PNG, spacehelmet.PNG, wizardhat.PNG, animalhat.PNG, headphones.PNG, alienantenna.PNG
                    glasses: alieneye.PNG, robotgoggles.PNG, eyepatch.PNG, superheromaskred.PNG, superheromaskblue.PNG, superheromaskblack.PNG, 
                    holding: lightsaber.PNG, sword.PNG, wizardwand.PNG, knightshield.PNG, spaceblaster.PNG
                    also name the creature you create (your choice)
                    format of <@|body:choice|hat:choice|glasses:choice|holding:choice@>
                    and for tutor name format of <#name:name|persona:description#>

                    WARNING : KEEP AWAY FROM COPYRIGHTED CONTENT
                    Keep it generic or make any world-building stuff up
                '''

        # Start with system message
        messages = [
            {
                "role": "system",
                "content": raw_instruction
            }
        ]
        
        # Send the first message to get a response from OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=messages,
            temperature=0.3  # Optional: adjust for creativity/consistency
        )

        

        # Extract the reply content
        reply_content = response.choices[0].message.content

        # Match the pattern inside <@ ... @>
        pattern = r"<@(.+?)@>"
        match = re.search(pattern, reply_content)
        if not match:
            raise ValueError("String does not match the expected format.")
        
        content = match.group(1)  # e.g. "body:choice|hat:choice|glasses:choice|holding:choice"
        parts = content.split('|')
        
        result = {}
        for part in parts:
            if ':' not in part:
                continue
            key, value = part.split(':', 1)
            result[key.strip()] = value.strip()

        pattern = r"<#(.+?)#>"
        match = re.search(pattern, reply_content)
        content = match.group(1)
        content = content
        name, description = content.split("|", 1)
        result["name"] = name.split(":",1)[1]
        result["description"] = description.split(":",1)[1]

             
        return jsonify({"response": result, "response_raw": reply_content})

    except Exception as e:
        print("error", str(e))
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route('/active_sessions', methods=['GET'])
def active_sessions():
    return jsonify({"sessions": [ {"userID": uid, "classID": cid} for (uid, cid) in conversations.keys() ]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
