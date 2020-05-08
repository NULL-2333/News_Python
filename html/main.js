// api_address = "http://127.0.0.1:5000"

api_address = "http://ychen875.us-west-1.elasticbeanstalk.com"

var category_all;
function openNewsPage(){
    // alert("Google News");
    document.getElementById("Search").style.color = 'black';
    document.getElementById("Search").style.background = '#f3f3f3';
    document.getElementById("Google").style.color = 'white';
    document.getElementById("Google").style.background = '#545454';
    document.getElementById("Google_News_Section").style.removeProperty('display');
    document.getElementById("Search_Section").style.display = 'none';
}

function openSearchPage(){
    // alert("Search");
    document.getElementById("Google").style.color = 'black';
    document.getElementById("Google").style.background = '#f3f3f3';
    document.getElementById("Search").style.color = 'white';
    document.getElementById("Search").style.background = '#545454';
    document.getElementById("Search_Section").style.removeProperty('display');
    document.getElementById("Google_News_Section").style.display = 'none';
}

function constructGoogleNewsSection(){
    getTopNews(); 
    getTopNewsWithSource('cnn'); 
    getTopNewsWithSource('fox-news');
    getWordCloud();
}

function getTopNews(){
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', api_address + "/top_news", true);
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4) 
        { 
            if (xhttp.status == 200) {
                var json = JSON.parse(xhttp.responseText);
                if(typeof(json) == 'string'){
                    alert(json);
                    return false;
                }
                document.getElementById("Top_News").style.backgroundImage = "url(" + json.articles[0].urlToImage + ")";
                document.getElementById("Top_News_And_Wordcloud").children[0].href = json.articles[0].url;
                document.getElementById("Top_News_Content").children[0].innerHTML = json.articles[0].title;
                document.getElementById("Top_News_Content").children[1].innerHTML = json.articles[0].description;
                i = 1;
                setInterval(function(){
                    i = changeTopNews(i, json)
                },5*1000);
            }
        }
    };
    xhttp.send(null);
}

function changeTopNews(i, json){
    if(i >= 5){
        i = i % 5;
    }
    document.getElementById("Top_News").style.backgroundImage = "url(" + json.articles[i].urlToImage + ")";
    document.getElementById("Top_News_And_Wordcloud").children[0].href = json.articles[i].url;
    document.getElementById("Top_News_Content").children[0].innerHTML = json.articles[i].title;
    document.getElementById("Top_News_Content").children[1].innerHTML = json.articles[i].description;
    i += 1;
    return i;
}

function getTopNewsWithSource(source){
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', api_address + "/source=" + source, true);
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4) 
        { 
            if (xhttp.status == 200) {
                var json = JSON.parse(xhttp.responseText);
                if(typeof(json) == 'string'){
                    alert(json);
                    return false;
                }
                if(source == 'cnn'){
                    for(i = 0; i < 4; i += 1){
                        document.getElementById("CNN_News").children[1].children[i].href = json.articles[i].url;
                        document.getElementById("CNN_News").children[1].children[i].children[0].children[0].innerHTML = "<img src='" + json.articles[i].urlToImage + "' alt='test' style='width: 100%; height: 100px; border-radius: 3px'>";
                        document.getElementById("CNN_News").children[1].children[i].children[0].children[1].innerHTML = json.articles[i].title;
                        document.getElementById("CNN_News").children[1].children[i].children[0].children[2].innerHTML = json.articles[i].description;
                    }
                }
                else if(source == 'fox-news'){
                    for(i = 0; i < 4; i += 1){
                        document.getElementById("Fox_News").children[1].children[i].href = json.articles[i].url;
                        document.getElementById("Fox_News").children[1].children[i].children[0].children[0].innerHTML = "<img src='" + json.articles[i].urlToImage + "' alt='test' style='width: 100%; height: 100px; border-radius: 3px'>";
                        document.getElementById("Fox_News").children[1].children[i].children[0].children[1].innerHTML = json.articles[i].title;
                        document.getElementById("Fox_News").children[1].children[i].children[0].children[2].innerHTML = json.articles[i].description;
                    }
                }
                else{
                    alert("Wrong Source!!!");
                }
            }
        }
    };
    xhttp.send(null);
    
}

