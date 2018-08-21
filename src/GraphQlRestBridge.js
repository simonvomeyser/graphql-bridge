import axios from 'axios';

/**
 * Provides simple way to request data from an REST Endpoint
 *
 * @param {Object} defaultData What to include in every request
 * @param {Object} defaultHeaders What headers to include in every request
 */
export default class GraphQlRestBridge {
  constructor(defaultData = {}, defaultHeaders = {}) {
    this.defaultData = defaultData;
    this.defaultHeaders = defaultHeaders;
  }

  /**
   * Request a REST ressource
   *
   * @param {*} options Object containing the following keys
   *  endpoint String: The enpoint to call an retrieve the data from
   *  method String: Wrapper around the axios library, get|post|patch|put|delete
   *  data Object: The data to include in the requests body. Will be transformed to query params when using method:'get'
   *  headers Object: The headers to include in the requests.
   *  nester Function: To get neseted data
   *  filter Function: To filter result if it is an array
   *  mapper Function: Taking in an object and returning object with transformed properties
   */
  async request(options = {}) {
    const defaultOptions = {
      endpoint: null,
      method: 'get',
      data: {},
      headers: {},
      nester: data => data,
      mapper: data => data,
      filter: () => true,
    };

    // Combine all options in this object
    const mergedOptions = {};

    // Merge the default options with the given options
    Object.assign(mergedOptions, defaultOptions, options);
    // Merge in the default data/headers from constructor to be included in request
    Object.assign(mergedOptions.data, this.defaultData);
    Object.assign(mergedOptions.headers, this.defaultHeaders);

    // Validation
    if (!mergedOptions.endpoint)
      throw new Error('You must provide an endpoint');

    // Bypass axios specific behaviour, send data as query params in 'get' requests
    if (mergedOptions.method == 'get')
      mergedOptions.data = { params: mergedOptions.data };

    // Create Axios instance to include headers
    var axiosInstance = axios.create({
      headers: mergedOptions.headers,
    });

    // Perform the actual requst, map axios data props
    const result = await axiosInstance[mergedOptions.method](
      mergedOptions.endpoint,
      mergedOptions.data
    );

    // Save the unfiltered data on the instance for later access
    this.unfilteredData = result.data;

    const data = mergedOptions.nester(this.unfilteredData);

    // When the enpoints returns an array of objects:
    // run the provided mapper and filter against each of them
    if (Array.isArray(data)) {
      // Just chain array functions
      return data.filter(mergedOptions.filter).map(mergedOptions.mapper);
    } else {
      // Check if filter allows access to object
      const mappedObject = mergedOptions.mapper(data);

      if (mergedOptions.filter(mappedObject)) {
        return mappedObject;
      } else {
        return {};
      }
    }
  }
}
