from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Allow all origins

API_KEY = "hc1HsdU4vEsixvMviNxUETmIY0RFm3K6SKc7nwxqGXQ"


@app.route("/search_entities", methods=["GET"])
def search_entities():
    kind = request.args.get("kind")
    query = request.args.get("query")
    take = request.args.get("take", 10)

    if not kind or not query:
        return jsonify({"error": "Missing 'kind' or 'query' parameter"}), 400

    url = (
        f"https://hackathon.api.qloo.com/search"
        f"?query={query}"
        f"&types=urn%3Aentity%3A{kind}"
        f"&take={take}"
    )
    headers = {
        "accept": "application/json",
        "X-Api-Key": API_KEY
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()
    entities = data.get("results", [])
    results = [
        {"name": entity.get("name", "Unknown"), "entity_id": entity.get("entity_id", "Unknown ID")}
        for entity in entities
    ]
    return jsonify(results)


@app.route("/find_entities", methods=["POST"])
def find_entities():
    body = request.get_json()

    entity_type = body.get("entity_type")
    entity_ids = body.get("entity_ids", [])
    min_year = body.get("min_year", 1990)
    max_year = body.get("max_year", 2025)
    take = body.get("take", 10)

    if not entity_type or not entity_ids:
        return jsonify({"error": "Missing 'entity_type' or 'entity_ids'"}), 400

    entity_ids_str = ",".join(entity_ids)
    url = (
        f"https://hackathon.api.qloo.com/v2/insights"
        f"?filter.type=urn:entity:{entity_type}"
        f"&filter.release_year.min={min_year}"
        f"&filter.release_year.max={max_year}"
        f"&signal.interests.entities={entity_ids_str}"
        f"&take={take}"
    )
    headers = {
        "accept": "application/json",
        "X-Api-Key": API_KEY
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()

    entities = data.get("results", {}).get("entities", [])
    results = [
        {"name": entity.get("name", "Unknown"), "entity_id": entity.get("entity_id", None)}
        for entity in entities
    ]
    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True, port=5001, debug=True)
