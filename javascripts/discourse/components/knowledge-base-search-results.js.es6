import computed from "ember-addons/ember-computed-decorators";

export default Ember.Component.extend({
  classNames: "kb-search-results",

  @computed("searchResults")
  count(results) {
    return results.length;
  },

  @computed("searchResults")
  empty(results){
    return !results || results.length === 0;
  }
});
