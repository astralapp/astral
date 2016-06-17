import Vue from "vue";

Vue.filter("currentTagFilter", function(value, currentTag){
  if( !Object.keys(currentTag).length ){
    return value;
  }
  return value.filter(function(repo){
    if(repo.tags.length){
      return ~repo.tags.map(function(tag){
        return tag.name;
      }).indexOf(currentTag.name);
    }
    else {
      return false;
    }
  });
});
