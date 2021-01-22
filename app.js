const express = require("express");
const https = require("https");
const mailchimp = require("@mailchimp/mailchimp_marketing");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mailchimp.setConfig({
    apiKey: "828bef19c8658c22a55f9c99f1a2781e-us7",
    server: "us7"
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/signup.html");
})

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

app.post("/failure", (req, res) => {
    res.redirect("/");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));