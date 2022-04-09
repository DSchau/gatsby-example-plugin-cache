const axios = require('axios')

const fetchAllCharacters = (response = {}, characters = []) => {
  if (!response.info || response.info.next) {
    return axios(response.info ? response.info.next : 'https://rickandmortyapi.com/api/character')
      .then(res => res.data)
      .then(res => {
        return fetchAllCharacters(res, characters.concat(res.results))
      })
  }
  return characters
}

exports.sourceNodes = async function sourceNodes({ cache, actions, createNodeId, createContentDigest, reporter }, options) {
  const CACHE_KEY = `characters`
  let existing = await cache.get(CACHE_KEY)

  if (!existing) {
    reporter.info('Characters was not cached. Fetching new characters')

    const characters = await fetchAllCharacters()

    existing = characters

    await cache.set(CACHE_KEY, characters)
  } else {
    reporter.info('Characters was cached. Moving on!')
  }

  for (let i = 0; i < existing.length; i++) {
    const character = Object.assign({}, existing[i], {
      id: existing[i].id.toString()
    })

    const node = {
      id: createNodeId(`rick-and-morty-character-${character.id}`),
      parent: null,
      children: [],
      internal: {
        type: `RickAndMortyCharacter`,
        content: JSON.stringify(character),
        contentDigest: createContentDigest(character)
      }
    }

    actions.createNode(Object.assign({}, node, character))
  }
}
