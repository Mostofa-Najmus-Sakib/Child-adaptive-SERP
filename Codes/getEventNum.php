<?php
    session_start();
    if(isset($_SESSION['eventNum'])) {
        echo $_SESSION['eventNum'];
    }
    else
        echo 0;
?>