const { writeFile } = require("fs");

const environment = {
  production: `${process.env.PRODUCTION ? process.env.PRODUCTION : "false"}`,
  fyle_app_url: `${process.env.FYLE_APP_URL ? process.env.FYLE_APP_URL : ''}`,
  fyle_url: `${process.env.FYLE_URL ? process.env.FYLE_URL : ''}`,
  fyle_client_id: `${process.env.FYLE_CLIENT_ID ? process.env.FYLE_CLIENT_ID : ''}`,
  callback_uri: `${process.env.CALLBACK_URI ? process.env.CALLBACK_URI : ''}`,
  api_url: `${process.env.API_URL ? process.env.API_URL : ''}`,
  app_url: `${process.env.APP_URL ? process.env.APP_URL : ''}`,
  sentry_dsn: `${process.env.SENTRY_DSN ? process.env.SENTRY_DSN : ''}`,
  release: `${process.env.RELEASE ? process.env.RELEASE : ''}`,
  hotjar_id: `${process.env.HOTJAR_ID ? process.env.HOTJAR_ID : ''}`,
};

const targetPath = './src/environments/environment.json';
writeFile(targetPath, JSON.stringify(environment), 'utf8', (err) => {
  if (err) {
    return console.error(err);
  }
});
