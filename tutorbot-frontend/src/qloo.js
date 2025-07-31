// qlooApi.js

const API_KEY = "hc1HsdU4vEsixvMviNxUETmIY0RFm3K6SKc7nwxqGXQ";

/**
 * Query the Qloo API for related entities.
 * @param {string} entityType - Type of entity (e.g., "videogame").
 * @param {string[]} entityIds - Array of entity IDs.
 * @param {number} minYear
 * @param {number} maxYear
 * @param {number} take
 * @returns {Promise<Array<{ name: string, entity_id: string }>>}
 */
export async function findRelatedEntities(entityType, entityIds, minYear = 1990, maxYear = 2025, take = 10) {
  const baseUrl = "https://hackathon.api.qloo.com/v2/insights";
  const entityIdsStr = entityIds.join(",");
  const url = `${baseUrl}?filter.type=urn:entity:${entityType}&filter.release_year.min=${minYear}&filter.release_year.max=${maxYear}&signal.interests.entities=${entityIdsStr}&take=${take}`;

  const response = await fetch(url, {
    headers: {
      "accept": "application/json",
      "X-Api-Key": API_KEY
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch entities");
  }

  const data = await response.json();
  const entities = data.results?.entities || [];
  return entities.map(entity => ({
    name: entity.name || "Unknown",
    entity_id: entity.entity_id || null
  }));
}

/**
 * Search the Qloo API for entities.
 * @param {string} kind - Type of entity (e.g., "movie", "videogame").
 * @param {string} query - Search query.
 * @param {number} take - Max number of results.
 * @returns {Promise<Array<{ name: string, entity_id: string }>>}
 */
export async function searchEntities(kind, query, take = 10) {
  const url = `https://hackathon.api.qloo.com/search?query=${(query)}&types=urn%3Aentity%3A${kind}&take=${take}`;

  const response = await fetch(url, {
    headers: {
      "accept": "application/json",
      "X-Api-Key": API_KEY
    }
  });

if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to search entities: ${response.status} ${response.statusText} - ${errorText}`);
}

  const data = await response.json();
  const entities = data.results || [];
  return entities.map(entity => ({
    name: entity.name || "Unknown",
    entity_id: entity.entity_id || "Unknown ID"
  }));
}
