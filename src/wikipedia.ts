let url = "https://en.wikipedia.org/w/api.php"; 

export class Wikipedia{




    serachWiki(searchKeyword: string): void{

        var params = {
            action: "query",
            list: "search",
            srsearch: searchKeyword,
            format: "json"
        };
        
        url = url + "?origin=*";
        Object.keys(params).forEach(function(key){url += "&" + key + "=" + this.params[key];});
        console.log(url);
        fetch(url)
            .then(function(response){return response.json();})
            .then(function(response) {
                 
                    console.log(response.query.search[0].title );
                }
            )
            .catch(function(error){console.log(error);});
    
    }

}



