<?php
/*
    @file Action page that contains functionality for sending a report email.
    This will be sent as a Cron Job, at the end of every month.
    @author Brody Downs, Mikey Krentz, CAST Team at Boise State University
*/
echo "START<br>";
session_start();
require_once ('../dbadapter.php');
$adapter = new dbadapter();
$adapter->construct();
echo "MADE CONSTRUCTOR<br>";

//Set variables
$receivingEmail = "brodydowns@u.boisestate.edu";
$teacherNames = $adapter->getTeachers();
echo "GET TEACHERS<br>";
$array = mysqli_fetch_all($teacherNames);
$newThisMonth = mysqli_fetch_all($adapter->getNewThisMonth());
echo "get new this month: $newThisMonth<br>";
print_r($newThisMonth);
$barGraphData[] = [];
$out = fopen('../reports/monthly/monthlyReport.csv', 'w');
$csvInfo = ['Teacher Name', 'Teacher Email', 'Date Joined', 'Number of Students', 'Total Queries', 'Total Spellchecker Clicks', 'Total Usage Percentage', 'Queries This Month', 'Spellchecker Clicks This Month', 'Usage Percentage This Month', 'Days With Notes This Month', 'Reward This Month'];
fputcsv($out, $csvInfo);
//Send Email
$to = $receivingEmail;
$subject = "CAST - Monthly Update";
$message = '
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <title>CAST - Monthly Update</title>
            <link rel="stylesheet" href="//fonts.googleapis.com/css?family=Roboto:100,300,400&display=swap" type="text/css">
            <style type="text/css">
                body {
                    font-family: "Roboto", sans-serif;
                    background-color: #55A1ED;
                    overflow-x: hidden;
                }

                td {
                    padding: 15px;
                    width: fit-content;
                    border-right: 2px solid #BFBFBF;
                }

                tr:nth-child(even) {
                    background-color: #dddddd;
                }

                tbody tr:nth-child(odd) {
                    background-color: #ffffff;
                }

                .table-head {
                    background-color: black;
                    color: white;
                }

                th {
                    border-right: solid 1px #383838;
                    font-family: "Roboto", sans-serif;
                    font-weight:100 !important;
                    font-size: 18px;
                    padding: 20px;
                    padding-left: 15px;
                    text-align: left;
                }

                .row {
                    border-bottom: 2px solid #BFBFBF;
                    font-size: 16px;
                    font-weight: 300;
                }

                .table-container {
                    width: auto;
                    padding-left: 50px;
                    padding-right: 50px;
                }

                h1 {
                   font-size: 64px; 
                   font-weight: 400;
                }

                h2 {
                    display: inline-block;
                    font-size: 32px; 
                    font-weight: 300;
                    border-bottom: 2px solid white;
                }

                .title-text {
                    width: 33%;
                    margin: auto;
                    margin-top: 30px;
                    margin-bottom: 10px;
                    margin-left: 33%;
                    padding-bottom: 5px;
                    text-align: center;
                    color: white;
                }

                .table {
                    -webkit-box-shadow: 0px 0px 15px -4px rgba(0,0,0,0.75);
                    -moz-box-shadow: 0px 0px 15px -4px rgba(0,0,0,0.75);
                    box-shadow: 0px 0px 15px -4px rgba(0,0,0,0.75); 
                    border-radius: 5px;
                    border-collapse: collapse;
                    margin: auto;
                    width: auto;
                }

                table th:first-child {
                    border-top-left-radius: 5px;
                }
                
                table th:last-child {
                    border: none;
                    border-top-right-radius: 5px;
                }

                table tr:last-child td:first-child {
                    border-bottom-left-radius: 5px;
                }
                
                table tr:last-child td:last-child {
                    border: none;
                    border-bottom-right-radius: 5px;
                }

                table tr td:last-child {
                    border: none;
                }

                table tr:last-child {
                    border: none;
                }

                .name-column {
                    font-weight: bold;
                }

                .queries-column {
                    font-weight: bold;
                    text-align: center;
                }

                .btn {
                    display: inline-block;
                    -webkit-box-shadow: 0px 0px 15px -4px rgba(0,0,0,0.75);
                    -moz-box-shadow: 0px 0px 15px -4px rgba(0,0,0,0.75);
                    box-shadow: 0px 0px 15px -4px rgba(0,0,0,0.75); 
                    margin-top: 15px;
                    margin-right: 50px;
                    float: right;
                    padding: 15px;
                    border-radius: 5px;
                    background-color: lightgray;
                    color: blue;
                    text-decoration: none;
                    transition: .3s;
                }

                .btn:hover {
                    -webkit-box-shadow: 0px 0px 25px -4px rgba(0,0,0,0.75);
                    -moz-box-shadow: 0px 0px 25px -4px rgba(0,0,0,0.75);
                    box-shadow: 0px 0px 25px -4px rgba(0,0,0,0.75); 
                    background-color: white;
                    color: blue;
                    transition: .3s;
                }

            </style>
        </head>
        <body>
            <h1 class="title-text">CAST Monthly Report</h1>
            <div class="table-container">
            <h2 class="title-text">New This Month</h2>
            <table class="table" style="margin-bottom: 50px;">
            <thead class="table-head">
                <th>Teacher Name</th>
                <th>Teacher Email</th>
                <th>Date Joined</th>
                <th>Total Queries</th>
            </thead>
            <tbody>
            ';
