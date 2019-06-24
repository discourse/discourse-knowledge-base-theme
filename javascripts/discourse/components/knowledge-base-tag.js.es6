import computed from "ember-addons/ember-computed-decorators";
import DiscourseURL from "discourse/lib/url";
import { hrefForTag } from "discourse/components/knowledge-base";

export default Ember.Component.extend({
  @computed("category", "tag")
  href(category, tag) {
    return hrefForTag(category, tag.id);
  },

  click() {
    DiscourseURL.routeTo(this.href, { replaceURL: true });
  }
});
