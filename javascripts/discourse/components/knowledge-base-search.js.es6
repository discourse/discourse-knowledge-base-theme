import knowledgeBase from 'discourse/models/knowledge-base';
import { observes } from "ember-addons/ember-computed-decorators";
import debounce from "discourse/lib/debounce";

export default Ember.Component.extend({
  filter: null,
  classNames: "kb-search",

  kbHelper: Ember.inject.service(),

  filterTopics: debounce(function(){
    const filter = this.get("filter");
    if (filter === "") {
      this.set("filteredList", null);
      return;
    }

    const category = this.get("category");

    knowledgeBase.findKBFromCategory(category, filter).then(result => {
      if (!result.topics) {
        this.set("filteredList", "empty");
      }
      else {
        this.set("filteredList", result.topics);
      }
    });
    
  }, 250).observes("filter"),
});
