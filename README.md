# GraphQL Bridge

With the classes provided by this repository you can easily integrate multiple
REST and GraphQL endpoints in a uniform way.

This is especially useful when your application uses more than one API (for
example Twitter and GitHub at the same time). Since most GraphQL documentation
only describes how to wrap one single REST API I wrote this library to fix
inconsistencies in using different services.

# Usage

## Basics

The two classes provided serve as base to inherit from. For each API to use in
your application you should create sub class of the respective class of the
library. A integration for an REST API needs to inherit from
`GraphQLRestBridge`, a integration of an GraphQL API, you guessed it, from
`GraphQLBridge`.

A simple example for the integration of the Google Maps GeoCoding API to reverse
GeoCode an arbitrary address is shown below:

```js
import { GraphQlRestBridge } from 'graphql-bridge';

export default class GraphQLGeoCodingRestBridge extends GraphQlRestBridge {
  constructor() {
    super({ key: 'ABC123' });
  }
  async reverseGeocode(address) {
    const result = await super.request({
      endpoint: 'https://maps.googleapis.com/maps/api/geocode/json',
      data: {
        address,
      },
    });
    return result;
  }
}
```

Using the constructor you can provide data (and headers) that should be included
in every request.

```js
/*
 * Provides simple way to request data from an REST Endpoint
 *
 * @param {Object} defaultData What to include in every request
 * @param {Object} defaultHeaders What headers to include in every request
 */
 constructor(defaultData = {}, defaultHeaders = {}) {...}
```

It is important to note, that GraphQL subclasses will work in exactly the same
way, as shown below:

```js
export default class GraphQLGitHubBridge extends GraphQlBridge {
  constructor() {
    super(
      'https://api.github.com/graphql',
      {},
      { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    );
  }
  async getUser(name) {
    const result = await this.request({
      query: `
        query {
            user(login: "${name}") {
                email,
                name,
            }
        }
    `,
    });
    return result;
  }
}
```

As a small difference, the first argument in the constructor is the URL of the
API.

The actual usage of the library is illustrated in my repository
GraphQL-Bridge-Demo (https://github.com/simonvomeyser/graphql-bridge-demo) where
I integrated Twitter, GitHub and GoogleMaps.

## super.request

This is the only function provided by both classes of the library and is used to
make the actual request to the server. The possible arguments are as follows:

| Argument | RESTBridge | GraphQLBridge | Description                                                                         |
| -------- | ---------- | ------------- | ----------------------------------------------------------------------------------- |
| endpoint | ✅         | ❌            | The enpoint to call an retrieve the data from. String                               |
| method   | ✅         | ❌            | Wrapper around the axios library, get,post,patch,put,delete. get is default. String |
| data     | ✅         | ❌            | The data to include in the requests body. Object                                    |
| query    | ❌         | ✅            | The actual GraphQL query or mutation. String                                        |
| headers  | ✅         | ✅            | The headers to include in the requests. Object                                      |
| nester   | ✅         | ✅            | Nester function                                                                     |
| mapper   | ✅         | ✅            | Mapper function                                                                     |
| filter   | ✅         | ✅            | Filter function                                                                     |

### Nester

One of the three functions that can be passed to the `super.request()` function.
Use to extract nested data. An simple example is shown below:

```js
data => data.deep.nested.object.prop;
```

### Filter

Offers the possibility to implement authorization or simple rules under which
conditions data should be returned or not. Should return `true` or `false`. The
example makes finding PersonX impossible.

```js
user => {
  if (user.name === 'PersonX') return false;
  return true;
};
```

### Mapper

Maps data from the service to own data so it can be used with GraphQL types. The
example below shows mapping the returned data from the GoogleMaps API to an own
GraphQL Type.

```js
data => {
  data.addressName = data.formatted_address;
  data.lat = data.geometry.location.lat;
  data.lng = data.geometry.location.lng;
  return data;
};
```

## Inside of a Resolver

After preparing an integration as described the created classes can simply be
used inside of a Resolver to greatly simplify interacting with services. The
variable `GoogleGeoCodeIntegration` is an instance of the class we created
above.

```js
  geoCodedLocation: {
    type: GoogleGeoCodeType,
    resolve(parentValue) {
      return GoogleGeoCodeIntegration.reverseGeocode(parentValue.location);
    },
  },
```
