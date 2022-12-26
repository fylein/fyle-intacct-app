# fyle-intacct-app
Frontend Repository for Fyle &lt;> Sage Intacct Integration

### Setup

## Local development setup

### Setup - 1 (Recommended)
Follow instructions mentioned in [Integrations Central](https://github.com/fylein/fyle-integrations-central/)

### Setup - 2
* Install dependencies

    ```bash
    npm install
    ```

* Copy `environment.json` from integrations-central/ and add it to `src/environments`

    ```bash
    cp ../fyle-integrations-central/app-secrets/intacct-app/environment.json src/environments/environment.json
    ```

* Run app

    ```bash
    npm start
    ```
