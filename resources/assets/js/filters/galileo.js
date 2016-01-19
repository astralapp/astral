import Vue from "vue";
import _ from "lodash";

Vue.filter("galileo", function(value, input){
  //If the initial input is a tag...
  if( input[0] === "#" && !~input.indexOf(":") ){
    return ~_.findIndex(value, function(tag){
      let searchedTag = input.replace("#", "").toLowerCase()
      return ~tag.name.toLowerCase().indexOf(searchedTag)
    });
  }

  //Find all tag and string queries in the search
  let searchArray = input.split(":");
  let matchedTags = _.filter(searchArray, function(query){
    return query[0] === "#";
  });
  let matchedStrings = _.filter(searchArray, function(query){
    return query[0] !== "#";
  }).join(":").toLowerCase();
  let searchQuery = "";
  if( value.hasOwnProperty("description") ){
    searchQuery = `${value.full_name.toLowerCase()} ${value.description.toLowerCase()}`;
  }
  else {
    searchQuery = value.full_name.toLowerCase();
  }
  //If we found tags return all stars with that tag
  if(matchedTags.length){
    let tags = matchedTags.map(function(tag){
      return tag.replace("#", "").toLowerCase();
    });
    let starHasTags = _.filter(value.tags, function(tag){
      return ~tags.indexOf( tag.name.toLowerCase() )
    }).length === tags.length;
    return starHasTags && ~searchQuery.indexOf(matchedStrings);
  }
  //No matched tags, just search strings
  else {
    if( input.replace(/\s/g, "") === "" ){
      return true;
    }
    else {
      return ~searchQuery.indexOf( input.toLowerCase() );
    }
  }
});
