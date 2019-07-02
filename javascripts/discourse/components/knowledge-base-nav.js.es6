import { hrefForCategory, kbParams } from "discourse/components/knowledge-base";
import { default as computed } from "ember-addons/ember-computed-decorators";

export default Ember.Component.extend({
  tagName: "a",
  attributeBindings: "href",
  classNameBindings: "active",

  @computed("category")
  href(category) {
    return hrefForCategory(category);
  },

  @computed("filterMode")
  active(filterMode) {
    const active = kbParams({ filter: "kb" });
    return !!active;
  },

  click(event) {
    event.preventDefault();
    DiscourseURL.routeTo(`${this.href}?kb=active`);
  }
});
