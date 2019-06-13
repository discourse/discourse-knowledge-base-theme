import computed from "ember-addons/ember-computed-decorators";
import { on, observes } from "ember-addons/ember-computed-decorators";
import { ajax } from "discourse/lib/ajax";

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

export default Ember.Component.extend({

  tagName: "div",
  classNames: "kb-tags",
  kbHelper: Ember.inject.service(),

  @on("init")
  @observes("topics")
  getTags() { 
    let tagParam = this.kbHelper.kbParams();

    if (tagParam) {
       tagParam = tagParam.split(" ");
    }

    const topTags = this.get("site.top_tags");

    ajax("/tags.json").then((result) => {

      const sortSetting = settings.sort_tags;
      const siteTags = result.tags;
      let kbTags = siteTags.filter(tag => topTags.includes(tag.id));

      if (tagParam) { //if we're filtered already
        //filter down to just active tags
        kbTags = kbTags.filter(tag => tagParam.includes(tag.id));  
        kbTags.map((tag) => {
          tag.active = true
          tag.count = 0;
        });

        //process subtags
        const topics = this.get("topics");
        let subtags = []; 

        topics.map((topic) => {
          let topicTags = topic.tags;

          topicTags.map((tag) => {

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
