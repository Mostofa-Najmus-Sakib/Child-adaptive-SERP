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
require_once('../dbadapter.php');
$adapter = new dbadapter();
$adapter->construct();

$result = $adapter->getLessonEmailInfo();
$email = false;
$mail = new PHPMailer(true);
while ($row = mysqli_fetch_array($result)) {
    try {
        if($email != $row['email']) {
            if($email){
                // End the table HTML before sending
                $mail->Body .= "</table></div></body></html>";
                // print('sending');
                $mail_sent = $mail->send(); // Comment out on local
                echo $mail_sent ? json_encode("Email Sent!") : json_encode($mail->ErrorInfo); // Comment out on local
                // echo json_encode($mail); // Comment out on server
            }

            $email = $row['email'];
            $mail = new PHPMailer(true);
            $mail->isHTML(true);
            $mail->setFrom("no-reply@cast.boisestate.edu", "The CAST Team");
            $mail->addAddress($email);
            $mail->Subject = "Your student(s) have completed a CAST online lesson";
            $mail->Body = "<html><body><div><p>Good morning!</p><p>One or more of your students
            completed a CAST Online Lesson. A list of all students and the lesson they completed
            is included below, and you can find copies of their individual answers attached as
            PDF documents.</p><br><p>Stay well!</p></div><br>
            <div>
                <table style='border: 1px solid black;'>
                    <colgroup>
                        <col span='3' style='border: 1px solid black; width: 33%;'>
                    </colgroup>
                    <tr>
                        <th style='padding: 5px; text-align: left;'>Student</th>
                        <th style='padding: 5px; text-align: left;'>Lesson</th>
                        <th style='padding: 5px; text-align: left;'>Completed On</th>
                    </tr>";
        }
        // Handle processing of date
        $date = new DateTime($row['completion_time']);
        $formatted_date = $date->format("m-d-Y");

        $mail->Body .= "
                <tr style='border: 1px solid black;'>
                    <td style='padding: 5px;'>" . $row['name'] . "</td>
                    <td style='padding: 5px;'>" . ucfirst($row['topic']) . "</td>
                    <td style='padding: 5px;'>" . $formatted_date . "</td>
                </tr>
            ";
        $solutions = $row['pdf'];
        $filename = $row['name'] . $row['topic'] . '.pdf';
        $binary_content = file_get_contents($solutions);
        $mail->addStringAttachment($binary_content, $filename, $encoding='base64', $type='application/pdf');

    } catch (Exception $e) {
        echo json_encode($e->errorMessage());
    }
}

$mail->Body .= "</table></div></body></html>";
$mail_sent = $mail->send(); // Comment out on local
echo $mail_sent ? json_encode("Email Sent!") : json_encode($mail->ErrorInfo); // Comment out on local
// echo json_encode($mail); // Comment out on server

?>
