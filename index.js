const axios = require("axios").default;
const { errorHandler } = require("./src/utils/errorHandler");

const options = {
  method: 'POST',
  url: 'https://nextgenapps.us.auth0.com/oauth/token',
  headers: {'content-type': 'application/x-www-form-urlencoded'},
  data: {
    grant_type: 'password',
    username: 'test@mailinator.com',
    password: 'P@ssword1',
    audience: 'https://nextgenapps.us.auth0.com/api/v2/',
    scope: 'read:sample',
    client_id: 'BvnKqszL20IGeA7RSVioPvNaxew34WgV',
    client_secret: 'KGBilpVnlbHBQFFsDEV2NredH5OSjQ2_gVECU1HG-HLBB7mkUc-iKEPAX_17HHb9'
  }
};

axios.request(options).then((response) => {
}).catch((error) => {
  errorHandler(error);
});