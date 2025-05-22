#
# Source code
#
FROM alpine/git as sources

RUN mkdir /code
RUN git clone https://github.com/astralapp/astral /code

#
# PHP Dependencies
#
FROM composer:1.10.5 as vendor

COPY --from=sources /code/app/ app/
COPY --from=sources /code/bootstrap/ bootstrap/
COPY --from=sources /code/config/ config/
COPY --from=sources /code/database/ database/
COPY --from=sources /code/public/ public/
COPY --from=sources /code/resources/ resources/
COPY --from=sources /code/routes/ routes/
COPY --from=sources /code/storage/ storage/
COPY --from=sources /code/tests/ tests/
COPY --from=sources /code/server.php server.php
COPY --from=sources /code/artisan artisan
COPY --from=sources /code/composer.json composer.json
COPY --from=sources /code/composer.lock composer.lock

RUN composer install

#
# Frontend
#
FROM node:14.1.0-alpine3.11 as frontend

RUN mkdir -p /app/public

COPY --from=sources /code/package.json /code/webpack.mix.js /code/tailwind.config.js /code/yarn.lock /app/
COPY --from=sources /code/resources/assets/ /app/resources/assets/

WORKDIR /app

RUN yarn
RUN yarn dev

#
# Application
#
FROM php:7.4.5-apache-buster

# Apache
# Enable rewrite module
RUN a2enmod rewrite

# Fix server's fully qualified domain name
ARG APACHE_SERVERNAME=localhost
RUN echo "ServerName" $APACHE_SERVERNAME >> /etc/apache2/apache2.conf

# MYSQL --------------------------------------------------------------
RUN docker-php-ext-install mysqli pdo pdo_mysql
# end MYSQL ----------------------------------------------------------

# PHP INI --------------------------------------------------------------------------------------------------------------
#ARG PHP_INI=php.ini
#COPY $PHP_INI /usr/local/etc/php/
# end PHP INI ----------------------------------------------------------------------------------------------------------

# APACHE CONF ----------------------------------------------------------------------------------------------------------
ENV APACHE_DOCUMENT_ROOT /var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
# end APACHE CONF ------------------------------------------------------------------------------------------------------

COPY --from=vendor /app/ /var/www/html/
COPY --from=frontend /app/public/js/ /var/www/html/public/js/
COPY --from=frontend /app/public/css/ /var/www/html/public/css/
COPY --from=frontend /app/mix-manifest.json /var/www/html/mix-manifest.json

RUN chown -R www-data:www-data /var/www/html
