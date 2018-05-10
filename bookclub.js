/*
    Deal with page refresh
*/
if (performance.navigation.type == 1) {
     location.replace("bookclub.html");
 }

//global variable for incrementing stuff
var book_num = 0;
var bookList;
var tile_htmlString;


/* Called when the user pushes the "submit" button */
/* Sends a request to the API using the JSONp protocol */
function newRequest() {
    book_num = 0;

    on();
    reset_overlay_elements(); //so stuff doesn't stay hidden forever

    var title = document.getElementById("title").value;
    title = title.trim();
    title = title.replace(" ","+");

    var author = document.getElementById("author").value;
    author = author.trim();
    author = author.replace(" ","+");

    var isbn = document.getElementById("isbn").value;
    isbn = isbn.trim();
    isbn = isbn.replace("-","");

    // Connects possible query parts with pluses
    var query = ["",title,author,isbn].reduce(fancyJoin);

    // The JSONp part.  Query is executed by appending a request for a new
    // Javascript library to the DOM.  It's URL is the URL for the query.
    // The library returned just calls the callback function we specify, with
    // the JSON data we want as an argument.
    if (query != "") {
        hide_not_found();
        hide_bad_search();
        var box_and_arrows_div = document.getElementById("box_and_arrows");
        var keep_button = document.getElementById("keep");
        box_and_arrows_div.style.display = "block";
        keep_button.style.display = "block";

        // remove old script
        var oldScript = document.getElementById("jsonpCall");
        if (oldScript != null) {
            document.body.removeChild(oldScript);
        }
        // make a new script element
        var script = document.createElement('script');

        // build up complicated request URL
        var beginning = "https://www.googleapis.com/books/v1/volumes?q="
        var callback = "&callback=handleResponse"

        script.src = beginning+query+callback
        script.id = "jsonpCall";

        // put new script into DOM at bottom of body
        document.body.appendChild(script);
    }//end if
    else {
        hide_white_box(); //no query so SHOW not_found
        hide_bad_search();
    }

} /*end newRequest*/

function hide_white_box() {
    var box_and_arrows_div = document.getElementById("box_and_arrows");
    var keep_button = document.getElementById("keep");

    box_and_arrows_div.style.display = "none";
    keep_button.style.display = "none";
} //end hide_white_box

function hide_not_found() {
    var not_found_div = document.getElementById("not_found");
    not_found_div.style.display = "none";
} //end hide_not_found

function hide_bad_search() {
    var bad_search_div = document.getElementById("bad_search");
    bad_search_div.style.display = "none";
}

function reset_overlay_elements() {
    var box_and_arrows_div = document.getElementById("box_and_arrows");
    var keep_button = document.getElementById("keep");
    var not_found_div = document.getElementById("not_found");
    var bad_search_div = document.getElementById("bad_search");

    box_and_arrows_div.style.display = "block";
    keep_button.style.display = "block";
    not_found_div.style.display = "block";
    bad_search_div.style.display = "block";
}

function reveal_search() {
    var author_input = document.getElementById("author_input");
    var title_input = document.getElementById("title_input");
    var isbn_input = document.getElementById("isbn_input");
    var search_button = document.getElementById("search_button");

    author_input.style.display = "block";
    title_input.style.display = "block";
    isbn_input.style.display = "block";
    search_button.style.display = "block";

    var or1 = document.getElementById("or1");
    var or2 = document.getElementById("or2");
    or1.style.display = "block";
    or1.style.fontWeight = "700";
    or1.style.color = "#4A73FF";
    or1.style.fontSize = "x-large";
    or2.style.display = "block";
    or2.style.fontWeight = "700";
    or2.style.color = "#4A73FF";
    or2.style.fontSize = "x-large";
}

/* Used above, for joining possibly empty strings with pluses */
function fancyJoin(a,b) {
    if (a == "") { return b; }

        else if (b == "") { return a; }

        else { return a+"+"+b; }

}
 /*end fancyJoin*/


