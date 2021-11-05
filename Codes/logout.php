<?php

    /*
    @file Action page that logs out of an authenticated teacher
    @author Brody Downs, Tyler French, CAST Team at Boise State University
    */

    session_start();
    unset($_SESSION['creds']);
    header("Location:/cast-simple");
    exit;
?>