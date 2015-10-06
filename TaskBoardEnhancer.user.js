// ==UserScript==
// @name         TaskBoardEnhancer
// @namespace    http://roqvist.com
// @version      0.5
// @description  Marks blocked nodes with a beautiful red background color, hide blocked but allows change on hoover. Selector for hiding work items of specific states
// @author       Robert, Dan
// @match        https://salome.meridium.se/tfs/*
// @grant        none
// ==/UserScript==

// set up observer to make changes when dom changed
MutationObserver = window.MutationObserver || window.WebKitMutationsObserver;

function insertCssRule(selector,rules,contxt) {
    var context=contxt||document,stylesheet;

    if(typeof context.styleSheets=='object') {
        if(context.styleSheets.length) {
            stylesheet=context.styleSheets[context.styleSheets.length-1];
        }
        if(context.styleSheets.length) {
            if(context.createStyleSheet) {
                stylesheet=context.createStyleSheet();
            } else {
                context.getElementsByTagName('head')[0].appendChild(context.createElement('style'));
                stylesheet=context.styleSheets[context.styleSheets.length-1];
            }
        }
        if(stylesheet.addRule) {
            for(var i=0;i<selector.length;++i) {
                stylesheet.addRule(selector[i],rules);
            }
        } else {
            stylesheet.insertRule(selector.join(',') + '{' + rules + '}', stylesheet.cssRules.length);  
        }
    }
}

observer = new MutationObserver(function(mutations, observer) {
    Runner();
    updateHide();
});

function isTaskBoard(){
    return $("#taskboard").length;
}
// animate after a few seconds, slow ass rendering...
$(document).ready(function() {
    //only do this on the taskboard
    if(isTaskBoard()){
        setTimeout(Setup, 1500);
        addToolbar();
    }
});
function addToolbar(){
    insertCssRule([".mw-toolbar"],"display:table;height:34px");
    insertCssRule([".mw-toolbar div"],"display:table-cell;vertical-align:middle");
    var toolbarRow = $("div.hub-pivot");
    var views = toolbarRow.find(".views");
    var hideOption=localStorage.getItem("mw_hide_option");
    var hideShowOption = localStorage.getItem("mw_hideShow_option");
    
    views.after("<div class=\"mw-toolbar\"><div><select id=\"hideShow_option\">"+renderOption("Hide",hideShowOption)+renderOption("Show",hideShowOption)+"</select>:<select id=\"hide_option\">"+renderOption("None",hideOption)+renderOption("Done",hideOption)+renderOption("Reviewed,Done",hideOption)+"</select></div></div>");
    $("select#hide_option").change(updateHide);
    $("select#hideShow_option").change(updateHide);
}
function renderOption(name, currentValue){
    var attributes="";
    if(currentValue && currentValue.toLowerCase()==name.toLowerCase())
        attributes=" selected";
    return "<option"+attributes+">"+name+"</option>";
}
function updateHide(){
    var hideOption =$("select#hide_option option:selected").val();
    var hideShowOption =$("select#hideShow_option option:selected").val();
    localStorage.setItem("mw_hide_option",hideOption);
    localStorage.setItem("mw_hideShow_option",hideShowOption);
    var show=hideShowOption.toLowerCase()=="show";
    switch(hideOption.toLowerCase()){
        case "none":
            setHidden(null,show);
            break;
        case "reviewed,done":
            setHidden(null,show);
            setHidden("ReviewedAndTested",!show);
            setHidden("done",!show);
            break;
        case "done":
            setHidden(null,show);
            setHidden("done",!show);
            break;
    }
}
function setHidden(state, hidden){
    $(".parentTbTile .additional-field[field='System.State'] div.field-inner-element").each(function(j){
        var s = $(this).text();
        if(state==null||state.toLowerCase() == s.toLowerCase()) {
            var trContent = $(this).closest("tr");
            var trSummary= trContent.next();
            trContent.css("display",hidden?"none":"");
            trSummary.css("display","none");
        }
    });
}
function Setup(){
    Runner();
    $(".tbTile").find("[field='Microsoft.VSTS.CMMI.Blocked']").each(function(j){
            $(this).hide();
    });
    $(".tbTile").mouseenter(function(){
        $(this).find("[field='Microsoft.VSTS.CMMI.Blocked']").each(function(j){
            $(this).show();
        });
    });
    $(".tbTile").mouseleave(function(){
        $(this).find("[field='Microsoft.VSTS.CMMI.Blocked']").each(function(j){
            $(this).hide();
        });
    });
    updateHide();
}
// find and colorize nodes
function Runner () {
    tiles = $(".tbTileContent").each(function(i) {
        $elementToChange = $(this);
        $(this).find("[field='Microsoft.VSTS.CMMI.Blocked']").find(".field-inner-element").each(function (j) {
            if($(this).text() == "Yes") {
                $elementToChange.css('background', '#FF8080').css('-webkit-transition', 'background 0.5s').css('-moz-transition', 'background 0.5s').css('-o-transition', 'background 0.5s').css('transition', 'background 0.5s');
            } else {
                $elementToChange.css('background', '#FFF').css('-webkit-transition', 'background 0.5s').css('-moz-transition', 'background 0.5s').css('-o-transition', 'background 0.5s').css('transition', 'background 0.5s');
            }
        });
        $(this).find("[field='Microsoft.VSTS.CMMI.Blocked']").each(function(j){
            //$(this).hide();
        });
    });

    // start observing changes
    observer.observe(document, {subtree: true, attributes: false, childList: true});
}
