<?php
    /*
    @file Action page that hashes a password
    @author Brody Downs, Tyler French, CAST Team at Boise State University
    */

    //Generates a password hash for a given password
    $hash = password_hash($_GET['password'], PASSWORD_DEFAULT);
    echo $hash;
?>