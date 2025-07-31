import requests
import json


url = (
    "https://hackathon.api.qloo.com/search?query=Mario&types=urn%3Aentity%3Avideogame&filter.radius=10&operator.filter.tags=union&operator.filter.exclude.tags=union&page=1&take=20&sort_by=match&take=1"
    
    )

headers = {
    "accept": "application/json",
    "X-Api-Key": "hc1HsdU4vEsixvMviNxUETmIY0RFm3K6SKc7nwxqGXQ"
}

response = requests.get(url, headers=headers)
print(response.text)
data = response.json()
print(json.dumps(data, indent=2))
entities = data["results"]
if entities:
    for entity in entities:
        print("Entity name:", entity.get("name", "Unknown"), "Entity id", entity.get("entity_id", "Unknown ID"))
else:
    print("No entities found.")

print(entities[0])