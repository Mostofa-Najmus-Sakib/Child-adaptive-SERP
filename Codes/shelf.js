var shelf = [];
var latestSearchTime = 0;
$(function() {
    if($.cookie('shelf') != undefined){
        shelf = JSON.parse($.cookie('shelf'));
        $.each(shelf, function(index, value) {
            var url = value['url'];
            var title = value['title'];
            $('#sortable').append($('<li class="shelf-item"><a href="'+url+'" target="_blank" class="shelf-link"><abbr title="'+title+'">'+title+'</abbr></a><i class="fas fa-star shelf-star"></i></li>'));
        });
    }
    callDBA('latestQueries', [0]);
    setInterval(function(){ callDBA('latestQueries',[latestSearchTime])}, 3000);
});

$(document).on('click', '.shelf-open', function() {
    $('.shelf').toggleClass('open');
    $('.shelf-open-button .fas').toggleClass('fa-caret-right').toggleClass('fa-caret-left');
});

$(document).on('click', '.favorite-star', function(e) {
    e.preventDefault();
    $(this).finish();
    var title = $(this).parent().text()
    var url = $($(this).parents()[4]).attr('href');
    if($(this).hasClass('far')) {
        $(this).toggleClass('far').toggleClass('fas');
        $(this).css('position', 'absolute');
        $(this).animate({left: '10px'}, function () { 
            $('#sortable').append($('<li class="shelf-item"><a href="'+url+'" target="_blank" class="shelf-link"><abbr title="'+title+'">'+title+'</abbr></a><i class="fas fa-star shelf-star"></i></li>'));
            saveCookie();
            $(this).hide('explode', function() {
                $(this).removeAttr('style'); 
                $(this).hide();
                $(this).show("scale",{}, 1000);
            });
        });
    } else {
        $(this).toggleClass('far').toggleClass('fas');
        removeFromShelfItems(url);
        saveCookie();
    }
});

function removeFromShelfItems(url) {
    $('.shelf-link').each( function() {
        if($(this).attr('href') == url )
            $(this).parent().remove();
    });
}

function isUrlInShelf(url){
    var toReturn = false;
    $('.shelf-link').each( function() {
        if($(this).attr('href') == url )
        {
            toReturn = true;
            return false;
        }
    });
    return toReturn;
}

function getStarIcon(url) {
    if(isUrlInShelf(url)) {
        return '<i class="fas fa-star favorite-star"></i>';
    }
    else {
        return '<i class="far fa-star favorite-star"></i>';
    }
}

// modified

$(document).on('click', '.like-it', function(e) {
	e.stopPropagation();
	e.preventDefault();
    if ($(this).find("i").hasClass("fas")) {
        $(this).find("i").removeClass("fas");
        // move this to the end
        $(this).parents('.searchResult').hide().insertAfter(".searchResults .liked-before:last").slideDown().removeClass("liked-before");
    } else {
        $(this).find("i").addClass("fas");
        // Just added to fav
        // move this to top
        if ($(".searchResults .liked-before").length > 0) {
            $(this).parents('.searchResult').hide().insertAfter(".searchResults .liked-before:last").slideDown().addClass("liked-before");
        } else{
            $(this).parents('.searchResult').hide().prependTo(".searchResults").slideDown().addClass("liked-before");
        }
        
        let pos = $(this).parent(".searchResult").attr('data-position');

        callDBA('insertEvent',[29, "chirp-favorite", {position: pos}]);

        // thisResult = $(this).parent(".searchResult");
    }
	
	
})
	

$(document).on('click', '.shelf-star', function() {
    url = $(this).prev().attr('href');
    $(this).parent().remove();
    $('.favorite-star').each( function () {
        if(url == $($(this).parents()[4]).attr('href')) {
            $(this).toggleClass('far').toggleClass('fas');
        } 
    });
    saveCookie();
})

function saveCookie() {
    shelf = [];
    $('.shelf-link').each( function() {
        shelf.push({url:$(this).attr('href'), title:$(this).text()});
    });
    $.cookie('shelf', JSON.stringify(shelf), { expires: 7 });
    console.log(JSON.parse($.cookie('shelf')));
}