<?php
    /*
    @file Calls database functions for cast search page depending on name from AJAX call
    @author Brody Downs, Tyler French, CAST Team at Boise State University
    */

    header('Content-type: application/json; charset=utf-8');
    session_start();
    require_once('../dbadapter.php');

    $adapter = new dbadapter();
    $adapter->construct();

    if(isset($_SESSION['sid']) && $_POST['functionname'] == 'insertQuery')
    {
        $adapter->insertQuery($_SESSION['sid'],str_replace("\xc2\xa0",' ',$_POST['arguments'][0]), $_POST['arguments'][1]);
        echo json_encode("success");
    }
    else if(isset($_SESSION['sid']) && $_POST['functionname'] == 'insertEvent')
    {
        $_SESSION['eventNum'] = end($_POST['arguments']);
        $eid = $adapter->insertEvent($_SESSION['sid'], $_POST['arguments'][0], $_POST['arguments'][1],$_POST['arguments'][2],$_POST['arguments'][3],$_POST['arguments'][4]);
        echo json_encode($eid);
    }
    else if ($_POST['functionname'] == 'getQueries') {
        $array = $adapter->getQueries($_SESSION['creds'], $_POST['arguments'][0], $_POST['arguments'][1]);
        echo json_encode($array);
    }
    else if ($_POST['functionname'] == 'refreshQueries') {
        $array = $adapter->getQueries($_SESSION['creds'], $_POST['arguments'][0], $_POST['arguments'][1]);
        echo json_encode($array);
    }
    else if ($_POST['functionname'] == 'updateNotes') {
        $tsid = $adapter->createTeacherSession($_SESSION['creds'], $_POST['arguments'][1]);
        $adapter->updateNotes($tsid, $_POST['arguments'][0]);
        echo json_encode($tsid . " , " . $_SESSION['creds'] . " , " . $_POST['arguments'][1]);
    }
    else if ($_POST['functionname'] == 'getNotes') {
        $array = $adapter->getNotes($_POST['arguments'][0], $_SESSION['creds']);
        echo json_encode($array);
    }
    else if ($_POST['functionname'] == 'logResult') {
        $adapter->logResult($_POST['arguments'][0], $_POST['arguments'][1], $_POST['arguments'][2], $_POST['arguments'][3], $_POST['arguments'][4], $_POST['arguments'][5], $_POST['arguments'][6]);
        echo json_encode("success");
    }
    else if ($_POST['functionname'] == 'insertSuggestionUrl') {
        $adapter->insertSuggestionUrl($_POST['arguments'][0], $_POST['arguments'][1], $_POST['arguments'][2]);
        echo json_encode("success");
    }
    else if ($_POST['functionname'] == 'checkSuggestCache') {
        $result = 0;
        if (!isset($_SESSION['suggestCache'])) {
            $_SESSION['suggestCache'] = array();
        }
        if (!array_key_exists($_POST['arguments'][0], $_SESSION['suggestCache']))
            $result = 1;

        echo json_encode($result);
    }
    else if ($_POST['functionname'] == 'addSuggestCache' && isset($_POST['arguments'][1])) {
        $_SESSION['suggestCache'][$_POST['arguments'][0]] = $_POST['arguments'][1];
        //echo json_encode($_SESSION['suggestCache'][$_POST['arguments'][0]]);
        echo json_encode("success");
    }
    else if ($_POST['functionname'] == 'getSuggestCache') {
        echo json_encode($_SESSION['suggestCache'][$_POST['arguments'][0]]);
    }
    else if ($_POST['functionname'] == 'checkUrlCache') {
        $result = 0;
        if (!isset($_SESSION['urlCache'])) {
            $_SESSION['urlCache'] = array();
        }
        if (!array_key_exists($_POST['arguments'][0], $_SESSION['urlCache']))
            $result = 1;

        echo json_encode($result);
    }
    else if ($_POST['functionname'] == 'addUrlCache') {
        $_SESSION['urlCache'][$_POST['arguments'][0]] = $_POST['arguments'][1];
        //echo json_encode($_SESSION['suggestCache'][$_POST['arguments'][0]]);
        echo json_encode("success");
    }
    else if ($_POST['functionname'] == 'getUrlCache') {
        echo json_encode($_SESSION['urlCache'][$_POST['arguments'][0]]);
    }
    else if ($_POST['functionname'] == "getMonthCount") {
        echo json_encode($adapter->getMonthCount($_SESSION['creds']));
    }
    else if ($_POST['functionname'] == "updateNumStudents") {
        echo json_encode($adapter->updateNumStudents($_SESSION['tid'],$_POST['arguments'][0]));
    }
    else if ($_POST['functionname'] == "getNumStudents") {
        echo json_encode($adapter->getNumStudents($_SESSION['tid']));
    }
    else if ($_POST['functionname'] == "toggleImages") {
        $adapter->toggleImages($_SESSION['creds']);
        echo json_encode("Images toggled");
    }
    else if ($_POST['functionname'] == "toggleVoice") {
        $adapter->toggleVoice($_SESSION['creds']);
        echo json_encode("voice");
    }
    else if ($_POST['functionname'] == "togglePopout") {
        $adapter->togglePopout($_SESSION['creds']);
        echo json_encode("popout");
    }
    else if ($_POST['functionname'] == "toggleSplchk") {
        $adapter->toggleSplchk($_SESSION['creds']);
        echo json_encode("splchk");
    }
    else if ($_POST['functionname'] == "toggleBookmark") {
        $adapter->toggleBookmark($_SESSION['creds']);
        echo json_encode("bookmark");
    }
    else if ($_POST['functionname'] == "toggleChirp") {
        $adapter->toggleChirp($_SESSION['creds']);
        echo json_encode("chirp");
    }
    else if ($_POST['functionname'] == "toggleShortSession") {
        $adapter->toggleShortSession($_SESSION['creds']);
        echo json_encode("shortSession");
    }
    else if ($_POST['functionname'] == "toggleRewards") {
        $adapter->toggleRewards($_SESSION['creds']);
        echo json_encode("toggleRewards");
    }
    else if ($_POST['functionname'] == "getEnableImages") {
        $config['images'] = $adapter->getEnableImages($_SESSION['tid']);
        $config['voice'] = $adapter->getEnableVoice($_SESSION['tid']);
        $config['popout'] = $adapter->getEnablePopout($_SESSION['tid']);
        $config['splchk'] = $adapter->getEnableSplchk($_SESSION['tid']);
        $config['bookmark'] = $adapter->getEnableBookmark($_SESSION['tid']);
        $config['chirp'] = $adapter->getEnableChirp($_SESSION['tid']);
        $config['shortSession'] = $adapter->getEnableShortSession($_SESSION['tid']);
        echo json_encode($config);
    }
    else if ($_POST['functionname'] == "getEnableVoice") {
        $newEnableVoice = $adapter->getEnableVoice($_SESSION['tid']);
        echo json_encode($newEnableVoice);
    }
    else if ($_POST['functionname'] == "getEnablePopout") {
        $newEnablePopout = $adapter->getEnablePopout($_SESSION['tid']);
        echo json_encode($newEnablePopout);
    }
    else if ($_POST['functionname'] == "getEnableSplchk") {
        $newEnableSplchk = $adapter->getEnableSplchk($_SESSION['tid']);
        echo json_encode($newEnableSplchk);
    }
    else if ($_POST['functionname'] == "getEnableBookmark") {
        $newEnableBookmark = $adapter->getEnableBookmark($_SESSION['tid']);
        echo json_encode($newEnableBookmark);
    }
    else if ($_POST['functionname'] == "getEnableChirp") {
        $newEnableChirp = $adapter->getEnableChirp($_SESSION['tid']);
        echo json_encode($newEnableChirp);
    }
    else if ($_POST['functionname'] == "getEnableShortSession") {
        $newEnableSession = $adapter->getEnableShortSession($_SESSION['tid']);
        echo json_encode($newEnableSession);
    }
    else if ($_POST['functionname'] == "getEnableRewards") {
        $newEnableRewards = $adapter->getEnableRewards($_SESSION['tid']);
        echo json_encode($newEnableRewards);
    }
    else if ($_POST['functionname'] == "getEnableImagesC") {
        $newEnableImages = $adapter->getEnableImages($_SESSION['creds']);
        echo json_encode($newEnableImages);
    }
    else if ($_POST['functionname'] == "getEnableVoiceC") {
        $newEnableVoice = $adapter->getEnableVoice($_SESSION['creds']);
        echo json_encode($newEnableVoice);
    }
    else if ($_POST['functionname'] == "getEnablePopoutC") {
        $newEnablePopout = $adapter->getEnablePopout($_SESSION['creds']);
        echo json_encode($newEnablePopout);
    }
    else if ($_POST['functionname'] == "getEnableSplchkC") {
        $newEnableSplchk = $adapter->getEnableSplchk($_SESSION['creds']);
        echo json_encode($newEnableSplchk);
    }
    else if ($_POST['functionname'] == "getEnableBookmarkC") {
        $newEnableBookmark = $adapter->getEnableBookmark($_SESSION['creds']);
        echo json_encode($newEnableBookmark);
    }
    else if ($_POST['functionname'] == "getEnableChirpC") {
        $newEnableChirp = $adapter->getEnableChirp($_SESSION['creds']);
        echo json_encode($newEnableChirp);
    }
    else if ($_POST['functionname'] == "getEnableShortSessionC") {
        $newEnableSession = $adapter->getEnableShortSession($_SESSION['creds']);
        echo json_encode($newEnableSession);
    }
    else if ($_POST['functionname'] == "getEnableRewardsC") {
        $newEnableRewards = $adapter->getEnableRewards($_SESSION['creds']);
        echo json_encode($newEnableRewards);
    }
    else if ($_POST['functionname'] == "getAnnotations" && isset($_SESSION['creds'])) {
        $rval['queries'] = $adapter->dayContainsQueries($_SESSION['creds'], $_POST['arguments'][0], $_POST['arguments'][1]);
        $rval['notes'] = $adapter->dayContainsNotes($_SESSION['creds'], $_POST['arguments'][0]);
        $rval['date'] = $_POST['arguments'][2];
        echo json_encode($rval);
	}
	else if ($_POST['functionname'] == "getQueryQID") {
		$queryqid = $adapter->getQueryQid($_POST['arguments'][0], $_POST['arguments'][1], $_POST['arguments'][2]);
		echo json_encode($queryqid);
    }
    else if ($_POST['functionname'] == "getCorrectionCount") {
        $count = $adapter->spellingCorrectionsCount($_POST['arguments'][0]);
        echo json_encode($count);
    }
    else if($_POST['functionname'] == 'updatePassword') {
        $adapter->updatePassword($_POST['arguments'][0], $_POST['arguments'][1]);
        echo json_encode("success");
	}
	else if ($_POST['functionname'] == 'switchTeacher') {
		$_SESSION['creds'] = $adapter->getTeacherID($_POST['arguments'][0]);
		echo json_encode("success");
    }
    else if ($_POST['functionname'] == 'latestQueries') {
        $time = $_POST['arguments'][0];
        $result = $adapter->latestQueries($_SESSION['tid'], $time, $_SESSION['sid']);
        echo json_encode($result);
    }
    else if ($_POST['functionname'] == 'createSession') {
        $result = $adapter->createSession($_SESSION['tid']);
        $_SESSION['sid'] = $result;
        echo json_encode($result);
    }
    else if ($_POST['functionname'] == 'approveRequest') {
        $result = $adapter->approveRequest($_POST['arguments'][0]);
        echo json_encode($result);
    }
    else if ($_POST['functionname'] == 'denyRequest') {
        $result = $adapter->denyRequest($_POST['arguments'][0]);
        echo json_encode($result);
    }
	else if ($_POST['functionname'] == 'getApproved') {
		$result  = $adapter->getApproved($_POST['arguments'][0]);
		echo json_encode($result);
	}
	else if ($_POST['functionname'] == 'setIrbRequest') {
		$result = $adapter->setIrbRequest($_POST['arguments'][0], $_POST['arguments'][1]);
        echo json_encode($result);
	} else if ($_POST['functionname'] == 'submitLesson') {
        $result = $adapter->submitLesson($_POST['arguments'][0], $_POST['arguments'][1]);
        echo json_encode($result);
    } else if ($_POST['functionname'] == 'saveLessonEmailInfo'){
        $result = $adapter->saveLessonEmailInfo($_POST['arguments'][0], $_POST['arguments'][1], $_POST['arguments'][2], $_POST['arguments'][3]);
        echo json_encode($result);
    }
    else {
        $error['error'] = "No Suitable Response";
        echo json_encode($error);
    }


?>
