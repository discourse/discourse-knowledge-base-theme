import knowledgeBase from 'discourse/models/knowledge-base';
import { default as computed, observes, on } from "ember-addons/ember-computed-decorators";
import debounce from "discourse/lib/debounce";

function arrayContainsArray(superset, subset) {
  if (0 === subset.length) {
    return false;
  }
  return subset.every(v => superset.indexOf(v) >= 0);
}

export default Ember.Component.extend({
  searchTerm: null,
  searchResults: null,

  @on("didReceiveAttrs")
  update() {
    if (this.active) {
      document.body.classList.add("kb-active");
      Ember.run.later(() => {
        this.filterTopicsList();
      });
    } else {
      document.body.classList.remove("kb-active");
    }
  },

  filterTopicsList() {
    const model = this.model;
    let tagsFilter = kbParams();

    if (tagsFilter) {
      tagsFilter = tagsFilter.split(" ");
      model.set("topics", model.topics.filter(topic => arrayContainsArray(topic.tags, tagsFilter)));
    }
  },

  @computed("category")
  active(category) {
    const kbCategories = settings.kb_categories.split("|").filter(n => n);
    const tagsEnabled = this.siteSettings.tagging_enabled;
    const tagFilterEnabled = this.siteSettings.show_filter_by_tag;
    const enabledForCategory = category && kbCategories.includes(category.slug)

    if (kbCategories.length === 0) {
      return false;
    }
    if (!tagsEnabled || !tagFilterEnabled) {
      console.warn("Knowledge Base Theme Component requires the following site settings to be enabled: `tagging_enabled` and `show_filter_by_tag`");
      return false;
    }
    return enabledForCategory
  },

  @computed("searchResults")
  hasSearchResults(results) {
    return !!results;
  }
});

export function kbParams() {
  const params = window.location.search;
  if (params) {
    const match = params.match(/tags=([^&]*)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }
}

export function hrefForTag(category, tagName) {
  let destinationURL = "";
  if (category && tagName) {
    const slug = Discourse.Category.slugFor(category);
    let tagsParam = kbParams();

    if (tagsParam) { //if existing params
      if (tagsParam.includes(tagName)) { // removing a param

        tagsParam = tagsParam.replace(tagName, '');
        tagsParam = tagsParam.replace(/^\s+|\s+$/g, '');

        if (tagsParam === "") { // if no params, send base category URL
          destinationURL = `/c/${slug}?tags=`;
        }
        else {
          destinationURL = `/c/${slug}?tags=${tagsParam}`; // send URL with removed params
        }
      }
      else { //if adding new param
        destinationURL = `/c/${slug}?tags=${tagsParam} ${tagName}`; 
      }
    }
    else { //if no existing params
      destinationURL = `/c/${slug}?tags=${tagName}`;
    }
  }
  return destinationURL;
}
