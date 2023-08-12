# Blog-API Odin project curriculum

### Project description:
In this project I created a RESTful api that allows an authorized user to perform CRUD operations on a database for blog posts.
Anyone other than the admin can view public posts and create comments on them. The admin also has the ability to delete these comments.

### tool kit description:
The packages I used during this project include:
- express generator to create the boilerplate project directory.
- json web tokens to authenticate the admin user's access on every protected operation route.
- mongoose to access the mongo db database.
- curl command to test each route.