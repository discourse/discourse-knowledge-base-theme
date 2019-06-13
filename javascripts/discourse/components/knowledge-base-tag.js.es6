import computed from "ember-addons/ember-computed-decorators";
import DiscourseURL from "discourse/lib/url";

export default Ember.Component.extend({

  kbHelper: Ember.inject.service(),

  @computed("category", "tag")
  href(category, tag) {
    return this.kbHelper.hrefForTag(category, tag.id);
  },

  click(event) {
    this.set("filteredList", null);
    DiscourseURL.routeTo(`${this.href}`, { replaceURL: true });
  }

});
