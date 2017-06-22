"use strict";
/**
 * Utility module to hold often used files
 **/
var utils = (function(){
    /**
     *  Returns JSON data from a URL;
     *  @param {string} url - The url from which to fetch json data
     **/
    function getJSON(url){
        return get(url).then(JSON.parse);
    }

    /**
     *  Returns response text from a url
     *  @param {string} url - The url from which to fetch json data
     **/
    function get(url){
        return new Promise (function(succeed, fail){
            var req = new XMLHttpRequest();

            req.open("GET", url, true);
            req.addEventListener("load", function () {
                if (req.status < 400 ){
                    succeed(req.responseText);
                }
                else {
                    fail(new Error("Request Failed: " + req.statusText));
                }
            });
            req.addEventListener("error", function(){
                fail(new Error("Connection Failed"));
            });
            req.send(null);
        });
    }
    
    return {
        get: get,
        getJSON: getJSON
    };
    
})();

/**
 * Module for sound cloud specific functionality
 **/
var soundCloud = (function(){
    let idString = 'client_id=095fe1dcd09eb3d0e1d3d89c76f5618f';
    /**
     * 
     **/
    function buildUrl(searchValue){
        let endpointString = 'https://api.soundcloud.com/search?q=';
        let searchValueURI = encodeURI(searchValue);
        return endpointString + searchValueURI + "&" +idString;
    }

    function buildUserUrl(id){
        let endpointString = 'https://api.soundcloud.com/users/';
        return endpointString + id + "/tracks" + "?" + idString;
    }

    function getStreamUrl(url){
        return url + "?" + idString;
    }
    
    
    return {
        buildUrl: buildUrl,
        getStreamUrl: getStreamUrl,
        buildUserUrl: buildUserUrl
    };
})();

/**
 * Module for interacting with the UI
 **/
var ui = (function(){
    function resetResults(){
        let resultsContainer = document.querySelector(".results");
        resultsContainer.innerHTML = "";
    }
    
    function buildResults (results) {
        let resultsContainer = document.querySelector(".results");
        var resultContainer;
        var result;
        var art;
        
        results.forEach(function(e,i){
            //remove existing classes leftover in template from cloning
            if (e.kind == 'user'){
                resultContainer = document.querySelector("#searchResultUserTemplate");
                result =  resultContainer.content.querySelector(".result");
                art = resultContainer.content.querySelector(".art");
                var user = resultContainer.content.querySelector("h3");
                if (e.avatar_url != null){
                    art.style.background = `url(${e.avatar_url}) no-repeat center center`;
                    art.style.backgroundSize = 'cover';
                }
                else {
                    art.style.backgroundImage = 'linear-gradient(135deg,#846170,#70929c)';
                }
                user.textContent = e.username;

                result.setAttribute("data-user-id", e.id);
                result.setAttribute("data-username", e.username);
                
                resultsContainer.appendChild(resultContainer.content.cloneNode(true));
            }
            else if (e.kind == 'track'){
                resultContainer = document.querySelector("#searchResultTrackTemplate");
                result =  resultContainer.content.querySelector(".result");
                art = resultContainer.content.querySelector(".art");                
                var title = resultContainer.content.querySelector("h3");                    
                var artist = resultContainer.content.querySelector("h4");
                
                if (e.artwork_url != null){
                    art.style.background = `url(${e.artwork_url}) no-repeat center center`;
                    art.style.backgroundSize = 'cover';
                }
                else {
                    art.style.backgroundImage = 'linear-gradient(135deg,#846170,#70929c)';
                }
                title.textContent = e.title;
                artist.textContent = e.user.username;

                result.setAttribute("data-track-src", e.stream_url);
                result.setAttribute("data-track-title", e.title);
                result.setAttribute("data-track-artist", e.user.username);
                
                resultsContainer.appendChild(resultContainer.content.cloneNode(true));
            }
        });
    }

    function updatePlaying(artist, title, artElement){
        let playingString = " " + artist + " - " + title;
        let location = document.querySelector("#nowplayingstring");
        let artwork = document.querySelector(".artwork");
        artwork.style.background = artElement.style.background;
        location.textContent = playingString;
    }

    function buildArtistPage (id, name, artElement){
        let artistPageImage = document.querySelector(".artistPageImage");
        artistPageImage.style.background = artElement.style.background;
        let artistPageName = document.querySelector(".artistPageName");
        artistPageName.textContent = name;

        //get tracks
        utils.getJSON(soundCloud.buildUserUrl(id)).then((res)=>buildArtistTracks(res));
        
    }

    function buildArtistTracks(res){
        let artistsTracksDiv = document.querySelector(".artistTracks");
        artistsTracksDiv.innerHTML = "";
        res.forEach((e,i,a) => {
            let resultContainer = document.querySelector("#searchResultTrackTemplate");
            
            let result =  resultContainer.content.querySelector(".result");
            let art = resultContainer.content.querySelector(".art");                
            var title = resultContainer.content.querySelector("h3");                    
            var artist = resultContainer.content.querySelector("h4");
            
            if (e.artwork_url != null){
                art.style.background = `url(${e.artwork_url}) no-repeat center center`;
                art.style.backgroundSize = 'cover';
            }
            else {
                art.style.backgroundImage = 'linear-gradient(135deg,#846170,#70929c)';
            }
            title.textContent = e.title;
            artist.textContent = e.user.username;

            result.setAttribute("data-track-src", e.stream_url);
            result.setAttribute("data-track-title", e.title);
            result.setAttribute("data-track-artist", e.user.username);
            
            artistsTracksDiv.appendChild(resultContainer.content.cloneNode(true));            
        });
        
    }
    
    return {
        buildResults: buildResults,
        resetResults: resetResults,
        updatePlaying: updatePlaying,
        buildArtistPage: buildArtistPage
    };
})();

