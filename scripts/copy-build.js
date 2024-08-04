/**
 *  Copies the built script .js to Firebot's scripts folder
 */
const fs = require("fs").promises;
const path = require("path");

const getFirebotScriptsFolderPath = () => {
  // determine os app data folder
  let appDataFolderPath;
  if (process.platform === "win32") {
    appDataFolderPath = process.env.APPDATA;
  } else if (process.platform === "darwin") {
    appDataFolderPath = path.join(
      process.env.HOME,
      "/Library/Application Support"
    );
  } else if (process.platform === "linux") {
    appDataFolderPath = path.join(
      process.env.HOME,
      "/.config"
    );
  } else {
    throw new Error("Unsupported OS!");
  }

  const firebotDataFolderPath = path.join(appDataFolderPath, "/Firebot/v5/");
  const firebotGlobalSettings = require(path.join(
    firebotDataFolderPath,
    "global-settings.json"
  ));

  if (
    firebotGlobalSettings == null ||
    firebotGlobalSettings.profiles == null ||
    firebotGlobalSettings.profiles.loggedInProfile == null
  ) {
    throw new Error("Unable to determine active profile");
  }

  const activeProfile = firebotGlobalSettings.profiles.loggedInProfile;

  const scriptsFolderPath = path.join(
    firebotDataFolderPath,
    `/profiles/${activeProfile}/scripts/`
  );
  return scriptsFolderPath;
};

const main = async () => {
  const firebotScriptsFolderPath = getFirebotScriptsFolderPath();

  await fs.cp('./dist/', firebotScriptsFolderPath, {
    recursive: true,
  });

  console.log(`Successfully copied to Firebot scripts folder.`);
};

main();
