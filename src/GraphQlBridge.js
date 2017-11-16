import { GraphQLClient } from 'graphql-request';

/**
 * Provides simple way to request data from an GraphQL Endpoint
 */
export default class GraphQlBridge {
  constructor(endpoint, defaultOptions = {}, defaultHeaders = {}) {
    Object.assign(this, defaultOptions);

    this.client = new GraphQLClient(endpoint, {
      headers: defaultHeaders,
    });
  }
  async request(options = {}) {
    const defaultOptions = {
      query: null,
      method: 'query',
      nester: data => data,
      mapper: data => data,
    };

    // Merge the default options with the given options
    Object.assign(this, defaultOptions, options);

    if (!this.query) throw new Error('You must provide query');

    try {
      // Request data, run nester to get ressource if it is nested inside
      const data = this.nester(await this.client.request(this.query));

      // When the enpoints returns an array of objects:
      // run the provided mapper and filter against each of them
      if (Array.isArray(data)) {
        return data.map(this.mapper);
      } else {
        return this.mapper(data);
      }
    } catch (error) {
      return {};
    }
  }
}
