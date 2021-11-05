<?php

    /*
    @file Action page that contains functionality for sending a reset password email to a teacher
    @author Brody Downs, Tyler French, CAST Team at Boise State University
    */

    session_start();
    require_once('../dbadapter.php');
    $adapter = new dbadapter();
    $adapter->construct();

    //Set variables
    $teacher_name = $_SESSION['teacher_name'];
    $teacher_email = $adapter->getTeacherEmail($teacher_name);

    //Check if token already exists for email
    if($adapter->checkForToken($teacher_email)) {
        $response['email'] = "Email already sent. Try again later.";
        echo json_encode($response);
        return;
    }

    //Create token
    $token = md5(uniqid($teacher_name, true));
    $adapter->insertEmailToken($teacher_email, $token);
    $url = $_SERVER['SERVER_NAME'] . "/cast-simple/reset/?token=" . $token;

    //Send Email
    $to = $teacher_email;
    $subject = "CAST - Reset Password";
    $txt = "Click the following link to reset your password: " . $url
        . "\nThis link will expires in 10 minutes.";
    $headers = "From: no-reply@cast.boisestate.edu";

    mail($to,$subject,$txt,$headers); //comment this out on local
    //$response['txt'] = $txt;        //comment this out on live
    $response['email'] = "Email Sent!";
    echo json_encode($response);
?>