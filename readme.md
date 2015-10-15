## Astral v2

[![Join the chat at https://gitter.im/astralapp/astral](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/astralapp/astral?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This is the repository for Astral v2. It is currently still in early development. Currently looking for core contributors!

---


### Improvements

- Improved Caching
- Improved UI/UX
- Built on Laravel 5
- Switched the front-end from AngularJS to RiotJS


### Getting up and running

- Fork this repository, clone it, and `cd` into it
- Install the front-end dependancies: `npm install && bower install`
- Compile
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


### Contributing

- [Get up and running](#gettingupandrunning)
- Create a new descriptively named branch
- Commit your changes and push to your fork
- Create a pull request with a clear, well written description of what the PR is all about
- Party!!
