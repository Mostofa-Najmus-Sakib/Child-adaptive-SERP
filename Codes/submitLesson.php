<?php
/*
    @file Action page that contains functionality for sending a lesson submission email to a student's instructor
    @author Garrett Allen, Brody Downs, CAST Team at Boise State University
*/
session_start();
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require_once('./PHPMailer-master/src/PHPMailer.php');
require_once('./PHPMailer-master/src/Exception.php');

//Set variables
if (isset($_POST['email']) && isset($_POST['solutions']) && isset($_POST['filename'])) {
    try {
        $mail = new PHPMailer(true);
        $email = $_POST['email'];
        $solutions = $_POST['solutions'];
        $filename = $_POST['filename'];
        $binary_content = file_get_contents($solutions);

        $mail->isHTML(true);
        $mail->setFrom("no-reply@cast.boisestate.edu", "The CAST Team");
        $mail->addAddress($email);
        $mail->Subject = "Your student has completed a CAST online lesson";
        $mail->Body = "A PDF of the students answers is attached." .
                    "<p>The CAST Team</p>";
        $mail->addStringAttachment($binary_content, $filename, $encoding='base64', $type='application/pdf');
        $mail_sent = $mail->send(); // Comment out on local
        //echo json_encode($mail); // Comment out on server

        echo $mail_sent ? json_encode("Email Sent!") : json_encode($mail->ErrorInfo); // Comment out on local
    } catch (Exception $e) {
        echo json_encode($e->errorMessage());
    }
} else {
    echo json_encode("Send failed");
}

?>