/* The callback function, which gets run when the API returns the result of our query */
// Do all this when the page has loaded
function handleResponse(bookListObj) {
     bookList = bookListObj.items; //stores every possible result
     if (bookListObj.totalItems == 0) {
         hide_white_box();
         displayError();
         // var not_found_div = document.getElementById("not_found");
         // not_found_div.style.display = "none";

     } else {
             return_ith_book();
     }
} //end handleResponse

function displayError(){
    var not_found_div = document.getElementById("not_found");
    not_found_div.style.display = "block";
}

function return_ith_book() {
    var book = bookList[book_num];

    // Start off by defining a variable called htmlString
    var htmlString = '<div id="white_box">';

    // htmlString += '<div>'; // start of div
    htmlString += '<img src="' + book.volumeInfo.imageLinks.thumbnail + '" alt="' + book.id + '" title="' + book.id + '", class ="img-thumbnail img-responsive"/><br/>'; //book thumbnail
    htmlString += '<div id="book_info"><h1 id="book_title">' + book.volumeInfo.title + '</h1>'; //book title

    $.each(book.volumeInfo.authors, function (i, author) {
                    if (i==0) {
                            htmlString += '<h2 id="author_name">by ' + author;
                    }
                    else {
                            htmlString += ', ' + author;
                    }
            });

    htmlString += '</h2><div id="book_description">' + get_description(book.volumeInfo.description) + '</div>'; // book description
    htmlString += '</div>'; // end div book_info

    // And then wherever there's a div with an ID of 'white_box' in the HTML, replace it with our htmlString. See over on the right for the results!
    $('#replace_here').html(htmlString + "</div>");

    tile_htmlString = htmlString + "</div>";
    // return htmlString;
}

function next_book() {
    if (book_num === bookList.length) {
        book_num = bookList.length;
    } else {
        book_num++;
    }
    return_ith_book();
}

function prev_book() {
    if (book_num > 0) {
        book_num--;
    }
    else if (book_num === 0) {
        book_num = 0;
    }
    return_ith_book();
}

function get_description(desc_str) {
    var word_count = 0;
    var str = '';

    for (i = 0; i < desc_str.length; i++) {
        if (word_count === 30) { //stop at 30
            if (i < desc_str.length) {
                str += '...';
            }
            break;
        }

        str += desc_str[i]; //build onto strong

        if (desc_str[i] === " ") { //if we reach a space, count word
            word_count++;
        }
    }

    return str;
}

function createTile() {
    var newTile = document.createElement("div");
    newTile.id = 'tile';

    var close_button = document.createElement("button");
    var x = document.createTextNode("X");
    close_button.appendChild(x);
    close_button.id='tile_close';

    close_button.onclick = function () {
        newTile.parentElement.removeChild(newTile);
    };
    document.body.appendChild(close_button);

    var info = document.getElementById("white_box");
    var title = document.getElementById("book_title");
    var author = document.getElementById("author_name");
    info.style.width = "350px";
    info.style.height = "250px";
    title.style.fontSize = "large";
    author.style.fontSize = "large";

    newTile.appendChild(close_button);
    newTile.appendChild(info);
    var element = document.getElementById("bookDisplay");
    element.appendChild(newTile);
}

function change_page() {
    sessionStorage.setItem('first_tile_info', document.getElementById("white_box"));
    document.location.href = "tilepage.html";
}
//
// function print_first_tile() {
//  alert("in function!");
//  // var info = sessionStorage.getItem('first_tile_info');
//  // var newTile = document.createElement("div");
//  // newTile.id = 'tile';
//  // newTile.appendChild(info);
//  // var element = document.getElementById("bookDisplay");
//  // element.appendChild(newTile);
// }



/*
    Code taken from W3Schools link on how to use Overlay
*/
 function on() {
     document.getElementById("overlay").style.display = "block";
 } //end on()

 function off() {
     document.getElementById("overlay").style.display = "none";
 } //end off()


/*
        GLOBAL VARIABLES/OBJECTS
*/

// to be able to search for an item upon pressing ENTER
var authorInput = document.getElementById("author");
var titleInput = document.getElementById("title");
var isbnInput = document.getElementById("isbn");

authorInput.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("search").click();
    }
});

titleInput.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("search").click();
    }
});

isbnInput.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("search").click();
    }
});
