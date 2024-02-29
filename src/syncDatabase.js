import syncDb from "./Mysql/dbsync";
import syncLogsTables from "./Mysql/Logs/logsDBsync";
import {rolesSeed} from "./Mysql/Roles/roles.seed";
import {globalRolesSeed} from "./Mysql/Roles/globalRole.seed";
import {companySeed} from "./Mysql/Companies/company.seed";
import {superAdminUserSeed} from "./Mysql/Users/user.seed";

const dbName = process.argv[2].replace("--", "");
const optionParameter = process.argv[3];
const options = {};

const syncDatabase = async () => {
  if (optionParameter === "--alter") {
    options.alter = true;
  } else if (optionParameter === "--force") {
    options.force = true;
  } else if (optionParameter) {
    console.log("invalid options provided, Expected alter or force");
    return false;
  }
  console.log(options);
  switch (dbName) {
    case `${process.env.SQL_DATABASE_NAME}`:

      // await superAdminUserSeed('99999999-9999-9999-9999-999999999999', '1', 'razakkhanafridi1995@gmail.com', '1', 'Raza');
      await syncDb(options);
      // await syncLogsTables(options);

      break;
    default:
      console.log(
        `Sorry, we don't have ${dbName} database in our application.`
      );
  }
  return true;
};
syncDatabase();
