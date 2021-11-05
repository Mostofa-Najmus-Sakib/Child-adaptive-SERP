<?php

    /*
    @file PHP action page that adds a teacher to the database 
    @author Brody Downs, Tyler French, CAST Team at Boise State University
    */

    session_start();

    // Construct the database adapter
    require_once('../dbadapter.php');
    $adapter = new dbadapter();
    $adapter->construct();

    echo $_POST['name'];
    echo $_POST['email'];

    // Calls database function to add given name and email
    $adapter->addTeacher($_POST['name'], $_POST['email']);

    // Redirects (refreshes) to admin portal
    header("Location: <?php echo $_SESSION['base'] ?>/admin");
?>