## Astral v2

[![Join the chat at https://gitter.im/astralapp/astral](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/astralapp/astral?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/astralapp/astral.svg?branch=riotjs)](https://travis-ci.org/astralapp/astral)

This is the repository for Astral v2. Currently looking for core contributors!

---


### Improvements

- Improved Caching
- Improved UI/UX
- Built on Laravel 5.3
- Switched the front-end from AngularJS to VueJS


### Getting up and running

#### With Homestead

- Fork this repository, clone it, and `cd` into it
- Install the front-end dependencies: `yarn`
- Install the PHP dependenices: `composer install`
- [Install Homestead](http://laravel.com/docs/homestead#installation-and-setup)
- Configure Homestead: `homestead edit`

	```
	[...]

	folders:
	    - map: ~/<PATH TO REPO>
	      to: /home/vagrant/astral

	sites:
	    - map: astralapp.app
	      to: /home/vagrant/astral/public

	databases:
	    - astral

	 [...]
	```
- Add the local development domain to your hosts file: `192.168.10.10  astralapp.app`
- Create a new [GitHub personal access token](https://github.com/settings/tokens), and grab the keys it gives you
- Copy the `.env.example` file and rename it to `.env`. Add your GitHub keys to it
- SSH into your Homestead app, migrate the DB, and generate a new app key

	```
	$ homestead ssh
	$ cd astral
	$ php artisan migrate
	$ php artisan key:generate
	```

- Fire up the app! Open a browser at [http://astralapp.app/](http://astralapp.app/) and bask in its glory!

#### With Docker using Laradock

- Fork this repository, clone it recursively including submodules, and `cd` into `laradock` folder 
- Execute Docker Compose: `docker-compose up -d nginx mysql redis`
- Run a terminal inside workspace container: `docker-compose exec workspace bash`
- Change to `laradock` user: `su laradock`
- Install the front-end dependencies: `npm install`
- Install the PHP dependenices: `composer install` and exit container
- Install the PHP dependencies: `composer install` and exit container
- Add the local development domain to your hosts file: `your_ip  astralapp.app`
- Create a new [OAuth Application](https://github.com/settings/developers), and grab the keys it gives you
- Copy the `.env.example` file and rename it to `.env`. Add your GitHub keys to it
- Run a terminal into your `workspace` container again, migrate the DB, and generate a new app key

	```
	$ php artisan migrate
	$ php artisan key:generate
	```

- Fire up the app! Open a browser at [http://astralapp.app/](http://astralapp.app/) and bask in its glory!


### Compiling JavaScript and SCSS Changes

Astral uses JS and SCSS that needs to be transpiled before use. There are various NPM tasks available to you to make this easy.

- When developing you often want to watch files for changes, and re-bundle automatically. You'll want to run either `npm run watch-build` or `gulp watch` (both do the same thing).
- To get the bundle production ready, run `npm run build-prod`. This will clean out the build folder, and then generate the new production-ready JS and CSS assets.
- Consult the `package.json` file for other NPM scripts you can use.

### Contributing

- [Get up and running](#getting-up-and-running)
- Create a new descriptively-named branch
- Commit your changes and push to your fork.
- Create a pull request with a clear, well written description of what the PR is all about. You should always run `npm run build-prod` and commit the results before creating the PR.
- Party!!
