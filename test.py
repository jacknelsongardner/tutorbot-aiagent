import requests

url = (
    "https://hackathon.api.qloo.com/v2/insights?filter.type=urn:entity:videogame&"
    "&filter.release_year.min=1990"
    "&filter.release_year.max=2025"
    "&signal.interests.entities=6DCA5832-D5E2-40CD-9353-8F82B8649445,43B2316E-1192-42BF-AAF7-78E06BADD771"

    "&take=10"
    )

headers = {
    "accept": "application/json",
    "X-Api-Key": "hc1HsdU4vEsixvMviNxUETmIY0RFm3K6SKc7nwxqGXQ"
}

response = requests.get(url, headers=headers)

print(response.text)


data = response.json()

# Print the name of each entity in the results
entities = data["results"].get("entities", [])
if entities:
    for entity in entities:
        print("Entity name:", entity.get("name", "Unknown"))
else:
    print("No entities found.")
