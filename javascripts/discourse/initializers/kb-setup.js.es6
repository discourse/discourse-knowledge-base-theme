import { default as computed, on, observes } from "ember-addons/ember-computed-decorators";
import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "kb-setup",
  initialize() {
    withPluginApi("0.8", api => {
      api.addDiscoveryQueryParam("tags", { replace: true, refreshModel: true });
      api.onPageChange((url, title) => {
        const kbCategories = settings.kb_categories.split("|").filter(n => n);
        if (kbCategories.some((category) => url.includes(`/c/${category}`))) {
          document.body.classList.add("kb-active");
        }
        else {
          document.body.classList.remove("kb-active");
        }
      });
    });
  }
}
