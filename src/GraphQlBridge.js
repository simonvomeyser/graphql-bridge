import { GraphQLClient } from 'graphql-request';

/**
 * Provides simple way to request data from an GraphQL Endpoint
 *
 * @param {String} endpoint The graphql endpoint, like "http://example.com/graphql"
 * @param {Object} defaultData What data to "save" in the class for later use, like project ids
 * @param {Object} defaultHeaders What headers to include in every request
 */
export default class GraphQlBridge {
  constructor(endpoint, defaultOptions = {}, defaultHeaders = {}) {
    Object.assign(this, defaultOptions);

    this.client = new GraphQLClient(endpoint, {
      headers: defaultHeaders,
    });
  }

  /**
   * Perform a graphql query
   *
   * @param {*} options Object containing the following keys
   *  query String: The enpoint to call an retrieve the data from
   *  nester Function: To get neseted data
   *  filter Function: To filter result if it is an array
   *  mapper Function: Taking in an object and returning object with transformed properties
   */
  async request(options = {}) {
    const defaultOptions = {
      query: null,
      nester: data => data,
      mapper: data => data,
      filter: () => true,
    };

    // Combine all options in this object
    const mergedOptions = {};

    // Merge the default options with the given options
    Object.assign(mergedOptions, defaultOptions, options);

    if (!mergedOptions.query) throw new Error('You must provide a query');

    // Request data, save the unfiltered data on the instance for later access
    this.unfilteredData = await this.client.request(mergedOptions.query);

    // Run nester to get ressource if it is nested inside
    const data = mergedOptions.nester(this.unfilteredData);

    // When the enpoints returns an array of objects:
    // run the provided mapper and filter against each of them
    if (Array.isArray(data)) {
      // Just chain array functions
      return data.filter(mergedOptions.filter).map(mergedOptions.mapper);
    } else {
      // Run mapper manually
      const mappedObject = mergedOptions.mapper(data);

      // Check if filter allows access to object
      if (mergedOptions.filter(mappedObject)) {
        return mappedObject;
      } else {
        return {};
      }
    }
  }
}
