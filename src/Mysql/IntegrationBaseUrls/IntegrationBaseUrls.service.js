import { integrationsNames } from "../../utils/constants";
import IntegrationBaseUrlsModel from "./IntegrationBaseUrls.model";

const urls = [
  {
    integration_name: integrationsNames.CROWDSTRIKE,
    base_url: "https://api.crowdstrike.com",
    base_url_slug: "US-1",
  },
  {
    integration_name: integrationsNames.CROWDSTRIKE,
    base_url: "https://api.us-2.crowdstrike.com",
    base_url_slug: "US-2",
  },
  {
    integration_name: integrationsNames.CROWDSTRIKE,
    base_url: "https://api.eu-1.crowdstrike.com",
    base_url_slug: "EU-1",
  },
  {
    integration_name: integrationsNames.CROWDSTRIKE,
    base_url: "https://api.laggar.gcw.crowdstrike.com",
    base_url_slug: "US-GOV-1",
  },
  {
    integration_name: integrationsNames.AUVIK,
    base_url: "https://auvikapi.us1.my.auvik.com/v1",
    base_url_slug: "US-1",
  },
  {
    integration_name: integrationsNames.AUVIK,
    base_url: "https://auvikapi.us2.my.auvik.com/v1",
    base_url_slug: "US-2",
  },
  {
    integration_name: integrationsNames.SENTINELONE,
    base_url: "https://usea1-pax8-exsp.sentinelone.net/web/api/v2.1",
    base_url_slug: "usea1-pax8-exsp",
  },
  {
    integration_name: integrationsNames.SENTINELONE,
    base_url: "https://usea1-011.sentinelone.net/web/api/v2.1",
    base_url_slug: "usea1-011",
  },
  {
    integration_name: integrationsNames.MALWAREBYTES,
    base_url: "https://api.malwarebytes.com/oneview",
    base_url_slug: "oneview",
  },
  {
    integration_name: integrationsNames.MICROSOFT,
    base_url: "https://graph.microsoft.com/v1.0",
    base_url_slug: "beta_url",
  },
  {
    integration_name: integrationsNames.MICROSOFT,
    base_url: "https://login.microsoftonline.com",
    base_url_slug: "Access_token_url",
  },
  {
    integration_name: integrationsNames.KNOWBE4,
    base_url: "https://us.api.knowbe4.com/v1",
    base_url_slug: "US",
  },
  {
    integration_name: integrationsNames.AUTOMOX,
    base_url: "https://console.automox.com/api",
    base_url_slug: "console",
  },
  {
    integration_name: integrationsNames.KNOWBE4,
    base_url: "https://eu.api.knowbe4.com/v1",
    base_url_slug: "europe",
  },
  {
    integration_name: integrationsNames.KNOWBE4,
    base_url: "https://ca.api.knowbe4.com/v1",
    base_url_slug: "canada",
  },
  {
    integration_name: integrationsNames.DRUVA,
    base_url: "https://apis-us0.druva.com",
    base_url_slug: "US-0",
  },
];
export const integrationUrlsSeeding = async () => {
  for await (const url of urls) {
    const urlInDB = await IntegrationBaseUrlsModel.findOne({
      where: {
        integration_name: url.integration_name,
        base_url: url.base_url,
      },
    });
    if (!urlInDB?.id) {
      IntegrationBaseUrlsModel.create(url);
    }
  }
};
