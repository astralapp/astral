# docker and docker-compose

## build

### build standalone docker image
`docker build -t astral:latest .`

### build with docker-compose
`docker-compose build`

### push to docker hub
`docker login -u <username>`

`docker tag astral:latest <username>/astral:latest`

`docker push <username>/astral`


## run  

### config file

copy the `.env.template` file to `.env` and change the values

### run (standalone)
`docker run -it --rm -p 8080:80 astral:latest`

### run (docker-compose)
`docker-compose up -d`

### first run
- generate application key

`docker-compose exec app php artisan key:generate`

- create/migrate database

`docker-compose exec app php artisan migrate`




## inspirations for docker multi-stage builds of laravel apps

https://laravel-news.com/multi-stage-docker-builds-for-laravel

https://github.com/glimberger/docker-php
