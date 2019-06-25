export default {
  shouldRender(args, component) {
    if (settings.kb_categories === "") return false;

    const kbCategories = settings.kb_categories.split("|");
    const lookup = component.get("category.slug");
    return kbCategories.includes(lookup);
  }
};
