# fyle-intacct-app
Frontend Repository for Fyle &lt;> Sage Intacct Integration

### Setup

* Download and install Docker desktop for Mac from [here.](https://www.docker.com/products/docker-desktop)

* If you're using a linux machine, please download docker according to the distrubution you're on.

* Navigate into the root folder 

* Rename docker-compose.yml.template to docker-compose.yml

    ```
    $ cp docker-compose.yml.template docker-compose.yml
    ```
  
* Setup environment variables in docker_compose.yml

    ```yaml
    environment: 
      production: "False"
      FYLE_URL: 
      FYLE_CLIENT_ID: 
      CALLBACK_URI: 
      API_URL: http://localhost:8000/api
      APP_URL: http://localhost:4200
   ```
  
* Build docker images

    ```
    docker-compose build 
    ```

* Run docker containers

    ```
    docker-compose up -d app
    ```

* To tail the logs a service you can do
    
    ```
    docker-compose logs -f app
    ```

* To stop the containers

    ```
    docker-compose stop app
    ```

* To restart any containers -

    ```
    docker-compose restart app
    ```

* To run bash inside any container for purpose of debugging or for creating new components,services etc

    ```
    docker-compose exec app /bin/bash
    ```
