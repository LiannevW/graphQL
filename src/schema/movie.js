import { makeExecutableSchema } from 'graphql-tools';
import http from 'request-promise-json';

const MOVIE_DB_API_KEY = process.env.MOVIE_DB_API_KEY;
const OMDB_API_KEY = process.env.OMDB_API_KEY;

export const typeDefs = `
  type Person {
    adult: Boolean
    name: String
    known_for: [Media]
  }

  interface Media {
    id: ID!
    title: String!
    media_type: String!
  }

  type Movie implements Media {
    id: ID!
    title: String!
    media_type: String!
    duration: Int!
    box_office: Int!
  }

  type TVShow implements Media {
    id: ID!
    title: String!
    media_type: String!
    episodes: [Episode]!
    running: Boolean
  }

  type Episode {
    id: ID!
  }

  # the schema allows the following query:
  type Query {
    movies: [Movie]
    movie(id: ID, imdb_id: String): Movie
  }

`;

const resolvers = {
  Query: {
    movie: async (obj, args, context, info) => {
      if (args.id) {
        return http
          .get(`https://api.themoviedb.org/3/movie/${args.id}?api_key=${MOVIE_DB_API_KEY}&language=en-US`)
      }
      if (args.imdb_id) {
        const results = await http
          .get(`https://api.themoviedb.org/3/find/${args.imdb_id}?api_key=${MOVIE_DB_API_KEY}&language=en-US&external_source=imdb_id`)

        if (results.movie_results.length > 0) {
          const movieId = results.movie_results[0].id
          return http
            .get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${MOVIE_DB_API_KEY}&language=en-US`)
        }
      }
    },
    movies: async (obj, args, context, info) => {
      const {results} = await http
          .get(`https://api.themoviedb.org/3/movie/popular?api_key=${MOVIE_DB_API_KEY}&language=en-US&page=1`)
        return results
      },
  },
//   Mutation: {
//     rateMovie: async (obj, args, context, info) => {
//       const movie = await http
//         .get(`https://api.themoviedb.org/3/movie/${args.id}?api_key=${MOVIE_DB_API_KEY}&language=en-US`)
//
//       if (!movie) {
//         throw new Error(`Couldn't find movie with id ${args.id}`);
//       }
//
//       return http
//         .post(
//           `https://api.themoviedb.org/3/movie/${args.id}/rating?api_key=${MOVIE_DB_API_KEY}&language=en-US`,
//           { value: rating }
//         )
//     },
//   },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;
