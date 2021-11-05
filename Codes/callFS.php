<?php

    header('Content-type: application/json; charset=utf-8');
    session_start();

    function set_dir_root() {
        if($_POST['arguments'][0]=="true") {
            //$dir_root = "/opt/lampp/htdocs/cast-simple/";
           $dir_root = "/xampp/htdocs/cast-simple/";
        } else {
            $dir_root = "/var/www/html/cast-simple/";
        }
        return $dir_root;
    }

    if($_POST['functionname'] == "loadDirectoryData") {
        $dir = set_dir_root() . $_POST['arguments'][1];
        $grades_scan = scandir($dir);
        $grades = array_slice($grades_scan, 2);
        $data = array();
        foreach ($grades as &$grade) {
            $lesson_dir = $dir . $grade;
            $lessons = scandir($lesson_dir);
            $data[] = array("$grade" => array_slice($lessons, 2));
        };
        unset($grade);

        echo json_encode($data);
    }
?>
