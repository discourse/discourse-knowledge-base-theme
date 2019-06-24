import computed from "ember-addons/ember-computed-decorators";
import { on, observes } from "ember-addons/ember-computed-decorators";
import { ajax } from "discourse/lib/ajax";
import { kbParams } from "discourse/components/knowledge-base";

function sortAlpha(a, b) {
  let aName = a.id.toLowerCase();
  let bName = b.id.toLowerCase();
  return (aName < bName) ? -1 : (aName > bName) ? 1 : 0;
}

function sortCount(a, b) {
  let aCount = a.count;
  let bCount = b.count;

  return bCount - aCount || a.id.localeCompare(b.id);
}

let cachedResults = null;
let lastFetchDate = null;

export default Ember.Component.extend({
  classNames: "kb-tags",

  fetchTags() {
    if (!lastFetchDate || !cachedResults || lastFetchDate + (3600 * 1000) < Date.now()) {
      const promise = ajax("/tags.json");
      promise.then(result => {
        cachedResults = result;
        lastFetchDate = Date.now();
      });
      return promise;
    } else {
      return Ember.RSVP.resolve(cachedResults);
    }
  },

  @on("init")
  @observes("topics")
  getTags() {
    let tagParam = kbParams();

    if (tagParam) {
       tagParam = tagParam.split(" ");
    }

    const topTags = this.get("site.top_tags");

    this.fetchTags().then(result => {
      const sortSetting = settings.sort_tags;
      const siteTags = result.tags.map(t => Ember.$.extend({}, t));
      let kbTags = siteTags.filter(tag => topTags.includes(tag.id));

      if (tagParam) { //if we're filtered already
        //filter down to just active tags
        kbTags = kbTags.filter(tag => tagParam.includes(tag.id));  
        kbTags.forEach(tag => {
          tag.active = true
          tag.count = 0;
        });

        //process subtags
        const topics = this.get("model.topics");
        let subtags = []; 

        topics.forEach(topic => {
          let topicTags = topic.tags;

          topicTags.forEach(tag => {

            if (tagParam.includes(tag)) { //increment count for active tags
              let index = kbTags.findIndex(t => t.id === tag);
              kbTags[index].count++;
            }
            else if (subtags.findIndex(t => t.id === tag) != -1) { //increment count for seen subtags
              let index = subtags.findIndex(t => t.id === tag);
              subtags[index].count++;
            }
            else { //add entry for unseen subtag
              let subtag = {
                id: tag,
                count: 1
              };
              subtags.push(subtag);
            }

          });
        });

        subtags.sort((a,b) => {
          switch(sortSetting) {
            case "alphabetical":
              return sortAlpha(a,b);
            case "popularity":
              return sortCount(a,b);
          }
        });

        this.set("subtags", subtags); 
      }

      kbTags.sort((a,b) => {
        switch(sortSetting) {
          case "alphabetical":
            return sortAlpha(a,b);
          case "popularity":
            return sortCount(a,b);
        }
      });

      this.set("tags", kbTags);
    });
  },
});
