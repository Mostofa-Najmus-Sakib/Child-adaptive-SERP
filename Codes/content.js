/*
@file Javascript functions for search engine content
@author: Brody Downs, Tyler French, Mikey Krentz CAST Team at Boise State University
*/

/* Instance Variables */
var showGuide = false;
var checkStopWords = true; //If true, fades stopwords in input
var currentFocus = null;    //HTML DOM element last clicked on
var isEditable = false;     //is the highlighted word editable
var lastInputTime;          // Keeps track of when the user last typed something, for spellchecking purposes
var lastSelected = "";      // The last selected text
var selectedWord = "";      // The word to get suggestions for
var selectedWordData = [];
var imageObj = {};          // Contains queries tied to urls
var enableVoice = 0;        // Config variable for Text-To-Speech
var enableImages = 0;
var enablePopout = 0;        // Config variable for Text-To-Speech
var enableSplchk = 0;
var enableChirp = 0;        // Config variable to determine alternate results display
var enableBookmark = 0;        // Config variable for pictures in suggestions
var voiceSelect = "Joanna";     // Config variable to select voice for TTS
var resultClicked = 0;          // This flag prevents results from being logged twice
var eventNum;
var searchTerm;
var autoPopup = true;
var seen_misspells = [];
var alert_sound = false;
var button_audio = true;
var auto_play_suggestions = true;
var stop_playing_suggestions = false;
var cur_playing_suggestions_id = 0;
var ignore_list = [];
var close_button = true;
var newTabs = true;
var nextPage = {};
var prevPage = {};
var currPage = 1;
let numPerPage = 10;    // Max of 10 per Google API, if it's changed here needs changed in googleSearch.php on CAST server.

var highlightDifference = {
    'highlightBackground' : true,
    'changeTextColor' : false,
    'underline' : false
}
var qid = uuidv4();     //Query ID for logging events
var prev_qid;   //previous Query ID - use for logging events related to search results
var stopwords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
 "any","are","aren't","as","at","be","because","been","before","being","below","between","both",
 "but","by","can't","cannot","could","couldn't","did","didn't","do","does","doesn't","doing",
 "don't","down","during","each","few","for","from","further","had","hadn't","has","hasn't",
 "have","haven't","having","he","he'd","he'll","he's","her","here","here's","hers","herself",
 "him","himself","his","how","how's","i","i'd","i'll","i'm","i've","if","in","into","is",
 "isn't","it","it's","its","itself","let's","me","more","most","mustn't","my","myself","no",
 "nor","not","of","off","on","once","only","or","other","ought","our","ours","ourselves","out",
 "over","own","same","shan't","she","she'd","she'll","she's","should","shouldn't","so","some",
 "such","than","that","that's","the","their","theirs","them","themselves","then","there","there's",
 "these","they","they'd","they'll","they're","they've","this","those","through","to","too",
 "under","until","up","very","was","wasn't","we","we'd","we'll","we're","we've","were","weren't",
 "what","what's","when","when's","where","where's","which","while","who","who's","whom","why",
 "why's","with","won't","would","wouldn't","you","you'd","you'll","you're","you've","your","yours",
 "yourself","yourselves", "?", ".", "!"];
cue_phrases = ["okay", "oh!","um", "hmm", "hmm?"];
content_phrases = ["did you mean one of these?", "how about these?", "maybe one of these?", "do one of these sound right?"
                    ,"is this what you meant", "try one of these"];
last_cue_phrase = -1;
last_content_phrase = -1;
dialogue_interruption = false;

function setEventNum(num){
    console.log("hello");
    eventNum = num;
    console.log(eventNum);
}

/* Removes Spellchecker Popup when needed */
// Case 1: typing
$(document).on('input', function(data) {
    var popup = document.getElementById("myPopup");
    if(popup && !autoPopup) document.body.removeChild(popup);
});

// Case 2: clicking outside the popup
$(document).click(function(event) {
    if (!$(event.target).closest("#myPopup").length) {
        var popup = document.getElementById("myPopup");
        if(popup) document.body.removeChild(popup);
    }
});
// Case 3: Resizing the window
$(window).resize(function() {
    var popup = document.getElementById("myPopup");
    if(popup) document.body.removeChild(popup);
});

/*
$(document).on('DOMNodeRemoved','.wrapWord', function(data){
    console.log('hey whta');
    wordIndex = this.getAttribute('index');
    var popup = document.getElementById("popup-"+wordIndex);
    //if(popup) document.body.removeChild(popup);
    stop_playing_suggestions = true;
});
*/

