import Vue from "vue";

Vue.filter("currentTagFilter", function(value){
  if( !Object.keys(this.currentTag).length ){
    return value;
  }
  return value.filter( (repo) => {
    let matchedStar = this.stars.filter( (star) => {
      return star.repo_id === repo.id;
    })[0];
    if( matchedStar && matchedStar.tags.length ){
      return ~matchedStar.tags.map( (tag) => {
        return tag.name;
      }).indexOf(this.currentTag.name);
    }
    else {
      return false;
    }
  });
});