/**
 * Module for interacting with the form on the page
 **/
var form = (function () {
    let searchForm;

    function handleSubmit(e){
        e.preventDefault();
        let searchValue = e.target.firstElementChild.value;
        if (searchValue.length != 0){
            let url = soundCloud.buildUrl(searchValue);
            utils.getJSON(url).then(function(results){
                ui.resetResults();
                ui.buildResults(results.collection);
            });
        }
    }
    
    function init(){
        searchForm = document.querySelector("#searchForm");
        searchForm.addEventListener("submit", handleSubmit);
    }

    return {
        init: init
    };
})();

var interaction = (function(){
    function handleClick(ev){
        let result = ev.target.parentElement.firstElementChild;
        let type = result.classList[1];
        let art = result.querySelector(".art");
        if (type == 'track'){
            let trackSource = result.getAttribute("data-track-src");
            let artist = result.getAttribute("data-track-artist");
            let title = result.getAttribute("data-track-title");
            playback(artist, title, trackSource, art);
        }
        else if (type == 'user'){
            let results = document.querySelector(".results");            
            results.classList.add("hidden");
            let id = result.getAttribute("data-user-id");
            let name = result.getAttribute("data-username");
            ui.buildArtistPage(id, name, art);
            let artistPage = document.querySelector(".artistPage");
            artistPage.classList.remove("hidden");
            let content = document.querySelector(".content");
            content.scrollTop = 0;
        }
    }

    function playback(artist, title, trackSource, artElement){
        ui.updatePlaying(artist, title, artElement);
        let source =  document.querySelector("audio");
        source.setAttribute("src", soundCloud.getStreamUrl(trackSource));
        source.play();
    }
    
    return {
        handleClick: handleClick
    };
})();


/**
 * Core module
 **/
var core = (function(){
    function init(){
        let results = document.querySelector(".results");
        results.addEventListener("click", function (ev) {
            interaction.handleClick(ev);
        });

        let resultsUsers = document.querySelector(".artistTracks");
        resultsUsers.addEventListener("click", function(ev){
            interaction.handleClick(ev); 
        });

        let backBtn = document.querySelector(".back");
        backBtn.addEventListener("click", function(ev){
            let artistsPage = document.querySelector(".artistPage");
            artistsPage.classList.add("hidden");
            let results = document.querySelector(".results");
            results.classList.remove("hidden");
        });
        
        form.init();
    }
    
    return {
        init: init
    };
})();

core.init();
