import {
  default as computed,
  on,
  observes
} from "ember-addons/ember-computed-decorators";
import DiscourseURL from "discourse/lib/url";
import { withPluginApi } from "discourse/lib/plugin-api";
import { kbParams } from "discourse/components/knowledge-base";

export default {
  name: "kb-setup",
  initialize() {
    withPluginApi("0.8", api => {
      api.addDiscoveryQueryParam("tags", { replace: true, refreshModel: true });
      api.addDiscoveryQueryParam("kb", { replace: true, refreshModel: true });
      api.modifyClass("route:discovery.parentCategory", {
        beforeModel(transition) {
          const activeParams = kbParams({ filter: "kb" });
          const kbCategories = settings.kb_categories.split("|").filter(n => n).map(n => n.toLowerCase());
          const slug = transition.to.params.slug;
          if (
            !activeParams &&
            kbCategories.some(cat => cat === slug) &&
            settings.default_to_kb_view &&
            (!transition.queryParams || 
            transition.queryParams.kb !== "active")
          ) {
            this.transitionTo(
              "discovery.parentCategory",
              transition.to.params.slug,
              { queryParams: { kb: "active" } }
            );
          } else {
            return this._super(...arguments);
          }
        }
      });
      api.modifyClass("route:discovery.category", {
        beforeModel(transition) {
          const activeParams = kbParams({ filter: "kb" });
          const kbCategories = settings.kb_categories.split("|").filter(n => n).map(n => n.toLowerCase());
          const slug = transition.to.params.slug;
          if (
            !activeParams &&
            kbCategories.some(cat => cat === slug) &&
            settings.default_to_kb_view &&
            (!transition.queryParams || 
            transition.queryParams.kb !== "active")
          ) {
            this.transitionTo("discovery.category", transition.to.params.slug, {
              queryParams: { kb: "active" }
            });
          } else {
            return this._super(...arguments);
          }
        }
      });
      api.onPageChange((url, title) => {
        const kbCategories = settings.kb_categories.split("|").filter(n => n).map(n => n.toLowerCase());
        const activeParams = kbParams({ filter: "kb" });
        if (
          kbCategories.some(category =>
            url.includes(category) && url.match(new RegExp(`/c/[^&]*/*${category}`))
          ) &&
          activeParams
        ) {
          document.body.classList.add("kb-active");
        } else {
          document.body.classList.remove("kb-active");
        }
      });
      api.modifyClass("component:navigation-item", {
        @computed("content.filterMode", "filterMode")
        active(contentFilterMode, filterMode) {
          const active = kbParams({ filter: "kb" });
          if (active) {
            return false;
          }
          return this._super(contentFilterMode, filterMode);
        }
      });
    });
  }
};
