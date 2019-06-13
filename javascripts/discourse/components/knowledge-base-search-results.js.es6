import computed from "ember-addons/ember-computed-decorators";

export default Ember.Component.extend({

  tagName: "div",
  classNames: "kb-search-results",
  kbHelper: Ember.inject.service(),

  @computed("filteredList")
  empty(filteredList){
    console.log(filteredList);
    return (filteredList == "empty") ? true : false;
  }



});
