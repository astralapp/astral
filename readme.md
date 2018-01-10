# Astral
> Organize your GitHub Stars with ease.

[![Join the chat at https://gitter.im/astralapp/astral](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/astralapp/astral?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/astralapp/astral.svg?branch=master)](https://travis-ci.org/astralapp/astral) [![ghit.me](https://ghit.me/badge.svg?repo=astralapp/astral)](https://ghit.me/repo/astralapp/astral) [![Support on Patreon](https://img.shields.io/badge/patreon-donate-yellow.svg)](https://www.patreon.com/syropian)

<a href="https://app.codesponsor.io/link/vSYg5p7VLntutsyxZzPVdCUo/astralapp/astral" rel="nofollow"><img src="https://app.codesponsor.io/embed/vSYg5p7VLntutsyxZzPVdCUo/astralapp/astral.svg" style="width: 888px; height: 68px;" alt="Sponsor" /></a>

---


### Improvements

- Improved Caching
- Improved UI/UX
- Built on Laravel 5.4
- Switched the front-end from AngularJS to VueJS


### Getting up and running

#### With Homestead

- Fork this repository, clone it, and `cd` into it
- Install the front-end dependencies: `yarn` or `npm install`
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

- Fire up the app! Open a browser at [http://astralapp.com/](http://astralapp.com/) and enjoy!

#### With Docker using Laradock

- Fork this repository, clone it recursively including submodules, and `cd` into `laradock` folder
- Execute Docker Compose: `docker-compose up -d nginx mysql redis`
- Run a terminal inside workspace container: `docker-compose exec workspace bash`
- Change to `laradock` user: `su laradock`
- Install the front-end dependencies: `npm install`
- Install the PHP dependencies: `composer install` and exit container
- Add the local development domain to your hosts file: `your_ip  astralapp.app`
- Create a new [OAuth Application](https://github.com/settings/developers), and grab the keys it gives you
- Copy the `.env.example` file and rename it to `.env`. Add your GitHub keys to it
- Run a terminal into your `workspace` container again, migrate the DB, and generate a new app key

	```
	$ php artisan migrate
	$ php artisan key:generate
	```

### Compiling JavaScript and SCSS Changes

Astral uses JS and SCSS that needs to be transpiled before use. There are various NPM tasks available to you to make this easy.

- When developing you often want to watch files for changes, and re-bundle automatically. You'll want to run either `npm run watch` or `npm run hot`. The `watch` command is a standard file watcher, and `hot` will give you hot module reloading.
- To get the bundle production ready, run `npm run production`. This will generate production-ready JS and CSS assets.
- Consult the `package.json` file for other NPM scripts you can use.

### Contributing

- [Get up and running](#getting-up-and-running)
- Create a new descriptively-named branch
- Commit your changes and push to your fork.
- Create a pull request with a clear, well written description of what the PR is all about. You should always run `npm run production` and commit the results before creating the PR.
- Party!!