echo "pre loop <br>";
for ($i = 0;$i < count($newThisMonth);$i++) {
	echo "do we enter loop?";
    $currentTeacher = $newThisMonth[$i];
	echo "before get query count<br>";
    $queriesCount = $adapter->getQueryCountForUse($currentTeacher[0]);
	echo "get query count for use<br>";
    $spellcheckerTotalCount = $adapter->getSpellcheckerTotalClicks($currentTeacher[0]);
	echo "get spellchecker total clicks<br>";
    $spellcheckerTotalPercentage = $queriesCount > 0 ? $spellcheckerTotalCount / $queriesCount : 0;
    $message = $message . '
            <tr class="row">
                <td class="name-column">
            ' . $currentTeacher[1] . '
            </td>
            <td class="email-column">
            <a href="mailto:
            ' . $currentTeacher[5] . '
            ?Subject=Hello%20From%20CAST%20:)" target="_top">
                ' . $currentTeacher[5] . '
                </a>
                </td>
                <td class="date-column">
            ' . $currentTeacher[10] . '
                </td>
                <td class="queries-column">
            ' . $queriesCount . '
                </td>
            </tr>
            ';
}
$message = $message . '
                </tbody>
                </table>
                <h2 class="title-text">All Teachers</h2>
                <a class="btn" href="../reports/monthly/monthlyReport.csv" role="button">Download</a>   
                <a class="btn" style="margin-right: 15px;" href="https://docs.google.com/spreadsheets/d/1BWN5la0vJDbVaiPUUsSk3gHBBFeMEHIy3rGKCYcPveM/" target="_blank" role="button">Check Giftcard Status</a>   
                <table class="table">
                <thead class="table-head">
                    <th>Teacher Name</th>
                    <th>Teacher Email</th>
                    <th>Date Joined</th>
                    <th>Number of Students</th>
                    <th>Queries This Month</th>
                    <th>Days With Notes This Month</th>
                    <th>Gift Amount</th>
                </thead>
                <tbody>
                ';
for ($i = 0;$i < count($array);$i++) {
    $teacherInfo = $adapter->getTeacher($array[$i][0]);
    $teachArray = mysqli_fetch_array($teacherInfo);
    $queriesCount = $adapter->getQueryCountForUse($teachArray['tid']);
    $spellcheckerTotalCount = $adapter->getSpellcheckerTotalClicks($teachArray['tid']);
    $spellcheckerTotalPercentage = $queriesCount > 0 ? $spellcheckerTotalCount / $queriesCount : 0;
    $spellcheckerMonthCount = $adapter->getSpellcheckerClicksThisMonth($teachArray['tid']);
    $monthCount = $adapter->getMonthCount($teachArray['tid']);
    $studentCount = $adapter->getNumStudents($teachArray['tid']);
    $daysWithNotesMonthly = $adapter->daysWithNotesThisMonth($teachArray['tid']);
	echo "loop $i<br>";
    $reward = 0;
    $firstAchieved = false;
    if ($monthCount >= ($studentCount * 5) && $monthCount > 0) {
        $reward += 20;
        $firstAchieved = true;
    }
    for ($j = 0; $j < $daysWithNotesMonthly; $j++) {
        if ($firstAchieved == true) {
            $reward += 0.50;
        }
    }
    $spellcheckerMonthPercentage = $monthCount > 0 ? $spellcheckerMonthCount / $monthCount : 0;
    $barGraphData[$teachArray['name']] = $queriesCount;
    $forCSV = [$teachArray['name'], $teachArray['email'], $teachArray['createdAt'], $studentCount, $queriesCount, $spellcheckerTotalCount, '%'.$spellcheckerTotalPercentage, $monthCount, $spellcheckerMonthCount, '%'.$spellcheckerMonthPercentage, $daysWithNotesMonthly, '$'.$reward];
    $message = $message . '
                <tr class="row">
                    <td class="name-column">
                ' . $teachArray['name'] . '
                    </td>
                    <td class="email-column">
                    <a href="mailto:
                ' . $teachArray['email'] . '
                ?Subject=Hello%20From%20CAST%20:)" target="_top">
                    ' . $teachArray['email'] . '
                    </a>
                    </td>
                    <td class="date-column">
                ' . $teachArray['createdAt'] . '
                    </td>
                    <td class="queries-column">
                ' . $studentCount . '
                    </td>
                    <td class="queries-column">
                ' . $monthCount . '
                    </td>
                    <td class="queries-column">
                ' . $daysWithNotesMonthly . '
                    </td>
                    <td class="queries-column">$
                ' . $reward  . '
                    </td>
                </tr>
                ';
    fputcsv($out, $forCSV);
}
$message = $message . '
            </tbody>
            </table>
            </div>
            ';
$message = $message . '   
        </body>
    </html>
    ';
fclose($out);
// To send HTML mail, the Content-type header must be set
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html\r\n";
$headers .= "From: no-reply@cast.boisestate.edu\r\n";
mail($to,$subject,$message,$headers); //comment this out on local
// $response['msg'] = $message; //comment this out on live
$response['email'] = "Email Sent!";
echo json_encode($response);
// echo ($message); //

?>
