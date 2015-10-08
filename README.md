# Astral
Organize Your GitHub Stars With Ease

**Please Note:** I've decided to rewrite most of the app from scratch. This is a pretty big undertaking, but there are some core back-end things I want to add, and I'd like to rewrite the front-end in RiotJS.

## v1 Stack

**Backend**: Nginx, PHP (Laravel), and MySQL
**Front End**: Angular (1.3), Sass (SCSS) with Bourbon, CoffeeScript, and Gulp.

## Todo

These are the things that need to happen in order of contribution importance.

- ~~**Complete upgrade to Laravel 5**: There's still lots of broken and old code that needs to be updated to work with Laravel 5. Particularly the controllers and models.~~ It is now getting rewritten from the ground up.
- **Test, tests, tests**: There are currently no tests anywhere, because I'm a bad person. Once the upgrade to L5 is complete, please feel free to start contributing as many tests as you can on both the backend, and on the Angular side. Testing methods can be discussed in a GitHub issue.
- **Performance**: Find all that crappy slow code I wrote, and make it faster! This can be on a the front or back end.
- **Better programming patterns/practices**: Should I be using something like the Repository pattern? Is the internal API poorly organized? Probably. Help me make it better!
- **New Features**: _Only_ after all of the above is completed should you start hacking on new features. No feature PR's will be accepted otherwise.
