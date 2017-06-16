var form = (function () {
    let searchForm;

    function handleSubmit(e){
        e.preventDefault();

        let searchValue = e.target.firstElementChild.value;
        if (searchValue.length != 0)
            
        
    }
    
    function init(){
        searchForm = document.querySelector("#searchForm");
        searchForm.addEventListener("submit", handleSubmit);
    }

    return {
        init: init
    };
    
})();


var core = (function(){
    function init(){
        form.init();
    }
    
    return {
        init: init
    };
})();

core.init();
