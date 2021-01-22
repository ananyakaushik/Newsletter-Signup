// import required modules
const express = require("express");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const dotenv = require("dotenv");
dotenv.config(); // read environment variables

// Create the application
const app = express();
// Set the port variable to use Heroku's given port when necessary, and port 3000 when local
const PORT = process.env.PORT || 3000;

// Parse the request body
app.use(express.urlencoded({extended: true}));
// Serve static files from "public" folder
app.use(express.static("public"));

// Authenticate
mailchimp.setConfig({
    apiKey: process.env.MC_API_KEY,
    server: process.env.MC_SERVER
});

// Routing for GET request at path /
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/signup.html");
})

// Routing for POST request at path /
app.post("/", (req, res) => {
    const firstName = req.body.firstname;
    const lastName = req.body.lastname;
    const email = req.body.inputEmail;

    const listId = "97f40e660a";

    // Create an object with the users data
    const subscribingUser = {
        firstName: firstName,
        lastName: lastName,
        email: email
    };

    // Upload the data to the server
    async function run() {
        const response = await mailchimp.lists.addListMember(listId, {
            email_address: subscribingUser.email,
            status: "subscribed",
            merge_fields: {
                FNAME: subscribingUser.firstName,
                LNAME: subscribingUser.lastName
            }
        });

        // If action is successfully completed, send the success page and log the new subscriber's ID
        res.sendFile(__dirname + "/success.html");
        console.log(`Successfully added contact as an audience member. The contact's id is ${response.id}.`);
    }

    // Catch any potential errors. Send back the failure page as a response if there is an error.
    run().catch(e => {
        res.sendFile(__dirname + "/failure.html");
        // console.log(e.response.error);
    });
});

// Routing for POST request at path /failure
app.post("/failure", (req, res) => {
    res.redirect("/");
});

// Listen at port where server is running
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));