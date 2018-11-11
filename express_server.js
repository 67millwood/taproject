var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

// allows for simple use of data
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// cookie parser makes returning cookies easier
// var cookieParser = require('cookie-parser')
// app.use(cookieParser())
var cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ['francehaswon'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


const bcrypt = require('bcrypt');
// app.use(bcrypt)

// strange proprietary way that express asks for a view engine.  EJS in this case.
app.set("view engine", "ejs");

// creates the folder for CSS to be referenced
app.use(express.static(__dirname + '/public'));

        // original data
        var urlDatabase = {
          "b2xVn2": {
            link: "http://www.lighthouselabs.ca",
            createdBy: "master",
          },
          "9sm5xK": {
            link: "http://www.google.com",
            createdBy: "master",
          },
          "reDD8v2": {
            link: "http://www.espn.com",
            createdBy: "master",
          }
        };

        // user table
        const users = {
          "testuser": {
            theid: "testuser",
            email: "kmcspurren@gmail.com",
            password: "aaa"
          }
        }
//homepage
app.get("/", (req,res) => {
  res.redirect("urls/")
});

// delete a cookie & logout
app.post("/logout", (req, res) => {
  delete req.session.userID;
  res.redirect("/urls")
});

// Index of all URLs
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    usersDB: users,
    userCookie: req.session.userID
    };
  res.render("urls_index", templateVars);
});

// creating a new URL...this shows the page...
app.get("/urls/new", (req, res) => {
  let templateVars = {
    usersDB: users,
    userCookie: req.session.userID
  }
  res.render("urls_new", templateVars);
});

// creating a new URL....posts the user input
app.post("/urls", (req, res) => {
  let urlKey = generateRandomString();
  urlDatabase[urlKey] = {
    link: req.body.longURL,
    createdBy: req.session.userID
  };
  let shortURL = urlKey;
  res.redirect("/urls");
});

// a redirect page to the ACTUAL URL (external site)
app.get("/u/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL.link);
});

// deleting a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log('hello');
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
})

// editing a URL
app.post("/urls/:shortURL/edit", (req, res) => {
  console.log('editing');
  let editURL = urlDatabase[req.params.shortURL];
  editURL.link = req.body.longURL;
  res.redirect("/urls")
})

// unique pages for each of the URLs
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    shortURL: req.params.id,
    usersDB: users,
    userCookie: req.session.userID
  };
  res.render("urls_show", templateVars);
});

// USER login...this shows the page...
app.get("/login", (req, res) => {
  let templateVars = {
    usersDB: users,
    userCookie: req.session.userID
  }
  res.render("loginpage", templateVars);
});

// USER login....posts this information....
app.post("/login", (req, res) => {
  console.log(req.body.email);
  for (match in users) {
    if (users[match].email == req.body.email && bcrypt.compareSync(req.body.password, users[match].password) === true) {
      console.log("great, you're logged in");
      // let userID = generateRandomString();
      req.session.userID = users[match].theid;

      }
    else {
      console.log("you don't exist");
    }
  }
  res.redirect("/urls");
});

// creating a new USER...this shows the page...
app.get("/register", (req, res) => {
  let templateVars = {
    usersDB: users,
    userCookie: req.session.userID
  }
  res.render("registration", templateVars);
});

// creating a new USER....posts the user to the DB
app.post("/register", (req, res) => {
  console.log(req.body.email + " " + req.body.password);
  for (match in users) {
    if (users[match].email == req.body.email) {
      res.status(400).send('Email already exists');
      return
      }
    };

  if(!req.body.email || !req.body.password) {
    res.status(400).send('Email or Pwd missing');
  }
  else {
  // hash the pwd
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // create the user and put them in the database
  let userID = generateRandomString();
  users[userID] = {
    theid: userID,
    email: req.body.email,
    password: hashedPassword
  };
  console.log(users);
  req.session.userID = userID;

  res.redirect("/urls");
  }
});

// look for the server on PORT (which is set to 8080 on line 3)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// random generator to make shortURL
function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;

}



