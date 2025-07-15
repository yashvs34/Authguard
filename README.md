## INTRODUCTION
User authentication system where user can signin and signup and use their token to authenticate for further requests

## TECH STACK
**Backend**
- Node.js
- Express.js
- Zod
- JWT

**Database**
- Mongoose
- MongoDB

**Deployment**
- Render

## LOCAL INSTALLATION & SETUP
> ⚠️ Make sure to set up the `.env` file.  
> .env file must contain **MONGODB_URL**, **JWT_SECRET** and **PORT**  

```bash
npm install       # Install required dependencies
node index.js     # Start backend server on specified PORT in .env file (https://localhost:PORT)
```

# DESCRIPTION
* Use the above endpoint for sending HTTP requests and it will respond back accordingly
* Users can signup and when they do so their data will be saved in the database
* Users can then signin after which they will get a token as reply from server
* Then that token can be used to authenticate further requests (if any, not in scope of this project)
