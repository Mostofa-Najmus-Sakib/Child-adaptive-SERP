<?php
require_once('../dbadapter.php');
$adapter = new dbadapter();
$adapter->construct();
$spelling_data = $adapter->spellingData();
$table = [];
$table_index = 0;
//print_r($spelling_data);

//build table
for($i=0;$i<count($spelling_data);$i++)
{
    $etid = $spelling_data[$i]['etid'];
    $data = json_decode($spelling_data[$i]['data']);
    $sid = $spelling_data[$i]['sid'];
    $tid = $spelling_data[$i]['tid'];
	$qid = $spelling_data[$i]['qid'];
    $timeCreated = $spelling_data[$i]['timeCreated'];
    if($etid == 8) //popup detected
    {
        $misspell = $data->{'misspell'};
        //If the hovered word is the same as last, then don't print anything and continue looking for a click
        if(isset($prev_misspell) && $prev_misspell == $misspell) 
            continue;
        //if it is different, they didn't find a suitable suggestion, start a line for a new word
        else if (isset($prev_misspell)) 
        {
            $table_index++;
        }
        //if $prev_misspell is not set, they used a suggestion, or its the first word
        $prev_misspell = $misspell;
        $suggestions = $data->{'suggestions'};
        $table[$table_index]['misspell'] = $misspell;
        $table[$table_index]['suggestions'] = json_encode($suggestions);
        $table[$table_index]['sid'] = $sid;
        $table[$table_index]['qid'] = $qid;
		$table[$table_index]['tid'] = $tid;
        $table[$table_index]['timeCreated'] = $timeCreated;
    }
    else if ($etid == 5) //click suggestion
    {
        $table[$table_index]['clicked'] = $data->{'clicked'};
        $table[$table_index]['position'] = $data->{'position'};
        unset($prev_misspell);
        $table_index++;
    }
}

function render_table($table)
{
    $output = "
    <table class='table' id ='spellingTable'>
    <thead>
        <tr>
            <th>Spelling</th>
            <th>Clicked</th>
            <th>Position</th>
            <th>Suggestions</th>
            <th>SID</th>
            <th>QID</th>
			<th>TID</th>
        </tr>
    </thead>
    <tbody>";

    foreach($table as $row) {
        $output .=
        "<tr>";

        //Misspelled word
        $output .=
            "<td>"; 
        if(isset($row['misspell'])) $output .= $row['misspell'];
        $output.= 
            "</td>";

        //Clicked word
        $output .=
            "<td>";
        if(isset($row['clicked'])) $output .= $row['clicked'];
        $output .=
            "</td>";

        //Position
        $output .=
            "<td>";
        if(isset($row['position'])) $output .= $row['position'];
        $output .=
            "</td>";

        //Suggestions
        $output .=
            "<td>";
        if(isset($row['suggestions'])) $output .= $row['suggestions'];
        $output .=
            "</td>";

        //SID
        $output .=
            "<td>";
        if(isset($row['sid'])) $output .= $row['sid'];
        $output .=
            "</td>";
            

        //QID
        $output .=
            "<td><a href='/cast-simple/replay?qid=".$row['qid']."' target='_blank'>";
        if(isset($row['qid'])) $output .= $row['qid'];
        $output .=
            "</a></td>";        

        //TID
        $output .=
            "<td>";
        if(isset($row['tid'])) $output .= $row['tid'];
        $output .=
            "</td>";
        
		$output .=
        "</tr>";
    }
    $output .= "</tbody></table>";
    echo $output;

}

function create_csv($table){
    //header("Content-Type: text/csv");
    //header("Content-Disposition: attachment; filename=file.csv");
    $out = fopen('spelling.csv', 'w');

    foreach ($table as $row) {
        fputcsv($out, $row);
    }

    fclose($out);
}

//sort by time created
usort($table, function ($item1, $item2) {
    return $item1['timeCreated'] <=> $item2['timeCreated'];
});

create_csv($table);
?>
<div style="background-color:white; display: table; width: 100%;">
    <div>
        <?php render_table($table); ?>
    </div>
    <div class="text-center" width="100%" style="padding-bottom: .5%;">
            <a class="btn btn-primary" href="spelling.csv" role="button">Download</a>
    </div>
</div>
