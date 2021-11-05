<?php

    /*
    @file Action page that checks if the given password in the admin portal is correct
    @author Brody Downs, Tyler French, CAST Team at Boise State University
    */

    session_start();
    echo  $_POST['password'];

    require_once('../dbadapter.php');
    $adapter = new dbadapter();
    $adapter->construct();
    $val = $adapter->verifyAdmin($_POST['password']);


    if($val) {
        $_SESSION['admincreds'] = 'admin';
    }
    else {
        $_SESSION['pass_error'] = 'Incorrect Password';
    }



    header("Location: /cast-simple/admin");
?>