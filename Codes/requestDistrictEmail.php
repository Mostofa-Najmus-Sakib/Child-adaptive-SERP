<?php
/*
    @file Action page that contains functionality for sending a 'getting started' email for Teachers Signing up with CAST
    @author Brody Downs, Mikey Krentz, CAST Team at Boise State University
*/
session_start();
//Set variables
if (isset($_GET['email'])) {
    $email = $_GET['email'];
} else {
    $email = "mikeykrentz@u.boisestate.edu";
}
//$receivingEmail = "mikeykrentz@u.boisestate.edu"; // Change Email on deploy
$subject = "CAST - Getting Started";
$pdfTitle = "Informed Consent - Internet Searches in Schools.pdf"; // Change location to server on deploy

$message = "<p>Hello, </p>" .
            "<p>Thank you so much for your interest in participating in our research. The goal of our research is to develop a search engine that will serve the information needs of children, and your participation in this will help us develop and improve this tool.</p>" .
            "<p>We'd love to get you started as soon as possible. To do this, we will need permission from your principal or another school administrator.</p>" .
            "<p>This does not have to be anything formal -- you can send him or her an email with the link to the project description (i.e., <a href='https://cast.boisestate.edu/about/cast_flyer.pdf' target='_blank'>https://cast.boisestate.edu/about/cast_flyer.pdf</a>) asking permission to participate, and just forward the reply to us. If they have any questions/concerns, please do not hesitate to provide them with our contact information.</p>" .
            "<p>If you have any questions about this process, we are always glad to help and can be reached at <a href='mailto:cast-group@boisestate.edu' target='_blank'>cast-group@boisestate.edu</a>!</p>".
            "<p>We look forward to working with you!</p>" .
            "<p>Sincerely,</p>" .
            "<p>The CAST Team</p>";
// To send HTML mail, the Content-type header must be set
$headers = "MIME-Version: 1.0\n";
$headers .= "Content-type: text/html\n";
$headers .= "From: no-reply@cast.boisestate.edu\n";
mail($email,$subject,$message,$headers); //comment this out on local
//$response['msg'] = $message; //comment this out on live
$response['email'] = "Email Sent!";
// echo json_encode($response);
//echo ($message); // // comment out on live

?>
