
let request = require('superagent');
let id = "sha256:023167701259d264307ac0615adfb27a87d2ddaf4a8c6b3dd67b31560c59c789";
let url = `https://g.codefresh.io/api/images/${id}/metadata`;
let images = "https://g.codefresh.io/api/images/?limit=10"
console.log(process.env.TOKEN);
const _ = require('lodash');
const util = require('util');
/*

/api/images/?limit=10&offset=0&select=imageName%20imageDisplayName%20branch%20commit%20created%20tags%20git%20sha%20commitURL%20repoOwner%20repoName%20service._id%20service.name%20metadata&type=tagged&metadata[cf_volume]=false&untagged=false
*/
request
  .get(url)
  .set('x-access-token', process.env.TOKEN)
  .set('accept', 'json')
//  .query({ action: 'edit', city: 'London' }) // query string
  //.use(prefix) // Prefixes *only* this request
  .end((err, res) => {
    console.log(res.bodys);
    let images = _.map(res.body.docs, (image)=>{
      console.log(util.format(image));
      return image;
    })
    // Do something
  });
