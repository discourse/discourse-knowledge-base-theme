import {
  default as computed,
  on,
  observes
} from "ember-addons/ember-computed-decorators";
import DiscourseURL from "discourse/lib/url";
import { withPluginApi } from "discourse/lib/plugin-api";
import { kbParams } from "discourse/components/knowledge-base";
import Category from "discourse/models/category";

export default {
  name: "kb-setup",
  initialize() {
    withPluginApi("0.8", api => {
      api.addDiscoveryQueryParam("tags", { replace: true, refreshModel: true });
      api.addDiscoveryQueryParam("kb", { replace: true, refreshModel: true });
      api.modifyClass("route:discovery.parentCategory", {
        beforeModel(transition) {
          if (kbParams && Category) {
            const activeParams = kbParams({ filter: "kb" });
            const categoryIds = settings.kb_categories.split("|");
            const kbCategories = Category.findByIds(categoryIds);
            const slug = transition.to.params.slug;
            if (
              !activeParams &&
              kbCategories &&
              kbCategories.some(cat => cat.slug === slug) &&
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
        }
      });
      api.modifyClass("route:discovery.category", {
        beforeModel(transition) {
          if (kbParams && Category) {
            const activeParams = kbParams({ filter: "kb" });
            const categoryIds = settings.kb_categories.split("|");
            const kbCategories = Category.findByIds(categoryIds);
            const slug = transition.to.params.category_slug_path_with_id.match(
              /(\S*)\//
            )[1];
            if (
              kbCategories &&
              kbCategories.some(cat => cat.slug === slug) &&
              settings.default_to_kb_view &&
              (!transition.queryParams ||
                transition.queryParams.kb !== "active")
            ) {
              this.transitionTo(
                "discovery.category",
                transition.to.params.category_slug_path_with_id,
                {
                  queryParams: { kb: "active" }
                }
              );
            } else {
              return this._super(...arguments);
            }
          }
        }
      });
      api.modifyClass("route:discovery.categoryWithID", {
        beforeModel(transition) {
          if (kbParams && Category) {
            const activeParams = kbParams({ filter: "kb" });
            const categoryIds = settings.kb_categories.split("|");
            const kbCategories = Category.findByIds(categoryIds);
            const categoryID = transition.to.params.id;
            if (
              kbCategories &&
              kbCategories.some(cat => cat.id === parseInt(categoryID)) &&
              settings.default_to_kb_view &&
              (!transition.queryParams ||
                transition.queryParams.kb !== "active")
            ) {
              this.transitionTo(
                "discovery.categoryWithID",
                transition.to.params.id,
                {
                  queryParams: { kb: "active" }
                }
              );
            } else {
              return this._super(...arguments);
            }
          }
        }
      });
      api.onPageChange((url, title) => {
        const currentUser = api.container.lookup("current-user:main");
        const siteSettings = api.container.lookup("site-settings:main");
        if (url === "/login" && !currentUser && siteSettings.login_required) {
          return;
        }
        if (kbParams && Category) {
          const categoryIds = settings.kb_categories.split("|");
          const kbCategories = Category.findByIds(categoryIds);
          const activeParams = kbParams({ filter: "kb" });
          if (
            kbCategories &&
            kbCategories.some(
              category =>
                url.includes(category.slug) &&
                url.match(new RegExp(`/c/[^&]*/*${category.slug}`))
            ) &&
            activeParams
          ) {
            document.body.classList.add("kb-active");
          } else {
            document.body.classList.remove("kb-active");
          }
        }
      });
      api.modifyClass("component:navigation-item", {
        @computed("content.filterMode", "filterMode")
        active(contentFilterMode, filterMode) {
          if (kbParams) {
            const active = kbParams({ filter: "kb" });
            if (active) {
              return false;
            }
            return this._super(contentFilterMode, filterMode);
          }
        }
      });
    });
  }
};
