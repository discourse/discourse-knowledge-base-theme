import { default as computed, on, observes } from "ember-addons/ember-computed-decorators";
import { withPluginApi } from "discourse/lib/plugin-api";

function arrayContainsArray(superset, subset) {
  if (0 === subset.length) {
    return false;
  }
  return subset.every(v => superset.indexOf(v) >= 0);
}

export default {
  name: "kb-setup",
  initialize() {
    withPluginApi("0.8", api => {
      api.addDiscoveryQueryParam("tags", { replace: true, refreshModel: true });

      api.modifyClass("component:bread-crumbs", {
        kbHelper: Ember.inject.service(),

        @computed("kbHelper.active")
        kbActive(active) {
          return active;
        }
      });

      api.modifyClass("component:d-navigation", {
        kbHelper: Ember.inject.service(),

        @computed("kbHelper.active")
        kbActive(active) {
          return active;
        }
      });

      api.modifyClass("controller:discovery/topics", {
        kbHelper: Ember.inject.service(),
        filteredList: null,

        @on("init")
        @observes("category")
        kbChangeCategory() {
          this.kbHelper.updateCurrentCategory(this.category);
        },

        @computed("kbHelper.active")
        kbActive(active) {
          return active;
        },

        @observes("model")
        kbFilterTopics(){
          if (this.kbActive) {
            const model = this.get("model");
            let tagsFilter = this.kbHelper.kbParams();
            if (tagsFilter) {
              tagsFilter = tagsFilter.split(" ");
              model.topics = model.topics.filter(topic => {
               let tags = topic.tags;

               return arrayContainsArray(tags, tagsFilter);
              });
              this.set("model", model);
            }
          }
        },
      });

      Discourse.register("service:kb-helper", Ember.Service.extend({
        updateCurrentCategory(category) {
          this.set("discoveryCategory", category);
        },

        hrefForTag(category, tagName) {
          let destinationURL = "";
          if (category && tagName) {
            const slug = Discourse.Category.slugFor(category);
            let tagsParam = this.kbParams();

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
        },

        kbParams(){
          const params = window.location.search;
          if (params) {
            const match = params.match(/tags=([^&]*)/);
            if (match) {
              return decodeURIComponent(match[1]);
            }
          }
        },

        @computed("discoveryCategory")
        active(category) {
          const siteSettings = api.container.lookup("site-settings:main");
          const kbCategories = settings.kb_categories.split("|").filter(n => n);
          const tagsEnabled = siteSettings.tagging_enabled;
          const tagFilterEnabled = siteSettings.show_filter_by_tag;
          const enabledForCategory = category && kbCategories.includes(category.slug)

          if (kbCategories.length === 0) {
            return false;
          }
          if (!tagsEnabled || !tagFilterEnabled) {
            console.log("Knowledge Base Theme Component requires the following site settings to be enabled: `tagging_enabled` and `show_filter_by_tag`");
            return false;
          }
          return enabledForCategory
        },

        @on("init")
        @observes("active")
        updateClasses() {
          if (this.active) {
            document.body.classList.add("kb-active");
          } else {
            document.body.classList.remove("kb-active");
          }
        },
      }));
    });
  }
}