function getWordCloud(){
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', api_address + "/word_freq", true);
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4) 
        { 
            if (xhttp.status == 200) {
                var json = JSON.parse(xhttp.responseText);
                if(typeof(json) == 'string'){
                    alert(json);
                    return false;
                }
                var myWords = json.res;
                var width = 300, height = 250;
                var svg = d3.select("#Word_Cloud").append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(0, 0)", "test", "test");
                var layout = d3.layout.cloud()
                    .size([width, height])
                    .words(myWords.map(function(d) { return {text: d.word, size:d.size}; }))
                    .padding(5)        //space between words
                    .rotate(function() { return ~~(Math.random() * 2) * 90; })
                    .fontSize(function(d) { return d.size; })      // font size of words
                    .on("end", draw);
                layout.start();
                function draw(words) {
                svg.append("g")
                    .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                    .selectAll("text")
                    .data(words)
                    .enter().append("text")
                    .style("font-size", function(d) { return d.size + 'px'; })
                    .style("fill", "black")
                    .attr("text-anchor", "middle")
                    .style("font-family", "Impact")
                    .attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ") rotate(" + d.rotate + ")";
                    })
                    .text(function(d) { return d.text; });
                }
            }
        }
    };
    xhttp.send(null);
}

function setDefaultDate(){
    var myDate = new Date();
    var d = myDate.getDate();
    var m = myDate.getMonth() + 1;
    var y = myDate.getFullYear();
    d = d < 10 ? "0" + d : d;
    m = m < 10 ? "0" + m : m;
    var s = y + "-" + m + "-" + d;
    document.getElementById('Search_Form').to_date.value = s;

    myDate.setDate(myDate.getDate() - 7);
    d = myDate.getDate();
    m = myDate.getMonth() + 1;
    y = myDate.getFullYear();
    d = d < 10 ? "0" + d : d;
    m = m < 10 ? "0" + m : m;
    s = y + "-" + m + "-" + d;    
    document.getElementById('Search_Form').from_date.value = s;
}

function get_source_with_category(){
    category = document.getElementById('Search_Category_Filter').value;
    if(typeof(category_all) == 'undefined'){
        var xhttp = new XMLHttpRequest();
        xhttp.open('GET', api_address + "/category=all", true);
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4) 
            { 
                if (xhttp.status == 200) {
                    var json = JSON.parse(xhttp.responseText);
                    if(typeof(json) == 'string'){
                        alert(json);
                        return false;
                    }
                    category_all = json;
                    s = "<option value='all'>all</option>";
                    option_size = 0;
                    for(i = 0; i < category_all.length; i++){
                        if(category_all[i].category == category || category == 'all'){
                            s += "<option value='" + category_all[i].name + "'>" + category_all[i].name + "</option>\n";
                            option_size += 1;
                        }
                        if(option_size >= 10){
                            break;
                        }
                    }
                    document.getElementById("Search_Source_Filter").innerHTML = s;
                }
            }
        };
        xhttp.send(null);
    }
    else{
        s = "<option value='all'>all</option>";
        option_size = 0;
        for(i = 0; i < category_all.length; i++){
            if(category_all[i].category == category || category == 'all'){
                s += "<option value='" + category_all[i].name + "'>" + category_all[i].name + "</option>\n";
                option_size += 1;
            }
            if(option_size >= 10){
                break;
            }
        }
        document.getElementById("Search_Source_Filter").innerHTML = s;
    }
    
}

