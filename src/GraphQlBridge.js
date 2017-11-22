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

    // Collect all options in this object to not "save" them per request
    const mergedOptions = {};

    // Merge the default options with the given options
    Object.assign(mergedOptions, defaultOptions, options);

    if (!mergedOptions.query) throw new Error('You must provide query');

    // Request data, run nester to get ressource if it is nested inside
    const data = mergedOptions.nester(
      await mergedOptions.client.request(mergedOptions.query)
    );

    // When the enpoints returns an array of objects:
    // run the provided mapper and filter against each of them
    if (Array.isArray(data)) {
      return data.map(mergedOptions.mapper);
    } else {
      return mergedOptions.mapper(data);
    }
  }
}
