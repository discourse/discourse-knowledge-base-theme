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
      api.onPageChange((url, title) => {
        const kbCategories = settings.kb_categories.split("|").filter(n => n);
        const activeParams = kbParams({ filter: "kb" });
        if (kbCategories.some(category => url.includes(`/c/${category}`))) {
          if (activeParams) {
            document.body.classList.add("kb-active");
          }
          else if (!activeParams && settings.default_to_kb_view && !url.includes("/l/")) {
            DiscourseURL.routeTo(`${url}?kb=active`);
          }
          else {
            document.body.classList.remove("kb-active");
          }
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
