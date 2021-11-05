<?php
    /*
    @file Action page that checks if a given teacher password is correct
    @author Brody Downs, Tyler French, CAST Team at Boise State University
    */

    session_start();

    require_once('../dbadapter.php');
    $adapter = new dbadapter();
    $adapter->construct();

    echo $_SESSION['teacher_name'];
    echo $_POST['password'];
    $val = $adapter->verifyPassword($_SESSION['teacher_name'], $_POST['password']);
    if($val) {
        $_SESSION['creds'] = $adapter->getTeacherID($_SESSION['teacher_name']);
    }
    else {
        $_SESSION['pass_error'] = 'Incorrect Password';
    }

    header("Location: /cast-simple/" . $_SESSION['teacher_name'] . "/admin");
?>