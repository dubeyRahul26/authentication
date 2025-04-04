// import statements
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

// verification email handler
export const sendVerificationEmail = async (email, verificationToken) => {
  // Creating a recipient array of email's to which we want to send the mail to.
  const recipient = [{ email }];

  // Since its an API call we are putting the code in try catch so that are app wont crash
  try {
    // Sending a request to mail trap to send an email to the recipient with the following parameters
    const response = await mailtrapClient.send({
      from: sender, // Info of the sender
      to: recipient, // Email of the recipient
      subject: "Verify your email", // Subject of the email
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ), // For a good representation of the verification
      category: "Email Verification", // For easy categorization
    });
    // for development purpose : to see that email is sent successfully in the console
    console.log("Email sent successfully", response);
  } catch (error) {
    // Handling the error and also logging it in the console
    console.error(`Error sending verification`, error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

// Welcome email handler
export const sendWelcomeEmail = async (email, name) => {
// recipient array of objects containing recepients email address
  const recipient = [{ email }];

// For calling the mailtrap function to send welcome email
  try {
    // function to send welcome email using mailtrap
    const response = await mailtrapClient.send({
      from: sender, // sender
      to: recipient, // recipient
      template_uuid: "6442df8f-c16d-4c81-86d5-360cdb80549d", // template uuid created on mailtrap 
      template_variables: { // variables that would be replaced in the template created o mailtrap (bascially repalces the placeholder )
        company_info_name: "Phoenix",
        name: name,
      },
    });
    // To check whether email was sent or not (for developing purposes)
    console.log("Welcome email sent successfully", response);
  // hanling error's while sending email
  } catch (error) {
    console.error(`Error sending email: ${error}`);
    throw new Error(`Error sending email: ${error}`);
  }
};

// Sending password reset email using mailtrap
export const sendPasswordResetEmail = async (email, resetURL) => {

// recipient array of objects containing recepients email address
  const recipient = [{ email }];

  // For calling the mailtrap function to send welcome email
  try {
    const response = await mailtrapClient.send({
      from: sender, // Info of the sender
      to: recipient, // Email of the recipient
      subject: "reset password", // Subject of the email
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Reset Password", // For easy categorization
    });
    // To check whether email was sent or not (for developing purposes)
    console.log("Email sent successfully", response);
    // hanling error's while sending email
  } catch (error) {
    console.error(`Error sending reset email : `, error);
    throw new Error(`Error sending reset email: ${error}`);
  }
};

// Sending successful reset password email
export const sendSuccessEmail = async (email) => {
  // recipient array of objects containing recepients email address
  const recipient = [{ email }];

  // For calling the mailtrap function to send welcome email
  try {
    const response = await mailtrapClient.send({
      from: sender, // sender email address
      to: recipient, // recipients array of objects containing email address
      subject: "Password Reset Successful", // subject of the email
      html: PASSWORD_RESET_SUCCESS_TEMPLATE, // HTML template for the password reset
      category: "Password Reset", // For easy categorization
    });
    // handling error
  } catch (error) {
    console.error(`Error sending reset password success email: ${error}`);
    throw new Error(`Error sending  reset password success email: ${error}`);
  }
};
