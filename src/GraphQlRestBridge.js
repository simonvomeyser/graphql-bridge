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
   * Request a ressource
   *
   * @todo error handling
   * @param {*} options Object containing the following keys
   *  endpoint String: The enpoint to call an retrieve the data from
   *  method String: Wrapper around the axios library, get|post|patch|put|delete
   *  data Object: The data to include in the requests body. Will be transformed to query params when using method:'get'
   *  headers Object: The headers to include in the requests.
   *  filter Function: To filter result if it is an array
   *  mapper Function: Taking in an object and returning object with transformed properties
   */
  async request(options = {}) {
    const defaultOptions = {
      endpoint: null,
      method: 'get',
      data: {},
      headers: {},
      filter: () => true,
      mapper: data => data,
    };

    // Merge the default options with the given options
    Object.assign(this, defaultOptions, options);

    // Merge in the default data/headers from constructor to be included in request
    Object.assign(this.data, this.defaultData);
    Object.assign(this.headers, this.defaultHeaders);

    // Validation
    if (!this.endpoint) throw new Error('You must provide an endpoint');

    // Bypass axios specific behaviour, send data as query params in 'get' requests
    if (this.method == 'get') this.data = { params: this.data };

    // Create Axios instance to include headers
    var axiosInstance = axios.create({
      headers: this.headers,
    });

    // Perform the actual request, map axios data props
    try {
      const result = await axiosInstance[this.method](this.endpoint, this.data);
      const data = result.data;

      // When the enpoints returns an array of objects:
      // run the provided mapper and filter against each of them
      if (Array.isArray(data)) {
        return data.filter(this.filter).map(this.mapper);
      } else {
        return this.mapper(data);
      }
    } catch (error) {
      return {};
    }
  }
}
