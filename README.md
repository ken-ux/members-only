# members-only

Members Only is a web app that allows logged-in users to write posts to a "members only" feed. Users who are not logged in can view the feed but authors and post dates will be anonymized.

Although any user can sign-up to post on the feed, they are not considered an "official member" if they don't know the secret password when signing up! Being an official member doesn't grant anything special, just the satisfaction of having that status in your profile settings. ☺

Users can also be granted admin status if they enter the admin password in their profile settings. Admins can delete posts from the feed.

Live version of the app can be found here: [https://members-only-production-4f8b.up.railway.app/](https://members-only-production-4f8b.up.railway.app/)

## Built With

- Express.js and MongoDB for the backend.
- Pug (Jade) as its templating engine for the front end.
- Tailwind CSS for styling.
- Passport.js for handling user authentication.

## Database Schema

![database schema](/database_schema.svg)

## Lessons Learned

- Hashing passwords with `bcrypt.js` to strengthen password security on user creation.
- Authenticating users with the `Passport.js`. Passport.js has several types of authentication methods that can be used. I used the LocalStrategy, which simply checks for a valid username and password.
- Storing sessions for persistent data, allowing users to stay logged in when they return to the web app.
- Creating an `express-validator` custom validator for form submissions. My custom validator checks if a username is already in the database when signing up for an account.
- One issue I ran into early on was an indefinite loading state after trying to log a user in.
  - After testing and researching, I realized that I never called `next()` in the middleware for validating the login form fields.
  - This meant my app never moved on to the authentication middleware that followed field validation.
  - After this, I was extra mindful of how data is transformed, passed on, and returned between middleware.
- Overriding the default behavior of the `Passport.js` `authenticate()` method so I can render the login page again with an error message if user details are incorrect.
- Conditionally rendering content based on if the user is signed in, as well as whether the user has membership or admin status.
- Writing a shorthand npm script for formatting Pug files with prettier.
  - Likewise, learning how to write scripts that can run in parallel in Node.js so I can simultaneously run the server and rebuild Tailwind CSS files whenever style changes were detected.
- Adding base and component styles to Tailwind CSS to set default styles across the app, such as anchor link hover behavior or button styles.
- Automatically logging in the user after sign-up using the `Passport.js`'s built-in `req.login()` method.

## Credits

Background was provided by [Hero Patterns](https://heropatterns.com/).
