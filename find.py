import requests

def find_entities(entity_type, entity_ids, min_year=1990, max_year=2025, take=10):
    """
    Query the Qloo API for entities of a given type and list of entity_ids.
    Returns a list of (name, entity_id) tuples.
    """
    base_url = "https://hackathon.api.qloo.com/v2/insights"
    entity_ids_str = ",".join(entity_ids)
    url = (
        f"{base_url}?filter.type=urn:entity:{entity_type}"
        f"&filter.release_year.min={min_year}"
        f"&filter.release_year.max={max_year}"
        f"&signal.interests.entities={entity_ids_str}"
        f"&take={take}"
    )

    headers = {
        "accept": "application/json",
        "X-Api-Key": "hc1HsdU4vEsixvMviNxUETmIY0RFm3K6SKc7nwxqGXQ"
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()

    results = []
    entities = data.get("results", {}).get("entities", [])
    for entity in entities:
        name = entity.get("name", "Unknown")
        entity_id = entity.get("entity_id", None)
        results.append((name, entity_id))
    return results

import json

def search_entities(kind, query, take=10):
    """
    Search the Qloo API for entities of a given kind and query string.
    Returns a list of (name, entity_id) tuples.
    """
    url = (
        f"https://hackathon.api.qloo.com/search"
        f"?query={query}"
        f"&types=urn%3Aentity%3A{kind}"
        f"&take={take}"
    )
    print(url)
    headers = {
        "accept": "application/json",
        "X-Api-Key": "hc1HsdU4vEsixvMviNxUETmIY0RFm3K6SKc7nwxqGXQ"
    }
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()
    entities = data.get("results", [])
    return [(entity.get("name", "Unknown"), entity.get("entity_id", "Unknown ID")) for entity in entities]


print(search_entities("tv_show", "Mario brothers"))
#print(find_entities("videogame", ["6DCA5832-D5E2-40CD-9353-8F82B8649445", "43B2316E-1192-42BF-AAF7-78E06BADD771"]))