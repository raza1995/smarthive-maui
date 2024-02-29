require("dotenv").config();
const vault = require("node-vault")({
  apiVersion: "v1",
  endpoint: process.env.VAULT_ADDR,
});

const rootPath = process.env.VAULT_ROOT || "";
const roleId = process.env.VAULT_ROLE_ID;

const secretId = process.env.VAULT_SECRET_ID;

export default {
  async storeSecret(path, data) {
    const result = await vault.approleLogin({
      role_id: roleId,
      secret_id: secretId,
    });
    return new Promise((resolve, reject) => {
      vault.token = result.auth.client_token;
      vault
        .write(rootPath + path, { data })
        .then((resp) =>{ resolve(resp)})
        .catch((err) => reject(err.message));
    });
  },

  async getSecret(path) {
    const result = await vault.approleLogin({
      role_id: roleId,
      secret_id: secretId,
    });
    return new Promise((resolve, reject) => {
      vault.token = result.auth.client_token;
      vault
        .read(rootPath+path)
        .then((data) =>{ resolve(data)})
        .catch((err) =>{console.log(err.response); reject(err.message)});
    });
  },
  async deleteSecret(path) {
    const result = await vault.approleLogin({
      role_id: roleId,
      secret_id: secretId,
    });
    return new Promise((resolve, reject) => {
      vault.token = result.auth.client_token;
      vault
        .revoke(rootPath+path)
        .then((data) =>{ resolve(data)})
        .catch((err) =>{console.log(err.response); reject(err.message)});
    });
  },
};

// Write Secerts
// vault.write('secret/data/mysql/webapp', {data : {
//   host: 'localhost',
//   username: 'root',
//   password: 'password',
//   database: 'smarthive',
// }}).then(res => console.log(res))
// .catch(err => errorHandler(err))

// vault.read("secret/data/mysql/webapp")
//     .then(data => {
//         const databaseName = data.data.db_name;
//         const username = data.data.username;
//         const password = data.data.password;
//         console.log(data);
//     })
// .catch(err => errorHandler(err))
