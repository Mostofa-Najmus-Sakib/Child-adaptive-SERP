<?php

    /*
    @file Action page that contains functionality for setting up a Teacher Portal Account
    @author Brody Downs, Mikey Krentz, CAST Team at Boise State University
    */

    session_start();
    // BEGIN COMMENT OUT FOR PROD
    require_once ('../dbadapter.php');
    $adapter = new dbadapter();
    $adapter->construct();

    if (isset($_GET['email'])) {
        $email = $_GET['email'];
    } else {
        $email = "brodydowns@u.boisestate.edu";
    }

    if (isset($_GET['name'])) {
        $teacher_name = $_GET['name'];
    } else {
        $teacher_name = "YOUR_NAME";
    }

    //Check if token already exists for email
    if($email !== "DEV@DEV.DEV" && $adapter -> checkForToken($email)) {
        $response['email'] = "Email already sent. Try again later.";
        echo json_encode($response);
        return;
    }

    //Create token
    $token = md5(uniqid($teacher_name, true));
    $adapter -> insertEmailToken($email, $token);
    $url = $_SERVER['SERVER_NAME'] . "/cast-simple/reset/?token=" . $token;

    //Send Email
    $to = $email;
    $subject = "CAST - Welcome to the Team!";
    $howTo = "http://cast.boisestate.edu/cast-simple/tutorial/t-portal";

    $message = "<p>Hello New Teacher,</p>" .
    "<p>Thank you so much for expressing your interest in CAST. We are so excited to get you started.</p>".
    "</p>You can visit the link: <a href='$url'>$url</a> to set your password. If this link expires, we can send you a new one from your teacher portal page (see below).</p>".
    "<p>After this, you can visit the link: <a href='https://cast.boisestate.edu/$teacher_name/admin'>https://cast.boisestate.edu/$teacher_name/admin</a> to access your teacher portal and login with your password.</p>".
    "<p>Students can then perform searches at the link <a href='https://cast.boisestate.edu/$teacher_name'>https://cast.boisestate.edu/$teacher_name</a>.".
    "<p>If you have any questions about how anything works, we are always glad to help and can be reached at <a href='mailto:cast-group@boisestate.edu' target='_blank'>cast-group@boisestate.edu</a>!</p>".
    "<p>Thank you so much for joining us!</p>".
    "<p>Sincerely,</p>".
    "<p>The CAST Team</p>";
    
	$headers = "MIME-Version: 1.0\n";
	$headers .= "Content-type: text/html\n";
	$headers .= "From: no-reply@cast.boisestate.edu\n";


    mail($email,$subject,$message,$headers); //comment this out on local
    $response['email'] = "Email Sent!";
    //echo ($message); // comment this out on prod
	print_r($response)
?>
