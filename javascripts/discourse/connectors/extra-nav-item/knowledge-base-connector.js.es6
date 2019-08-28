import Category from "discourse/models/category";

export default {
  shouldRender(args, component) {
    if (settings.kb_categories === "") return false;

    const categoryIds = settings.kb_categories.split("|");
    const kbCategories = Category.findByIds(categoryIds).map(cat => cat.slug);
    const lookup = component.get("category.slug");
    return kbCategories.includes(lookup);
  }
};
