import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

// To read variables from .env file
dotenv.config();

// Token of mailtrap used for authentication and authorization
const TOKEN = process.env.MAILTRAP_TOKEN; 

// variable used to connect to the mailtrap server by creating an instance object of  MailtrapClient class and passing are secret token of mailtrap
export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

// Sender details of the mailtrap so that client's email account can categorise it as legitimate rather than spam
export const sender = {
  email: "hello@demomailtrap.com",
  name: "Rahul",
};


