import computed from "ember-addons/ember-computed-decorators";

export default Ember.Component.extend({
  classNames: "kb-search-results",
  kbHelper: Ember.inject.service(),

  @computed("filteredList")
  empty(filteredList){
    return filteredList === "empty";
  }
});
