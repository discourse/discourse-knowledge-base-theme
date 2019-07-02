import knowledgeBase from "discourse/models/knowledge-base";
import { kbParams } from "discourse/components/knowledge-base";

export default Ember.Component.extend({
  classNames: "kb-search",

  performSearch(term) {
    if (term.length < this.siteSettings.min_search_term_length) {
      this.set("searchResults", null);
      return;
    }

    const category = this.get("category");
    const tags = kbParams({ filter: "tags" });

    knowledgeBase.findKBFromCategory(category, tags, term).then(result => {
      this.set("searchResults", result.topics || []);
    });
  },

  actions: {
    onSearchTermChange(e) {
      const term = e.target.value;
      this.set("searchTerm", term);
      Ember.run.debounce(this, this.performSearch, term, 250);
    }
  }
});
