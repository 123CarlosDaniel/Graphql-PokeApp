import { ApolloServer, gql } from 'apollo-server'
import fetch from 'node-fetch'
const typeDefinitions = gql`
  type PokemonInfo {
    name: String
    url: String
    pokemonImg: String
  }
  type Pokemon {
    id: Int
    name: String
    weight: Int
    sprite: String
    abilities: [String]
    hp : Int
    attack: Int
    special: Int
    defense: Int
    types: [String]
  }
  type Query {
    getPokemons(offset: Int, limit: Int): [PokemonInfo]
    getPokemon(name: String, id: Int): Pokemon
  }
`

const resolvers = {
  Query: {
    getPokemons: async (root, args) => {
      let offset = args.offset || 0
      let limit = args.limit || 20
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
        const data = await response.json()
        return data.results
      } catch (error) {
        console.log(error)
      }
    },
    getPokemon: async (root, args) => {
      let searchParam = args.name || args.id
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchParam}`)
        const data = await response.json()
        const abilities = data.abilities.map(el => el.ability.name)
        return {
          name: data.name,
          weight: data.weight,
          id: data.id,
          sprite: data.sprites.other.dream_world.front_default,
          abilities , 
          hp : data.stats[0].base_stat,
          attack : data.stats[1].base_stat,
          special : data.stats[3].base_stat,
          defense : data.stats[2].base_stat,
          types : data.types.map(el => el.type.name)
        }
      } catch (error) {
        console.log(error)
      }
    },
  },
  PokemonInfo: {
    pokemonImg: async ({ url }) => {
      // use the id to get the pokemon using the getPokemon resolver
      // return await resolvers.Query.getPokemon({}, { name })
      let id = url.split('/')[6]
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`
    },
  },
}

const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers,
})

server.listen(process.env.PORT || 4000).then(({ url }) => {
  console.log(`Server ready at ${url}`)
}).catch(er => console.log(er))