/* createWindow: Constructs the spellchecker popup */
function createWindow(word, arrayOfSuggestions, editable, eid, wordIndex) {
    // Destroy existing spellchecker if necessary
    if($('#popup-'+wordIndex).length) {
        var popup = document.getElementById("popup-"+wordIndex);
        if(popup.getAttribute('word')!=word) document.body.removeChild(popup);
        else return null;
    }


    isEditable = editable;

    // Remove leading/trailing punctuation/spaces
    selectedWord = "" + word;
    selectedWord = selectedWord.replace(/^[ .,\/#!?$%\^&\*;:{}=\-_`~()]+|[ .,\/#!?$%\^&\*;:{}=\-_`~()]+$/g, "");

    // Create popup div window
    var popup = document.createElement('div');
    popup.id = "popup-"+wordIndex;
    popup.classList.add("myPopup");
    popup.setAttribute('word', word);

    // Create wrappers for all content in popup
    var wrapper = document.createElement('div');
    wrapper.classList.add("contentWrapper");
    var leftwrapper = document.createElement('div');
    leftwrapper.style = "width: 100%;";

    // Create and append mispelled word button
    var word = document.createElement('div');
    word.id = "myPopupWord";
    if (selectedWord.length > 25)
        word.classList.add("smallText");
    var wordNode = document.createTextNode(selectedWord);
    word.setAttribute('index',wordIndex);
    word.setAttribute('spelling', selectedWord);
    if(button_audio && enableVoice)
        $(word).append('<i class="fas fa-volume-up suggestion-speaker-button"></i>');
    if(!close_button){
        $(word).css("padding-left","32px");
        $(word).append('<i class="fas fa-times close-button"</i>');
    }
    word.appendChild(wordNode);
    var misButton = document.createElement('div');
    misButton.id = "misButton";
    misButton.appendChild(word);

    // If there are no suggestions, display message
    if (arrayOfSuggestions.length == 0) {
        var contentButton = document.createElement('div');
        contentButton.classList.add("contentButton");
        contentButton.appendChild(misButton);
        leftwrapper.appendChild(contentButton);

        contentButton = document.createElement('div');
        contentButton.classList.add("contentButton");
        contentButton.innerText = "No suggestions found";
        leftwrapper.appendChild(contentButton);
        wrapper.appendChild(leftwrapper);
        popup.appendChild(leftwrapper);
    }
    // Otherwise, create and apppend each suggestion as a button
    else {
        // Instantiate difference finder
        var dmp = new diff_match_patch();

        // Append stuff to the first content button, and append it to the popup
        var contentButton = document.createElement('div');
        contentButton.classList.add("contentButton");
        contentButton.appendChild(misButton);
        leftwrapper.appendChild(contentButton);

        arrayOfSuggestions.forEach(function(item, i) {
            if (enableImages === 1) {
                $.ajax({
                    type: "POST",
                    url: '/cast-simple/php/callDBA.php',
                    dataType: 'json',
                    data: {functionname: "checkUrlCache", arguments: [item]},
                    success: function(result) {
                        if (result == 1) {
                            //Not found in cache
                            imageSearchListener({toDo: "imageSearch", keyword: item, eid: eid, newCache: true});
                        } else {
                            //found in cache
                            $.ajax({
                                type: "POST",
                                url: '/cast-simple/php/callDBA.php',
                                dataType: 'json',
                                data: {functionname: "getUrlCache", arguments: [item]},
                                success: function(result) {
                                    gotImageListener({todo: "gotImage", message: "success", query: item, result: result, eid: eid, cacheImage: true});
                                },
                                error: function(error, status, msg) {
                                    send_slack_message("ERROR: Image Cache Lookup Fail\n"+
                                    "error: " + JSON.stringify(error) + "\n" +
                                    "status: " + status + "\n" +
                                    "message: " + msg);
                                }
                            });
                        }
                    },
                    error: function(error, status, msg) {
                        send_slack_message("ERROR: Image Cache Lookup Fail\n"+
                        "error: " + JSON.stringify(error) + "\n" +
                        "status: " + status + "\n" +
                        "message: " + msg);
                    }
                });
            }

            // Container for the two buttons
            var contentButton = document.createElement('div');
            contentButton.classList.add("contentButton");
            contentButton.classList.add("castSuggest-" + item);

            // First sub-button: the suggested word
            var suggestButton = document.createElement('div');
            suggestButton.classList.add("suggestButton");
            if (item.length > 20)
                suggestButton.classList.add("smallText");
            var div = document.createElement('div');
            div.classList = "spellingSuggestion";
            div.id = i;
            div.setAttribute('index',wordIndex);

            // Find difference and put in span
            var diff = dmp.diff_main(selectedWord, item);
            dmp.diff_cleanupSemantic(diff);
            diff.forEach(function(substr) {
                if (substr[0] == 0) {
                    var textNode = document.createTextNode(substr[1]);
                    div.appendChild(textNode);
                } else if (substr[0] == 1) {
                    var spanNode = document.createElement('span');
                    spanNode.appendChild(document.createTextNode(substr[1]));
                    //spanNode.classList.add('CAST_correctDiff');
                    div.appendChild(spanNode);
                    if(highlightDifference['changeTextColor'])
                        spanNode.classList.add('CAST_colorText');
                    if(highlightDifference['highlightBackground'])
                        spanNode.classList.add('CAST_highlightBackground');
                    if(highlightDifference['underline'])
                        spanNode.classList.add('CAST_underline');
                }
            });
            if(button_audio && enableVoice)
                $(div).append('<i class="fas fa-volume-up suggestion-speaker-button"></i>');

            //Image container and image
            var imgWindow = document.createElement("div");
            imgWindow.classList.add("imgWindow");
            var imagepic = document.createElement('img');
            imagepic.classList.add("imgExpand");
            imgWindow.appendChild(imagepic);

            // Append buttons to button container and finally to popup
            suggestButton.appendChild(div);
            contentButton.appendChild(suggestButton);
            contentButton.appendChild(imgWindow);
            leftwrapper.appendChild(contentButton);
            wrapper.appendChild(leftwrapper);
            popup.appendChild(wrapper);
        });

        //If no close button, we attach the misspelling to the bottom as the close button, otherwise create a close button
        if(!close_button)
            leftwrapper.appendChild(contentButton);
        else{

            let button = document.createElement('div');
            button.id = "closeButton";
            let wordNode = document.createTextNode("Close");
            button.setAttribute('index',wordIndex);
            button.setAttribute('spelling', selectedWord);

            $(button).append('<i class="fas fa-times close-button"</i>');
            $(button).css("padding-left","32px");
            button.appendChild(wordNode);

            let misButton = document.createElement('div');
            misButton.id = "misButton";
            misButton.appendChild(button);

            let contentButton = document.createElement('div');
            contentButton.classList.add("contentButton");
            contentButton.appendChild(misButton);
            leftwrapper.appendChild(contentButton);
        }

    }

    // Display popup by appending to body
    document.body.appendChild(popup);



    return popup;
}

/* createWindowFunc: Listener to put popup on screen */
function createWindowFunc(request) {
    if (request.todo == "createOnTypeWindow") {

        //creates window
        var popup = createWindow(request.selectedWord, request.arrayOfSuggestions, request.editable, request.eid, request.index);
        if(popup==null) return;

        //repositions window
        var popupHeight = popup.clientHeight;
        var windowHeight = $(window).height();
        var inputHeight = currentFocus.clientHeight;
        var bodyRect = document.body.getBoundingClientRect(),
            elemRect = currentFocus.getBoundingClientRect(),
            topOffset = elemRect.top - bodyRect.top + inputHeight,
            leftOffset = elemRect.left - bodyRect.left;
            //leftOffset += request.oLeft;
        var heightNeeded = popupHeight + topOffset - document.documentElement.scrollTop;
        var inputWidth = currentFocus.clientWidth;

        $('#popup-'+request.index).css({left: request.oLeft});
        $('#popup-'+request.index).css({top:topOffset});

        if(auto_play_suggestions && enableVoice) {
            let suggestions = $('#popup-'+request.index).find('.spellingSuggestion');
            if(suggestions.length > 0 ) {
                ttsListener({toDo: "tts", toSay: generate_phrase(), option: voiceSelect});
                cur_playing_suggestions_id++;
                stop_playing_suggestions = false;
                setTimeout(play_suggestions, 2500, suggestions, 0, cur_playing_suggestions_id);
            }
        }
    }
};

/**
 * Generates phrases to be spoken when a word is mispelled
 */
function generate_phrase(){
    let to_say = ""

    //if dialogue is interrupted, we insert a cue phrase
    if (dialogue_interruption){
        let selected_phrase = Math.floor(Math.random() * cue_phrases.length);
        while (selected_phrase == last_cue_phrase)
            selected_phrase = Math.floor(Math.random() * cue_phrases.length);
        last_cue_phrase = selected_phrase;
        to_say += cue_phrases[selected_phrase] +", ";
    }

    //primary content phrase
    let selected_phrase = Math.floor(Math.random() * content_phrases.length);
    while (selected_phrase == last_content_phrase)
        selected_phrase = Math.floor(Math.random() * content_phrases.length);
    last_content_phrase = selected_phrase;
    to_say += content_phrases[selected_phrase];

    // Set interruption to true, if dialogue is interupted, we use a cue_phrase
    dialogue_interruption = true;
    return to_say;
}

/** function to auto-play sounds and images consecutivtely of a suggestion list */
function play_suggestions(suggestions, position, id) {
    if(position > 0) {
        $(suggestions[position-1]).parent().removeClass('button-glow');
        $(suggestions[position-1]).parent().removeClass('suggestionButtonAuto');
        if (enableImages === 1)
            $(suggestions[position-1]).parent().next().removeClass('button-glow');
        $('.imgWindow').hide();
    }
    if(stop_playing_suggestions){
        $(suggestions[position]).parent().removeClass('button-glow');
        $(suggestions[position]).parent().removeClass('suggestionButtonAuto');
        if (enableImages === 1)
            $(suggestions[position]).parent().next().removeClass('button-glow');
        $('.imgWindow').hide();
        stop_playing_suggestions = false;
        $('html,body').animate({scrollTop: $('.searchBar').offset().top});
        return;
    }
    if(id!=cur_playing_suggestions_id) {
        return;
    }
    if(position < suggestions.length) {
        $('html,body').animate({scrollTop: $(suggestions[position]).parent().offset().top - window.innerHeight*.60});
        $(suggestions[position]).parent().addClass('button-glow');
        $(suggestions[position]).parent().addClass('suggestionButtonAuto');
        ttsListener({toDo: "tts", toSay: $(suggestions[position]).text(), option: voiceSelect});
        if (enableImages === 1) {
            //$('.contentButton').css("margin-right", "5px");
            $(suggestions[position]).parent().next().addClass('button-glow');
            $(suggestions[position]).parent().next().show();
            //clickData.currentTarget.parentNode.parentNode.style = "margin-right: -2px;";
        }
    } else
    {
        $('html,body').animate({scrollTop: $('.searchBar').offset().top});
        dialogue_interruption = false;
    }

    position++;
    if(position <= suggestions.length)
        setTimeout(play_suggestions, 1500, suggestions, position, id);
}

/* Replaces the value in the text box with the corrected spelling */
$(document).on('click', '.spellingSuggestion', function(data) {
    stop_playing_suggestions = true;

    if (data.target.classList.contains('suggestion-speaker-button'))
        return;


    //logs to database
    callDBA('insertEvent',[5, "clk-spellsuggestion", {clicked: this.innerText, position: $(this).attr('id')}, qid]);

    var wraps = $(".wrapWord");
    var wordIndex = this.getAttribute('index');
    //var wordIndex = selectedWordData['index'];

    //Some input elements use .value, some use .innerhtml
    if(currentFocus && currentFocus.value && isEditable)
    {
        //var currentText = "" + currentFocus.value;
        //var replace = "\\b" + selectedWord + "\\b";
        //var re = new RegExp(replace,"g");
        //currentFocus.value = currentText.replace(re, this.innerText);
        wraps[wordIndex].html(this.innerText);
    }
    else if(currentFocus && currentFocus.innerHTML && isEditable)
    {
        //var currentText = "" + currentFocus.innerHTML;
        //var replace = "\\b" + selectedWord + "\\b";
        //var re = new RegExp(replace,"g");
        //currentFocus.innerHTML = currentText.replace(re, this.innerText);
        wraps[wordIndex].innerHTML = this.innerText;
    }

    //Find spelling errors
    parseInput(currentFocus);
    setCurrentCursorPosition(currentFocus.innerText.length +8);

    //remove popup
    var popup = document.getElementById("popup-"+wordIndex);
    if(popup) document.body.removeChild(popup);

    //turn off interruption phrases
    dialogue_interruption = false;
});

/* Event for clicking on the misspelled word in the popup*/
$(document).on('click', '#myPopupWord, #closeButton', function(data){
    stop_playing_suggestions = true;

    if (data.target.classList.contains('suggestion-speaker-button'))
        return;

    //logs
    callDBA('insertEvent',[15, "clk-misspell", {clicked: this.innerText}, qid]);

    //add to list of "correctly" spelled words
    ignore_list.push(this.getAttribute('spelling'));

    //sets caret in input
    setCurrentCursorPosition(currentFocus.innerText.length +8);

    //remove popup
    let wordIndex = this.getAttribute('index');
    var popup = document.getElementById("popup-"+wordIndex);
    if(popup) document.body.removeChild(popup);

    //turn off interruption phrases
    dialogue_interruption = false;
});

/**
 * General Function for making a call to the database
 * @param functionToCall - Name of function
 * @param argumentsPassed - Arguments in an array
 * @param request - Optional argument - provides arguments for createWindowFunc
 */
function callDBA(functionToCall, argumentsPassed, request) {
    if(functionToCall == "insertEvent") {
        eventNum++;
        argumentsPassed[2] = JSON.stringify(argumentsPassed[2]);
        argumentsPassed.push(eventNum);
    }
    //get new query ID after inserting query
    if(functionToCall == "insertQuery"){
        prev_qid = qid;
        qid = uuidv4();
        var searchTerm = $('.searchBar')[0].innerText;
        var cursor_position = getCurrentCursorPosition("search");
        searchTerm = searchTerm.replace(/[^\x00-\x7F]/g,' ');
        callDBA('insertEvent',[19, "initial-text", {text: searchTerm, searchResultsQid: prev_qid, imgConfig: enableImages, vceConfig: enableVoice}, qid]);
        //parseInput(currentFocus);
    }

    jQuery.ajax({
        type: "POST",
        url: '/cast-simple/php/callDBA.php',
        dataType: 'json',
        data: {functionname: functionToCall, arguments: argumentsPassed},
        success: function (Result) {
            if(functionToCall == "insertEvent"){
                if(request && request.todo == "createOnTypeWindow")
                {
                    request['eid'] = Result;
                    createWindowFunc(
                        request
                    );
                }
            }
            else if (functionToCall == "getEnableVoice") {
                enableVoice = parseInt(Result);
            }
            else if (functionToCall == "getEnableImages") {
                enableImages = parseInt(Result);
            }
            else if (functionToCall == "getEnablePopout") {
                enablePopout = parseInt(Result);
            }
            else if (functionToCall == "getEnableSplchk") {
                enablePopout = parseInt(Result);
            }
            else if (functionToCall == "getEnableBookmark") {
                enableBookmark = parseInt(Result);
            }
            else if (functionToCall == "latestQueries") {
                // console.log(Result);
                if(Result.length)
                    latestSearchTime = Result[0]['timeCreated'];
                $.each(Result.reverse(), function(index, value) {
                    $('.shelf-other-searches').prepend($('<div class="shelf-other-search"><a href="/cast-simple/replay?qid='+value['id']+'" target="_blank"><abbr title="'+value['term']+'">"'+value['term']+'"</abbr></a></div>'));
                    if ($('.shelf-other-searches').children().length > 5)
                    {
                        $('.shelf-other-searches').children().last().remove();
                    }
                });
            }
        },
        error: function(error, status, msg) {
			console.log(functionToCall, argumentsPassed, error, status, msg);
           send_slack_message("Call to DBA error: " + functionToCall +"\n" +
            "Arguments: " + argumentsPassed + "\n" +
            "error: " + JSON.stringify(error) + "\n" +
            "status: " + status + "\n" +
            "message: " + msg);
        }
    });
}

/* mouseleave event handling for spelling suggestions and search results */
$(document).on('mouseleave', '.spellingSuggestion, #myPopupWord, .searchResult', function(clickData) {

    if (clickData.target.className == "spellingSuggestion") {
        callDBA('insertEvent',[13, "hov-off-spellsuggestion", {hovered: clickData.target.innerText, position: clickData.target.id}, qid]);
        //remove image
        if (enableImages === 1 && !button_audio) {
            $('.imgWindow').hide();
            $('.contentButton').css("margin-right", "5px");
        }
    }
    else if (clickData.target.id == "myPopupWord") {
        callDBA('insertEvent',[12, "hov-off-misspelled", {hovered: clickData.target.parentElement.parentElement.firstChild.firstChild.innerText}, qid]);
    }
    else if (clickData.currentTarget.className == "searchResult") {
        callDBA('insertEvent',[14, "hov-off-result", {hovered: $(clickData.currentTarget.children[0]).attr('data-position')}, prev_qid]);
    }

});

/* mouseenter actions for spelling suggestions and search results */
$(document).on('mouseenter', '.spellingSuggestion, #myPopupWord, .searchResult', function(clickData) {

    if (clickData.target.className == "spellingSuggestion") {
        console.log("checking");
        callDBA('insertEvent',[4, "hov-spellsuggestion", {hovered: clickData.target.innerText, position: clickData.target.id}, qid]);

        var speech = clickData.target.innerText;
        if (enableVoice === 1 && !button_audio && !auto_play_suggestions){
            ttsListener({toDo: "tts", toSay: speech, option: voiceSelect});
		}
        /* Brings up image for hovered suggestion */
        if (enableImages === 1 && !button_audio) {
            $('.imgWindow').hide();
            $('.contentButton').css("margin-right", "5px");
            $(this.parentElement.nextSibling).show();
            //clickData.currentTarget.parentNode.parentNode.style = "margin-right: -2px;";
        }

    }
    else if (clickData.target.id == "myPopupWord") {
        callDBA('insertEvent',[3, "hov-misspelled", {hovered: clickData.target.parentElement.parentElement.firstChild.firstChild.innerText}, qid]);
        var speech = clickData.target.parentElement.parentElement.firstChild.firstChild.innerText;

        if (enableVoice === 1 && !button_audio)
            ttsListener({toDo: "tts", toSay: speech, option: voiceSelect});
    }
    else if (clickData.currentTarget.className == "searchResult") {
        callDBA('insertEvent',[10, "hov-result", {hovered: $(clickData.currentTarget.children[0]).attr('data-position')}, prev_qid]);
    }
});

$(document).on('click', '.suggestion-speaker-button', function(clickData){
    //TO-DO: record event
    console.log('entering click');
    var speech = $(this).parent().text()
    ttsListener({toDo: "tts", toSay: speech, option: voiceSelect});
    $(this).parent().parent().addClass('button-glow');
    if(enableImages){
        $(this).parent().parent().next().show();
        $(this).parent().parent().next().addClass('button-glow');
    }

    let that = $(this);
    setTimeout(function(that){
        that.parent().parent().removeClass('button-glow');
        if(enableImages){
            that.parent().parent().next().removeClass('button-glow');
        }
        that.parent().parent().next().hide();
    },1500, that);
});

/*records the mouse position whenever a right click is performed */
$(document).on('mouseup', function(data) {
    if(data.button == 2) {
        var sqlData = {clicked: data.target.localName};
        if(data.target.id)
            sqlData['clicked'] += "#" + data.target.id;//sqlData += "#" + data.target.id;
        if(data.target.className)
            sqlData['clicked'] += "." + data.target.className;
        if(data.currentTarget.activeElement.classList.value == "searchBar")
            sqlData['cursorPosition'] = getCurrentCursorPosition("search");
        sqlData['button'] = 2;
        callDBA('insertEvent',[2, data.type, sqlData, qid]);
    }
});

/* sets currentFocus to the textbox when the focus changes or on keyup*/
$(document).on('focus keyup click', 'input[type=text], [contenteditable="true"], textarea', function() {
    currentFocus = this;
 });

$(document).on('click', function(data) {
    if (data.target.className == "searchButton" || data.target.className == "fas fa-search") {
        //log click
        callDBA('insertEvent',[11, "clk-search", "", qid]);

        $('.myPopup').remove();
        stop_playing_suggestions = true;

        //log query
        searchTerm = $('.searchBar')[0].innerText.trim();
        searchTerm = searchTerm.replace(/[^\x00-\x7F]/g,' ');
        callDBA('insertQuery',[searchTerm, qid]);
        callDBA('insertEvent', [6, "query", {query: searchTerm, enableVoice: enableVoice, enableImages: enableImages}, prev_qid]);

        //make search bar uneditable
        $('#search').attr('contenteditable','false');

        //search
        $('#castHeader').addClass('topCastHeader');
        $('.container').addClass('resultView');
        window.history.pushState({query: searchTerm, searchBar: $(".searchBar").html()}, 'CAST search', window.location.pathname + '?q='+searchTerm)
        webSearchListener({toDo: "webSearch", keyword: searchTerm});

        //put loading icon
        $('#helper-search').hide();
        showGuide = false;
        $('.searchResults').html("");
        var loadingIcon = document.createElement('img');
        loadingIcon.setAttribute('src', '/cast-simple/assets/loading.gif');
        loadingIcon.id = 'loadingIcon';
        $('.searchResults').append(loadingIcon);
    }
    else {
        var selected = window.getSelection();
        var selRight = false;
       if (selected.focusNode.compareDocumentPosition(selected.anchorNode) == 4)
            selRight = false;
        else if (selected.focusNode.compareDocumentPosition(selected.anchorNode) == 2)
            selRight = true;
        else if (selected.focusNode.compareDocumentPosition(selected.anchorNode) == 0)
            selRight = selected.anchorOffset < selected.focusOffset;

        if (selected.toString().length > 0 && selected.toString() !== "") {
            lastSelected = selected.toString();
			callDBA('insertEvent',[7, "selection", {selection: lastSelected, cursorPosition: getCurrentCursorPosition("search"), selRight: selRight},  qid]);
        }
        else {
            if (!resultClicked) {
                lastSelected = selected;

                //var sqlData = "{clicked: " + data.target.localName;
                var sqlData = {clicked: data.target.localName};
                if(data.target.id)
                    sqlData['clicked'] += "#" + data.target.id;//sqlData += "#" + data.target.id;
                if(data.target.className)
                    sqlData['clicked'] += "." + data.target.className;
                if(data.currentTarget.activeElement.classList.value == "searchBar")
                    sqlData['cursorPosition'] = getCurrentCursorPosition("search");
                sqlData['button'] = 1;
                callDBA('insertEvent',[2, data.type, sqlData, qid]);
            }
            else {
                resultClicked = 0;
            }
        }
    }
});

 /* listener for getting an image results */
function gotImageListener(request){
    if(request.todo == "gotImage") {
        if (request.message == "success") {
            console.log(request);
            var eid = request.eid;
            var imageURL;
            if (request.cacheImage)
                imageURL = request.result;
            else
                imageURL = request.result.items[0].image.thumbnailLink; //.link
            console.log(imageURL);
            var query = request.query;

            callDBA('addUrlCache',[query, imageURL]);
            //callDBA('insertEvent',[20, "new image cache", JSON.stringify({word: query, url: imageURL}), qid]);

            $.extend(imageObj, {
                [query]: imageURL
            })

            if (imageObj[query]) {
                $('.castSuggest-'+query).each(function() {
                    $($(this).children()[1]).children()[0].src=imageURL;
                });
            }

            callDBA("insertSuggestionUrl", [eid, query, imageURL]);
        }
        else {
            send_slack_message("ERROR: Google Image Request Fail\n"
            + xhr.statusText + "\n"
            + textStatus + "\n"
            + JSON.stringify(error));
            console.log("FAILURE: IMAGE COULD NOT BE RETRIEVED");
            console.log(request.xhr.statusText);
            console.log(request.textStatus);
            console.log(request.error);
        }
    }
};

$(document).on('click','.exitWebFrame', function(event) {
    $('.webFrameContainer').hide();
    $('.webFrame').remove();
});

$(document).on('click','.resultLink', function(event){
    url = $(event.currentTarget).attr('href');
    pos = $(event.currentTarget).attr('data-position');
    resultClicked = 1;
    callDBA('insertEvent',[9, "clk-result", {position: pos}, prev_qid]);
});

$(document).on('click', '.searchNextButton', function(event) {
    callDBA('insertEvent',[26, "chirp-right", {}, prev_qid]);
    if(!$.isEmptyObject(nextPage)) {
        currPage += 1;
        let startIndex = (currPage * numPerPage) - 9 <= 100 ? (currPage * numPerPage) - 9 : 91;
        window.history.pushState({query: searchTerm, searchBar: $(".searchBar").html()}, 'CAST search', window.location.pathname + '?q='+searchTerm + '&start=' + startIndex);
        webSearchListener({toDo: "webSearch", keyword: searchTerm, start: startIndex});
    }

});

$(document).on('click', '.searchPreviousButton', function(event) {
    callDBA('insertEvent',[25, "chirp-left", {}, prev_qid]);
    if(!$.isEmptyObject(nextPage)) {
        currPage -= 1;
        if (currPage <= 0) {
            currPage = 1;
            window.history.pushState({query: searchTerm, searchBar: $(".searchBar").html()}, 'CAST search', window.location.pathname + '?q='+searchTerm);
            webSearchListener({toDo: "webSearch", keyword: searchTerm});
        } else {
            let startIndex = (currPage * numPerPage) - 9;
            window.history.pushState({query: searchTerm, searchBar: $(".searchBar").html()}, 'CAST search', window.location.pathname + '?q='+searchTerm + '&start=' + startIndex);
            webSearchListener({toDo: "webSearch", keyword: searchTerm, start: startIndex});
        }
    }

});


/**
 * onHover event that displays iFrame when hovering a search result
 */
$(document).on('mouseenter','.resultLink', function(event){
    //get URL and position of hovered link
    if(enablePopout === 1) {
    url = $(event.currentTarget).attr('href');
    pos = $(event.currentTarget).attr('data-position');

    //display the webframe container
    $('.webFrameContainer').show();

    $($('.newTab').parent()).attr('href', url);

    //remove last webframe (to stop sounds)
    /*
    cur_pos = $('.webFrame:not(.hide)').attr('data-position');
    if(cur_pos != undefined && cur_pos != pos) {
        cur_url = $('.webFrame:not(.hide)').attr('src');
        $('.iframe'+cur_pos).remove();
        createiframe(cur_url, cur_pos);
    }
    */
    if(!$('.iframe'+pos).length)
        createiframe(url, pos);

    //hide other frames, show new one
    $('.webFrame').hide();
    $('.iframe'+pos).show();
    }
});

jQuery.fn.visible = function() {
    return this.css('visibility', 'visible');
};

jQuery.fn.invisible = function() {
    return this.css('visibility', 'hidden');
};

/**
 * Creates the iFrame Container where we show previews of websites!
 */
function createiframeContainer(){
    //DIV container
    $('<div class="webFrameContainer resizable"></div>').appendTo(document.body);
    //drag bar
    $('<div class="dragBar"><a href="" target="_blank"><i class="fas fa-external-link-alt newTab"></i></a><i class="fas fa-times exitWebFrame"></i></div>').appendTo('.webFrameContainer');
    //make draggable
    $( ".webFrameContainer" ).draggable({
        handle: ".dragBar",
        iframeFix: true
    });
    //make resizable
    $('.webFrameContainer').resizable({
        handles: "n, e, s, w, ne, nw, se, sw",
        minHeight: 220,
        minWidth: 50,
        //Shrinking does not work on resizable Iframes unless a cover is placed over it
        start: function () {
            $(".webFrameContainer").each(function (index, element) {
                var d = $('<div class="iframeCover" style="zindex:99;position:absolute;width:100%;top:0px;left:0px;height:' + $(element).height() + 'px"></div>');
                $(element).append(d);
            });
        },
        stop: function () {
            $('.iframeCover').remove();
        },
    });
}

/**
 * Creates an iFrame, displaying the website from the given URL
 * @param  url - website to be shown
 * @param  pos  - position of the result on the page
 */
function createiframe(url, pos) {

    //create iframe and attach
    frame = $('<iframe class="webFrame iframe'+pos+'" src="'+url+'" data-position='+pos+' sandbox="allow-scripts allow-same-origin allow-forms"></iframe>')
    frame.appendTo('.webFrameContainer');
    //frame.hide();

    //make call to backend to see if X-Frame-Options are enabled, if so, replace the iframe with default message
    $.ajax({
        dataType: "json",
        type: "GET",
        url: "/cast-simple/php/xFrameCheck.php",
        data: {
            url : url
        },
        success: function(result) {
            if(!result)
            {
                console.log("REMOVING");
                var hidden = $('.iframe'+pos).is(":hidden");

                $('.iframe'+pos).remove();
                $('<div class="webFrame failFrame iframe'+pos+'">' +
                 '<a href=\"'+url+'\" target=\"_blank\">Click To Open Website!</a></div>').appendTo('.webFrameContainer');

                console.log(hidden);
                if(hidden)
                    $('.iframe'+pos).hide();
            }
            else{
                console.log("NOT REMOVING " + url);
            }
        },
        error: function(result) {
            console.log("ERROR REMOVING");
            console.log(result);
        }
    });


}




/*handles searches for multiple images*/
function multipleImageSearch(keyword, count) {
    $.ajax({
        dataType: "json",
        type: "GET",
        url: "https://cast.boisestate.edu/googleAPI/googleSearchImages.php",
        data: {
            "keyword" : keyword,
            "count" : count
        },
        success: function(result) {
            var imgSrc = result.items;
            $('.searchResults').html(""); //remove search results
            var searchImage = document.createElement('div');
            searchImage.classList.add("searchImage");
            var htmlStr = '<div class =\"row\">';


            for(i=0; i< 9; i+=3){
                htmlStr +=
                '<div class=\"column\">'+
                '<img class=\"resultImage\" src=\"'+ imgSrc[i].image.thumbnailLink +'\">' +
                '<img class=\"resultImage\" src=\"'+ imgSrc[i+1].image.thumbnailLink +'\">' +
                '<img class=\"resultImage\" src=\"'+ imgSrc[i+2].image.thumbnailLink +'\">' +
                '</div>';
            }
            htmlStr += '</div>';
            searchImage.innerHTML = htmlStr;
            $('.searchResults').append(searchImage);
        }
    });
}

function clickImages() {
    console.log("clicked");
    var searchTerm = $('.searchBar')[0].innerText.trim();
    searchTerm = encodeURI(searchTerm.replace(/[^\x00-\x7F]/g,' '));
    multipleImageSearch(searchTerm, 10);
}

/* Function to handle web search results */
function gotWebSearchListener(request){
    if(request.todo == "gotWebSearch") {
        console.log("test thing: ",searchTerm);

        if (enableChirp == 1) {
            $('#logo-container').html("");
            $('#logo-container').html("<a href='#'><img class='castLogo' src='/cast-simple/assets/chirp.jpg'/></a>");
        }

        //make search bar editable again, don't auto focus
        $('#search').attr('contenteditable','true');
        $('#search').blur();

        if (request.message == "success") {
            $('.searchResults').html("");

            if(request.result.items.length == 0 ) {
                $('.searchResults').html(
                "<h2>No search results found! :(</h2>"
                );
            }

            if (request.result.hasOwnProperty("queries")) {
                let queries = request.result.queries;
                if (queries.hasOwnProperty("nextPage")) {
                    nextPage = request.result.queries.nextPage;
                }

                if (queries.hasOwnProperty("previousPage")) {
                    prevPage = request.result.queries.previousPage;
                }
            }

            $('.webFrameContainer').remove();
            createiframeContainer();
            $('.webFrameContainer').hide();
            //Append text as the search results
            request.result.items.forEach( function(e, i) {
                var title = e.title.replace(/[^\x20-\x7E  ]/g, '');
                var url = e.link;
                var desc = e.snippet.replace(/[^\x20-\x7E  ]/g, '');
                var domain = e.displayLink;
                //var img = null;
                try {
                    var img = e.pagemap.metatags[0]["og:image"];
                    if(!img)
                        img = "/cast-simple/assets/image-not-found.png";
                    else if (!/^(?:[a-z]+:)?\/\//i.test(img))
                        img = "http://" + domain + img;
                }
                catch (e)
                {
                    var img ="/cast-simple/assets/image-not-found.png";
                }

                var position = i;
                var query = request.query;

                callDBA('logResult',[query.replace(/%20/g,' '), title, desc.replace(/\n/g, " "), url, position, prev_qid, img]);


                var searchResult = document.createElement('div');
                searchResult.classList.add("searchResult");

                if (enableChirp == 1) {
                    searchResult.innerHTML = '<div data-position=\"' + position + '\" class=\"no-dec resultLink\" href='+ url +'>' +
                                            '<div class = \"resultBox\">' +
                                                '<div class=\"clickBox row\" onclick="window.location=\'' + url + '\'">' +
                                                    '<div class=\"col-3 resultImageContainer\">' +
                                                        '<img class=\"resultImage\" src=\"'+img+'\" onerror="this.onerror=null; this.src=\'/cast-simple/assets/image-not-found.png\'">' +
                                                    '</div>' +
                                                    '<div class=\"col-9 resultTextContainer\">' +
                                                        '<div class=\"resultTitle\"><b>' +
                                                            HtmlEncode(title) +
                                                        '</b>'  +'</div>\n' +
                                                        '<div class=\"resultSnippet\">' +
                                                            HtmlEncode(desc).replace(/<br>/g, ' ') +
											         '</div>' +
                                                     '</div>' +
                                                '</div>' +

                                                '<div class=\"row text-center\">' +
                                                   '<div class=\"col-sm\">' +
                                                      '<span style="color: Tomato;" class="like-it"><i class=\"far fa-heart fa-2x\"></i></span>' +
                                                   '</div>' +
                                                   '<div class=\"col-sm\">' +
                                                      '<span class="like-it"><i class=\"far fa-thumbs-down fa-2x\"></i></span>' +
                                                   '</div>' +
                                                   '<div class=\"col-sm\">' +
                                                      getStarIcon(url) +
                                                   '</div>' +

                                                        '</div>' +

                                                '</div>' +'</b>' +
                                            '</div>' +'</b>' +
                                        '</div>';

                } else if (enableBookmark == 1) {
                    searchResult.innerHTML = '<a data-position=\"' + position + '\" class=\"no-dec resultLink\" '+getTarget()+' href=' + url + '>' +
                                            '<div class = \"resultBox\">' +
                                                '<div class=\"clickBox row\">' +
                                                    '<div class=\"col-3 resultImageContainer\">' +
                                                        '<img class=\"resultImage\" src=\"'+img+'\" onerror="this.onerror=null; this.src=\'/cast-simple/assets/image-not-found.png\'">' +
                                                    '</div>' +
                                                    '<div class=\"col-9 resultTextContainer\">' +
                                                        '<div class=\"resultTitle\"><b>' +
                                                            HtmlEncode(title) +
                                                        '</b>' + getStarIcon(url) +'</div>\n' +
                                                        '<div class=\"resultSnippet\">' +
                                                            HtmlEncode(desc).replace(/<br>/g, ' ') +
                                                        '</div>' +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' +
                                        '</a>';
                } else {
                    searchResult.innerHTML = '<div data-position=\"' + position + '\" class=\"no-dec resultLink\" '+getTarget()+' onlick="window.location=' + url + '">' +
                    '<div class = \"resultBox\">' +
                        '<div class=\"clickBox row\">' +
                            '<div class=\"col-3 resultImageContainer\">' +
                                '<img class=\"resultImage\" src=\"'+img+'\" onerror="this.onerror=null; this.src=\'/cast-simple/assets/image-not-found.png\'">' +
                            '</div>' +
                            '<div class=\"col-9 resultTextContainer\">' +
                                '<div class=\"resultTitle\"><b>' +
                                    HtmlEncode(title) +
                                '</b></div>\n' +
                                '<div class=\"resultSnippet\">' +
                                    HtmlEncode(desc).replace(/<br>/g, ' ') +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
                }

                //createiframe(url, position);

                $('.searchResults').append(searchResult);
            });
            if (enableChirp == 1) {
                $('.searchResults').append(
                    '<div class=\"paginationContainer\">' +
                    '<div class=\"row\">' +
                    '<div class=\"col-lg-6\"><button type=\"button\" class=\"btn btn-primary btn-large float-left searchPreviousButton\"><i class=\"fas fa-arrow-alt-circle-left\"></i> Previous</button></div>' +
                    '<div class=\"col-lg-6\"><button type=\"button\" class=\"btn btn-primary btn-large float-right searchNextButton\">Next <i class=\"fas fa-arrow-alt-circle-right\"></i></button></div>' +
                    '</div>' +
                    '</div>');
            }
        }

        else {
            /*send_slack_message("ERROR: Google Search Request Fail\n"
            + request.xhr.statusText + "\n"
            + textStatus + "\n"
            + JSON.stringify(error));*/
            console.log("FAILURE: IMAGE COULD NOT BE RETRIEVED");
            console.log("FAILURE: IMAGE COULD NOT BE RETRIEVED");
            console.log(request.xhr.statusText);
            console.log(request.textStatus);
            console.log(request.error);
        }
    }
};

function getTarget(){
    if(newTabs){
        return 'target=\"_blank\"';
    } else {
        return '';
    }
}

/* removes problematic characters*/
function HtmlEncode(s) {
  var el = document.createElement("div");
  el.innerText = el.textContent = s;
  s = el.innerHTML;
  return s .replace(/Â/g, "") .replace(/â/g, "");
};

/* Handles Enter button presses*/
$(document).on('keyup', 'input[type=text], [contenteditable="true"], textarea', function(data) {
    if (data.originalEvent.keyCode == 13) {
        //log enter
        var lastKey = "Enter";

        //make search bar uneditable
        $('#search').attr('contenteditable','false');

        $('.myPopup').remove()
        stop_playing_suggestions = true;

		//log query
        searchTerm = $('.searchBar')[0].innerText.trim();
        searchTerm = searchTerm.replace(/[^\x00-\x7F]/g,' ');
        callDBA('insertQuery',[searchTerm, qid]);
        callDBA('insertEvent', [6, "query", {query: searchTerm, enableVoice: enableVoice, enableImages: enableImages}, prev_qid]);

        //make search bar uneditable
        $('#search').attr('contenteditable','false');

		 //search
        $('#castHeader').addClass('topCastHeader');
        $('#navBar').show();
        $('.container').addClass('resultView');
        window.history.pushState({query: searchTerm, searchBar: $(".searchBar").html()}, 'CAST search', window.location.pathname + '?q='+searchTerm)
        webSearchListener({toDo: "webSearch", keyword: searchTerm});

        //put loading icon
        $('#helper-search').hide();
        showGuide = false;
        $('.searchResults').html("");
        var loadingIcon = document.createElement('img');
        loadingIcon.setAttribute('src', '/cast-simple/assets/loading.gif');
        loadingIcon.id = 'loadingIcon';
        $('.searchResults').append(loadingIcon);
    }
});

$(document).on("keypress paste", 'input[type=text], [contenteditable="true"], textarea', function (e) {
    if (this.innerText.length >= 128) {
        e.preventDefault();
        return false;
    }
});

/* handles most input */
$(document).on('input', 'input[type=text], [contenteditable="true"], textarea', function(data) {
    //don't do this if the input is an enter key
    if(data.originalEvent.inputType == 'insertParagraph'){
        return;
    }

    //hide helper
    $('#helper-type').stop().animate({
        opacity: 'hide'
    });

    //get current cursor position and log event
    curPos = getCurrentCursorPosition("search");
    callDBA('insertEvent',[1, "keystroke", {key: $('#search').text(), pos: curPos}, qid]);

    //parse input for spelling errors
    var lastKey = data.originalEvent.data;
    var inputText = this.innerText;
    //console.log(inputText.charAt(inputText.length-1), inputText.charAt(inputText.length-1)==" ");
    if((lastKey && lastKey.match(/[  .,\/#!?$%\^&\*;:{}=\-_`~()]/)) || inputText.length == 1
     || inputText.charAt(inputText.length-1).match(/[  .,\/#!?$%\^&\*;:{}=\-_`~()]/))
    {
        parseInput(currentFocus);
        setCurrentCursorPosition(curPos+8);
    }
    //check in 1 second if string needs to be parsed
    lastInputTime = new Date().getTime() / 1000;
    setTimeout(function() {
            DelayedSpellCheck();
    },1000);
    setTimeout(function() {
        DelayedGuide();
    },2000);
});

 /* Performs a spell check if it has been at least 1 second since the last input */
function DelayedSpellCheck() {
    var curTime = new Date().getTime() / 1000;
    var timeSinceLastInput = curTime - lastInputTime;
    if(timeSinceLastInput >= 1.0)
    {
        curPos = getCurrentCursorPosition("search");
        parseInput(currentFocus);
        setCurrentCursorPosition(curPos+8);
    }
    $("#search")[0].scrollLeft = $("#search")[0].scrollWidth;
};

function DelayedGuide() {
    var curTime = new Date().getTime() / 1000;
    var timeSinceLastInput = curTime - lastInputTime;
    if(timeSinceLastInput >= 2.0)
    {
        if(showGuide) {
            $('#helper-search').css("display", "flex").hide();
            $('#helper-search').animate({
                opacity: 'show'
            }, 2000);
            showGuide = false;
        }
    }
}

/* Splits a string by spaces, but includes the spaces as seperate elements in the array */
function customSplit(str) {
    var word = "";
    var array = [];
    for (var i=0; i<str.length; i++){
        var char = str.charAt(i);
        if(char.match(/[  .,\/#!\"$%\^&\*;:{?}=\-_`~()]/)) {
            if(word)
                array.push(word);
            array.push(char);
            word = "";
        }
        else {
            word = word + char;
        }
    }
    if(word)
        array.push(word);
    return array;
};

/* Spellchecks the input and marks misspelled words */
function parseInput(input) {
    var misspells = [];
    var inputText = input.textContent || input.innerText;
    var words = customSplit(inputText);
    input.innerHTML = "";
    console.log("PARSE INPUT",words);
    $.each(words, function(i, v) {
        if (!(/[A-Za-z]/i.test(v))) { //if it does not contain alphabetic characters, don't spell check
            if (checkStopWords && stopwords.includes(v.toLowerCase())) {
                $(".searchBar").append($("<span class=\"stopWord\">").text(v));
            } else {
                if(v==" ")
                    $(".searchBar").append($("<span>").html('&nbsp;'));
                else
                    $(".searchBar").append($("<span>").text(v));
            }
        } else {
            var correct = dictionary.check(v.replace(/^[ .,\/\"#!?$%\^<>&\*;:{}=\-_`~()]+|[ .,\/#!\"?$%\^<>&\*;:{}=\-_`~()]+$/g, ""));
            if (!correct) {
                console.log("checking includes",v, seen_misspells);
                if(seen_misspells.includes(v))
                    $(".searchBar").append($("<span class=\"wrapWord wrapWordBorder\">").text(v));
                else
                    $(".searchBar").append($("<span class=\"wrapWord\">").text(v));
                misspells.push(v);
                seen_misspells.push(v);
            }
            else if (checkStopWords && stopwords.includes(v.toLowerCase())) {
                $(".searchBar").append($("<span class=\"stopWord\">").text(v));
            }
            else {
                $(".searchBar").append($("<span>").text(v));
            }
        }
    });
    misspells = Array.from(new Set(misspells));
    var log_info = {misspelled_words: misspells};
    callDBA('insertEvent',[16, "input-parsed", log_info, qid]);

    //Check the amount of wrap words - remove extra
    var wraps = $(".wrapWord");
    var popups = $(".myPopup");
    for(i=wraps.length; i<popups.length; i++)
    {
        $('#popup-'+i).remove();
        stop_playing_suggestions = true;
    }
};

/* Functions handling cursor position */
function setCaretPosition(ctrl, pos) {
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(ctrl, pos);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
};

function setCurrentCursorPosition(chars) {
    if (chars >= 9) {
        var selection = window.getSelection();

        range = createRange(document.getElementById("search").parentNode, { count: chars });

        if (range) {
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
};

function createRange(node, chars, range) {
    if (!range) {
        range = document.createRange()
        range.selectNode(node);
        range.setStart(node, 0);
    }

    if (chars.count === 0) {
        range.setEnd(node, chars.count);
    } else if (node && chars.count >0) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.length < chars.count) {
                chars.count -= node.textContent.length;
            } else {
                range.setEnd(node, chars.count);
                chars.count = 0;
            }
        } else {
           for (var lp = 0; lp < node.childNodes.length; lp++) {
                range = createRange(node.childNodes[lp], chars, range);

                if (chars.count === 0) {
                    break;
                }
            }
        }
    }

    return range;
};

function isChildOf(node, parentId) {
    while (node !== null) {
        if (node.id === parentId) {
            return true;
        }
        node = node.parentNode;
    }

    return false;
};

function getCurrentCursorPosition(parentId) {
    var selection = window.getSelection(),
        charCount = -1,
        node;

    if (selection.focusNode) {
        if (isChildOf(selection.focusNode, parentId)) {
            node = selection.focusNode;
            charCount = selection.focusOffset;

            while (node) {
                if (node.id === parentId) {
                    break;
                }

                if (node.previousSibling) {
                    node = node.previousSibling;
                    charCount += node.textContent.length;
                } else {
                     node = node.parentNode;
                     if (node === null) {
                         break
                     }
                }
           }
      }
   }

   return charCount;
};

/** listener for when a misspelled word (.wrapword) is inserted */
$(document).on('DOMNodeInserted','.wrapWord',function(data) {
    if(dictionary.check(this.innerText.replace(/^[ .,\/#!?$%\^<>&\"\*;:{}=\-_`~()]+|[ .,\/#!?$\"%\^<>&\*;:{}=\-_`~()]+$/g, "")))
        return;
    if($(this).hasClass('wrapWordBorder'))
        return;

    /** playing alert */
    if(alert_sound) {
        audio = new Audio('/cast-simple/assets/sounds/spelling_alert.wav');
        audio.play();
    }


    /** creating circle */
    var stroke_w = 3.0;
    var rx = ($(this).width()/2.0)+7+1.75; // 7 for padding on borders
    var ry = ($(this).height()/2.0)+1.75;
    var svg_w = rx*2 + stroke_w;
    var svg_h = ry*2 + stroke_w;
    var cx = rx + stroke_w/2.0;
    var cy = ry + stroke_w/2.0;
    var circle = $('<svg height="'+svg_h+'" width="'+svg_w+'">'
        +'<ellipse class="circle" cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" stroke="red" stroke-width="'+stroke_w+'" fill-opacity="0" />'
    + '</svg>');
    var word_position = $(this).offset();
    word_position.top = word_position.top - 3.25;
    word_position.left = word_position.left-3;
    console.log("word_position", word_position);
    circle.css(word_position);
    $('body').append(circle);
    console.log("this",$(this));
    let this_to = $(this);
    console.log('timeout starting');
    window.setTimeout(function(this_to){
        console.log('timeout entered');
        this_to.addClass("wrapWordBorder");
        circle.remove();
    }, 1500, this_to);
    //$(this).delay(1500).addClass('wrapWordBorder');
    /** end of creating circle **/


});

/* Handles events for hovering misspelled word in query */
$(document).on('mouseenter DOMNodeInserted', '.wrapWord', function(data) {
    if(dictionary.check(this.innerText.replace(/^[ .,\/#!?$%\^<>&\"\*;:{}=\-_`~()]+|[ .,\/#!?$\"%\^<>&\*;:{}=\-_`~()]+$/g, "")))
        return;

    console.log($(this).text());
    if (data.type == "DOMNodeInserted" && (!autoPopup || ignore_list.includes($(this).text())))
        return;

    var popup = document.getElementById("myPopup");
    var pOffset = 0;
    var wOffset = data.currentTarget.offsetLeft;
    var absolute_wOffset =this.getBoundingClientRect().left;

    if (popup) pOffset = Math.floor((popup.offsetLeft) - (currentFocus.getBoundingClientRect().left - document.body.getBoundingClientRect().left));

    if (popup != null && (pOffset == wOffset)) {
        //console.log("Popup is already open. Do not call API");
    } else {
        var oldword = data.target.innerText.trim().replace(/^[ .,\/#!?\"$%\^&\*;:{}=\-_`~()]+|[ .,\/#!?\"$%\^&\*;:{}=\-_`~()]+$/g, "");
        var word = oldword.replace(/\d/g, "");
        var array_of_suggestions = [];
        var wraps = $(".wrapWord");

        var wordIndex;
        for (var n = 0; n < wraps.length && wordIndex == null; n++) {
            if (wraps[n].offsetLeft == wOffset) {
                wordIndex = n;
            }
        }
        this.setAttribute('index',wordIndex);

        selectedWordData = {word: word, index: wordIndex};

        if (word.length < 29) {
            //Update Suggestion Cache
            console.log("about to do ajax call");
            console.log("SC: " + enableSplchk===true?'Splchk':'Hunspell');
            $.ajax({
                type: "POST",
                url: '/cast-simple/php/callDBA.php',
                dataType: 'json',
                data: {functionname: "checkSuggestCache", arguments: [word]},
                success: async function(result) {
                    console.log("result " + result);
                    if (result == 1) {
                        //not found in cache

                        let splchk = enableSplchk===1?true:false;
                        const res = await spellcheckListener({toDo: "spellCheck", keyword: word, splchk: splchk});
                        console.log(res);
                        array_of_suggestions = res.suggestions;
                        // array_of_suggestions = dictionary.suggest(word);

                        //if no suggestions, try prefix
                        /*
                        for (var i = word.length; (array_of_suggestions.length == 0 && i > 0); i--) {
                            array_of_suggestions = dictionary.suggest(word.substring(0,i));
                        }
                        */

                        callDBA('addSuggestCache',[word, array_of_suggestions]);

                        var request = {
                            todo: "createOnTypeWindow",
                            selectedWord: oldword,
                            arrayOfSuggestions: array_of_suggestions,
                            editable: true,
                            oLeft : absolute_wOffset,
                            index: wordIndex
                        };
                        callDBA('insertEvent',[8, "popup", {misspell: word, suggestions: array_of_suggestions, index: wordIndex}, qid], request);
                    } else {
                        //found in cache
                        $.ajax({
                            type: "POST",
                            url: '/cast-simple/php/callDBA.php',
                            dataType: 'json',
                            data: {functionname: "getSuggestCache", arguments: [word]},
                            success: function(result) {
                                array_of_suggestions = result;

                                var request = {
                                    todo: "createOnTypeWindow",
                                    selectedWord: oldword,
                                    arrayOfSuggestions: array_of_suggestions,
                                    editable: true,
                                    oLeft : absolute_wOffset,
                                    index: wordIndex
                                };
                                callDBA('insertEvent',[8, "popup", {misspell: word, suggestions: array_of_suggestions, index: wordIndex}, qid], request);
                            },
                            error: function(error, status, msg) {
                                send_slack_message("ERROR: Suggestion Cache Retrieval Fail\n"+
                                "error: " + JSON.stringify(error) + "\n" +
                                "status: " + status + "\n" +
                                "message: " + msg);
                            }
                        });
                    }
                },
                error: function(error, status, msg) {
                    console.log(error);
                    send_slack_message("ERROR: Suggestion Cache Lookup Fail\n"+
                    "error: " + JSON.stringify(error) + "\n" +
                    "status: " + status + "\n" +
                    "message: " + msg);
                }
            });

        }

    }
});

/* creates uuid */
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

function newSessionHandler(result) {
    location.reload();
}

$(document).on('click', '#dropdown_session', function(event) {
    jQuery.ajax({
        type: "POST",
        url: '/cast-simple/php/callDBA.php',
        dataType: 'json',
        data: {functionname: "createSession", arguments: {}},
        success: function (Result) {
            newSessionHandler(Result);
        },
        error: function(error, status, msg) {
        console.log(error, status, msg);
		    // send_slack_message("ERROR: Images/Session switch failed\n"+
            // "error: " + JSON.stringify(error) + "\n" +
            // "status: " + status + "\n" +
            // "message: " + msg);
        }
    });
});

$(document).on('click', '#dropdown_tab', function(event) {
    let height = $('#dropdown_menu').height();
    console.log(height);
    height > 0?$('#dropdown_session').animate({marginTop: -60}):$('#dropdown_session').animate({marginTop: 10});
    height > 0?$('#dropdown_menu').animate({height: 0}):$('#dropdown_menu').animate({height: 60});
});


/* on load */
$(document).ready(function() {

    /*show guide*/
    if(showGuide) {
        $('#helper-type').animate({
            opacity: 'show'
        }, 2000);
    }

    // $("#").show();

    /* params */
    let params = new URLSearchParams(window.location.search);
    if (params.has('q')){
        searchTerm = params.get('q');
        console.log(searchTerm);

        //search
        $('#castHeader').addClass('topCastHeader');
        $('#navBar').show();
        $('.container').addClass('resultView');
        webSearchListener({toDo: "webSearch", keyword: searchTerm});

        //put loading icon
        $('#helper-search').hide();
        showGuide = false;
        $('.searchResults').html("");
        var loadingIcon = document.createElement('img');
        loadingIcon.setAttribute('src', '/cast-simple/assets/loading.gif');
        loadingIcon.id = 'loadingIcon';
        $('.searchResults').append(loadingIcon);
    }


    jQuery.ajax({
        type: "POST",
        url: '/cast-simple/php/callDBA.php',
        dataType: 'json',
        data: {functionname: "getEnableImages", arguments: [qid]},
        success: function (Result) {
            enableImages = parseInt(Result.images);
            enableVoice = parseInt(Result.voice);
            enablePopout = parseInt(Result.popout);
            enableSplchk = parseInt(Result.splchk);
            enableBookmark = parseInt(Result.bookmark);
            enableSession = parseInt(Result.shortSession);
            enableChirp = parseInt(Result.chirp);
            if (enableBookmark == 0) {
                $('#bookmarks').css('display', 'none');
            }
            if(enableSession == 0) {
                $('#short_sessions').css('display', 'none');
            }
            console.log("" + enableImages + ", " + enableVoice + ", " + enablePopout + ", " + enableSplchk + ", " + enableBookmark + ", " + enableChirp);
            callDBA('insertEvent',[18, "init config for new qid", {imgConfig: enableImages, vceConfig: enableVoice}, qid]);
            $('.searchBar').attr('contenteditable','true');
            $(".searchBar").focus();
        },
        error: function(error, status, msg) {
        console.log(error, status, msg);
		    send_slack_message("ERROR: Images/Voice Config look up failed\n"+
            "error: " + JSON.stringify(error) + "\n" +
            "status: " + status + "\n" +
            "message: " + msg);
        }
    });
});


/* detect history change */
window.onpopstate = function(e){
    /* params */
    let params = new URLSearchParams(window.location.search);
    $(".searchBar").html(e.state['searchBar']);
    if (params.has('q')){
        searchTerm = params.get('q');

        //search
        $('#castHeader').addClass('topCastHeader');
        $('#navBar').show();
        $('.container').addClass('resultView');
        webSearchListener({toDo: "webSearch", keyword: searchTerm});

        //put loading icon
        $('#helper-search').hide();
        showGuide = false;
        $('.searchResults').html("");
        var loadingIcon = document.createElement('img');
        loadingIcon.setAttribute('src', '/cast-simple/assets/loading.gif');
        loadingIcon.id = 'loadingIcon';
        $('.searchResults').append(loadingIcon);
    }
};
