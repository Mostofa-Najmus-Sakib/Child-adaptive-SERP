<?php
header('Access-Control-Allow-Origin: *');

function allowEmbed($url) {
    $header = http_headers($url);
	if(parse_url($url)['scheme'] == 'http'){
        return false;
    }

    $keys = ['X-Frame-Options', 'X-FRAME-OPTIONS', 'x-frame-options'];

	//print_r($header);
    // URL okay?
    //if (!$header || stripos($header[0], '200 ok') === false) return false;
    if (!$header/* || preg_match_all('/40[0-9]/m',$header[0])*/) return false;
	//print_r("check 1\n");
	
	if(isset($header["X-Q-Stat"])) return false;
	if(isset($header["X-Request-ID"])) return false;
	//if(isset($header["Link"])) return false;

    foreach ($keys as $key) {
        $value = "";
        if(isset($header[$key])) {
            $value = $header[$key];
            if(is_array($header[$key])) $value = $value[0];
            $value = strtolower($value);
        }
        // Check X-Frame-Option
        if (isset($header[$key]) &&
        (  stripos($value, strtolower('SAMEORIGIN')) !== false 
        || stripos($value, strtolower('DENY')) !== false
        || stripos($value, strtolower('ALLOW-FROM')) !== false
        )
        ) {
            return false;
        }
    }

    // Everything passed? Return true!
    return true;
}


function http_headers($url){
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);

    $headers = curl_exec($ch);
    curl_close($ch);

    $data = [];
    $headers = explode(PHP_EOL, $headers);
    foreach ($headers as $row) {
        $parts = explode(':', $row);
        if (count($parts) === 2) {
            $data[trim($parts[0])] = trim($parts[1]);
        }
    }

    return $data;
};

$url = $_GET['url'];

echo json_encode(allowEmbed($url));
?>
