# Astral [![Build Status](https://travis-ci.org/astralapp/astral.svg?branch=v3)](https://travis-ci.org/astralapp/astral)

An open source application that allows you to organize your GitHub Stars with ease. Check it out at [https://astralapp.com](https://astralapp.com).

## Installation

### Prerequisites

* To run this project, you must have PHP 7 and Node.js installed.
* You should setup a host on your web server for your local domain. For this you could also configure Laravel Homestead or Valet.

### Step 1

Begin by cloning this repository to your machine, and installing all Composer & NPM dependencies.

```bash
git clone git@github.com:astralapp/astral.git
cd astral && composer install && npm install # or yarn
php artisan astral:install
npm run dev
```

### Step 2

Next, boot up a server to visit the app. If you're using a tool like Laravel Valet, the URL will likely default to `http://astral.test`. That's pretty much it!
