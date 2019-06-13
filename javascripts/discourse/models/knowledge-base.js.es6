import { ajax } from 'discourse/lib/ajax';

export default {
    
    findKBFromCategory(category, filter) {
      return ajax(`/search.json?q=%23${category.slug} ${filter}`);
    }

};
