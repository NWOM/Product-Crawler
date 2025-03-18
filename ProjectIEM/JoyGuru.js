const catList = require("./CategoryWithID.json");
//const fetch = require("node-fetch");
const fs = require("fs");
// I am using Async func in order to use await --->
async function main() {
  fs.writeFileSync("output.csv","");
  for (const item of catList) {
    const Link = item.deeplink.replace(
      /grofers:\/\/listing\?/g,
      "https://blinkit.com/v1/listing/widgets?"
      //here we changed the synatx of deeplink by replacing
    ); //To get Link of the JSON

    const headers = {
      // ":authority:":"blinkit.com",
      // ":method:" : "GET",

      accept: "*/*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      app_client: "consumer_web",
      app_version: "52434332",
      auth_key:
        "c761ec3633c22afad934fb17a66385c1c06c5472b4898b866b7306186d0bb477",
      "content-type": "application/json",
      cookie:
        "gr_1_deviceId=22fdd122-e7d4-4924-8379-912cc7a8c818; city=; __cfruid=60f328c83d9362a419eb2cb11e320d9fe3450eae-1742300917; _cfuvid=ESxyFZVtpAAJ_ADcmXN2sLzK5meHCuzf1otwzv3ftzU-1742300917085-0.0.1.1-604800000; _gcl_au=1.1.603506507.1742300918; _gid=GA1.2.254970200.1742300918; _fbp=fb.1.1742300917874.260506664125586078; gr_1_lat=22.5743545; gr_1_lon=88.3628734; gr_1_locality=Presidency%20Division; gr_1_landmark=undefined; __cf_bm=YBiOtqi1xaOkC.sJcOQotQ.1.TjIcOrLFMPAHNP9YyM-1742307216-1.0.1.1-gb.2hrTHp3YLB7IVN4iW8f3hEHEDDxuCLkazk9m3bx0BsJ50egeN_6ZelxnI6nGl7jyXcoFuNYWLCISii21bWqDFUbkBzRgcGkKWENeiFKM; _gat_UA-85989319-1=1; _ga=GA1.1.112071191.1742300918; _ga_JSMJG966C7=GS1.1.1742307216.2.1.1742307709.60.0.0;",
      // device_id: "22fdd122-e7d4-4924-8379-912cc7a8c818",
      lat: "22.5743545",
      lon: "88.3628734",
      // priority: "u=1, i",
      // referer: "https://blinkit.com/cn/chocolates/cid/9/944",
      // rn_bundle_version: "1009003012",
      // "sec-ch-ua":
      //   '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
      // "sec-ch-ua-mobile": "?0",
      // "sec-ch-ua-platform": '"Linux"',
      // "sec-fetch-dest": "empty",
      // "sec-fetch-mode": "cors",
      // "sec-fetch-site": "same-origin",
      // session_uuid: "12b4ece3-bbf8-4289-a6db-620912884092",
      "user-agent": "Mozilla/5.0",
      web_app_version: "1008010016",
    };
    let pageNumber = 1;
    let currentLink = Link + "&page=" + pageNumber; // For page number pagination i.e. category does not chnages but link changes
    //so currentLink needs to be updated onn every iteration 
    const output = []; // output buffer 
    output.push("Name,Price,MRP,Page Number");
    const catName = item.image_title;
    const filePath = catName + ".csv";
    while (true) {
      // if(fs.existsSync(filePath)){
      //   console.log("File Already Exists " + filePath);
      //   pageNumber++;
      //   currentLink = Link + "&page=" + pageNumber;
      //   continue;
      // }
      //These Fetch call get's pdt list for this catg and for thhe page
      const res = await fetch(currentLink, {
        // current LInk is fetched
        method: "GET", // Change to POST if required
        headers: headers,
      });
      if (res.status == 401 || res.status == 403 || res.status == 404) {
        console.error("Failed," + res.status + " " + currentLink);
        //console.log(await res.text()+"\n");
        fs.writeFileSync("error.html", await res.text());
        process.exit(1);
      } else if (res.status > 200) {
        console.error("Failed," + res.status + " " + currentLink);
        // pageNumber++;
        // currentLink = Link + "&page=" + pageNumber;
        continue;
      }
      const data = await res.json();
      const objectItems = data.objects;
      for (const obj of objectItems) {
        const title = obj?.tracking?.widget_meta?.title;
        const mrp = obj?.tracking?.widget_meta?.custom_data?.mrp;
        const price = obj?.tracking?.widget_meta?.custom_data?.price;
        output.push(title + "," + mrp + "," + price + "," + pageNumber);
      }

      const nextLink = data?.pagination?.next_url;
      if (!nextLink) {
        break;
      } else {
        pageNumber++;
        currentLink = Link + "&page=" + pageNumber; //New Page
      }
    }
    
    fs.appendFile("output.csv", output.join("\n"), (err) => {
      if (err) {
        console.error("Error writing file:", err);
      } else {
        console.log("File written success "+"output.csv");
      }
    });
  }
}
main();
