import { ajax } from 'discourse/lib/ajax';

export default {
    
    findKBFromCategory(category, tags, filter) {
      if (tags) {
        return ajax(`/search.json?q=%23${category.slug} tags:${tags.replace(/ /g, "+")} ${filter}`);
      }
      else {
        return ajax(`/search.json?q=%23${category.slug} ${filter}`);
      }
    }

};