function getSearchResult(){
    if(document.getElementById("Search_Section").style['display'] == "none"){
        return false;
    }
    var keyword = document.getElementById("Search_Form").keyword.value;
    var from_date = document.getElementById("Search_Form").from_date.value;
    var to_date = document.getElementById("Search_Form").to_date.value;
    var category = document.getElementById("Search_Form").category.value;
    var source = document.getElementById("Search_Form").source.value;
    if(from_date > to_date){
        alert("Incorrect time");
        return false;
    }
    req_addr = api_address + "/keyword=" + keyword + "&from_date=" + from_date + "&to_date=" + to_date + "&category=" + category + "&source=" + source;
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', req_addr, true);
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4) 
        { 
            if (xhttp.status == 200) {
                var json = JSON.parse(xhttp.responseText);
                if(typeof(json) == 'string'){
                    alert(json);
                    return false;
                }
                if(json.length == 0){
                    document.getElementById("Search_Results").innerHTML = "<div style='width: 100%; text-align: center; margin-top: 30px;'>No results<div>"
                    return false;
                }
                var div_content = "";
                for(i = 0; i < json.length; i++){
                    if(i <= 4){
                        var single_div = "<div class='Result_News_Card' onclick='showDetails(this);'>";
                    }
                    else{
                        var single_div = "<div class='Result_News_Card' style='display: none;' onclick='showDetails(this);'>";
                    }
                    single_div += "<div class='Result_News_Card_Image'><img src='" + json[i].urlToImage + "' style='width: 100px; height: 100px;'></div>";
                    single_div += "<div class='Result_News_Card_Content'>";
                    single_div += "<div style='padding-left: 5px; margin-top: 10px; font-size: 20px; font-weight: 700;'>" + json[i].title + "</div>"
                    single_div += "<div style='padding-left: 5px; margin-top: 10px; display: none;'><b>Author:&nbsp;</b>" + json[i].author + "</div>"
                    single_div += "<div style='padding-left: 5px; margin-top: 10px; display: none;'><b>Source:&nbsp;</b>" + json[i].name + "</div>"
                    single_div += "<div style='padding-left: 5px; margin-top: 10px; display: none;'><b>Date:&nbsp;</b>" + json[i].publishedAt + "</div>"
                    var description = json[i].description.replace(/\s/g, "</span><span>&nbsp;");
                    single_div += "<div class='Result_News_Card_Content_Description' style='padding-left: 5px; margin-top: 10px;'><span>" + description + "</span></div>"
                    single_div += "<div style='padding-left: 5px; margin-top: 10px; display: none;'><a href='" + json[i].url + "' target='_blank'>See Original Post</a></div>"
                    single_div += "<div style='padding-left: 5px; margin-top: 10px;'></div>"
                    single_div += "</div></div>";
                    div_content += single_div;
                }
                if(json.length <= 5){
                    document.getElementById("Search_Results").innerHTML = div_content;
                }
                else{
                    document.getElementById("Search_Results").innerHTML = div_content + "<input id='Show_Button' type='button' value='Show More' onclick='showMoreOrLess(this)'>";
                }
            }
        }
    };
    xhttp.send(null);
    
}

function showDetails(card){
    // card.style['height'] = '';
    // card.children[1].style['height'] = '';
    card.children[1].children[1].style['display'] = '';
    card.children[1].children[2].style['display'] = '';
    card.children[1].children[3].style['display'] = '';
    card.children[1].children[5].style['display'] = '';
    card.children[1].children[4].classList.remove('Result_News_Card_Content_Description');
    var s = card.children[1].children[4].innerHTML;
    card.children[1].children[4].innerHTML = s.replace(/<\/span><span>&nbsp;/g, ' ');
    if(card.children.length < 3){
        card.innerHTML += "<div class='remove' onclick='recoverOrigin(this)'>+</div>"
    }
    
}

function recoverOrigin(removeButton){
    removeButton.parentNode.children[1].children[1].style['display'] = 'none';
    removeButton.parentNode.children[1].children[2].style['display'] = 'none';
    removeButton.parentNode.children[1].children[3].style['display'] = 'none';
    removeButton.parentNode.children[1].children[5].style['display'] = 'none';
    removeButton.parentNode.children[1].children[4].classList.add('Result_News_Card_Content_Description');
    var s = removeButton.parentNode.children[1].children[4].innerHTML;
    removeButton.parentNode.children[1].children[4].innerHTML = s.replace(/\s/g, '</span><span>&nbsp;');
    removeButton.parentNode.removeChild(removeButton);
    event.stopPropagation()
}

function showMoreOrLess(button){
    var len_children = button.parentNode.children.length - 1;
    if(button.value == "Show More"){
        for(i = 5; i < len_children; i++){
            button.parentNode.children[i].style['display'] = '';
        }
        button.value = "Show Less";
    }
    else{
        for(i = 5; i < len_children; i++){
            button.parentNode.children[i].style['display'] = 'none';
        }
        button.value = "Show More";
    }
}

function resetSearchForm(){
    document.getElementById('Search_Form').keyword.value = "";
    setDefaultDate();
    document.getElementById("Search_Category_Filter").value = "all"; 
    get_source_with_category();
    document.getElementById("Search_Results").innerHTML = "";
}

setDefaultDate();
get_source_with_category()
constructGoogleNewsSection()