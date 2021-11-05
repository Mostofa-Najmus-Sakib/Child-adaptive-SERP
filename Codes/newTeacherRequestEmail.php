<?php
/*
    @file Action page that contains functionality for sending a 'getting started' email for Teachers Signing up with CAST
    @author Brody Downs, Mikey Krentz, CAST Team at Boise State University
*/
session_start();
//Set variables
$receivingEmail = "brodydowns@u.boisestate.edu"; // Change Email on deploy
$subject = "Getting Started With CAST";
$pdfTitle = "Informed Consent - Internet Searches in Schools.pdf"; // Change location to server on deploy

$message = "<p>Hello,</p>" .
            "<p>Thank you so much for your interest in participating in our research. The goal of our research is to develop a search engine that will serve the information needs of children, and your participation in this will help us develop and improve this tool.</p>" .
            "<p>Attached, please find the informed consent document that details exactly what participating in this research will entail. Please read it over and let us know if you have any questions or concerns (<a href='mailto:cast-group@boisestate.edu' target='_blank'>cast-group@boisestate.edu</a>).</p>" .
            "<p>We'd love to get you started as soon as possible. To do this, we need three things from you:</p>" .
            "<ol>" .
            "   <li>Please sign the <a href='http://localhost/cast-simple/assets/$pdfTitle'>informed consent</a> and return a copy to us.</li>" .
            "   <li>We need permission from your principal or another school administrator. This does not have to be anything formal -- you can send him or her an email with the link to the project description (i.e., <a href='https://cast.boisestate.edu/about/cast_flyer.pdf' target='_blank'>https://cast.boisestate.edu/about/cast_flyer.pdf</a>) asking permission to participate, and just forward the reply to us. If they have any questions/concerns, please do not hesitate to provide them with our contact information.</li>" .
            "   <li>Please provide and/or verify the following information: <ul>" .
            "       <li>Name:</li>" .
            "       <li>School:</li>" .
            "       <li>District:</li>" .
            "       <li>Grade Level(s):</li>" .
            "       <li>Subject(s):</li>" .
            "       <li>Number of Students in Class:</li>" .
            "       <li>School email (for verification purposes):</li>" .
            "       <li>Prefered email (for communication and sending digital Amazon Gift cards):</li>" .
            "   </ul></li>" .
            "</ol>" .
            "<p>Once we have all your informed consent, information, and principal's permission, we'll be able to get you started!</p>" .
            "<p>In the meaintime, feel free to try out our tool: <a href='https://cast.boisestate.edu' target='_blank'>Search Tool</a>.</p>" .
            "<p>Please let us know if you have any questions, and wde look forward to working with you!</p>" .
            "<p>Sincerely,</p>" .
            "<p>The CAST Team</p>";
// To send HTML mail, the Content-type header must be set
$headers = "MIME-Version: 1.0\n";
$headers .= "Content-type: text/html\n";
$headers .= "From: no-reply@cast.boisestate.edu\n";
mail($receivingEmail,$subject,$message,$headers); //comment this out on local
$response['msg'] = $message; //comment this out on live
$response['email'] = "Email Sent!";
// echo json_encode($response);
echo ($message); // // comment out on live

?>
