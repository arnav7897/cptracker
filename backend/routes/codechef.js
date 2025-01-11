const express = require('express')
const puppeteer = require('puppeteer');
const router = express.Router();
const codechefdata = require("../models/codechefdata")

const extractData = (dataArray) => {
    const Rank = dataArray[0]?.split('\n\n')[1]?.trim();
    const OtherData = dataArray[1]?.split('\n');
    const Star = OtherData[1]?.trim()?.slice(0,2);
    const Username = OtherData[1]?.trim()?.slice(2)
    const Institute = OtherData[3]?.trim();
    const Score = dataArray[2]?.split('\n')[1]?.trim();
    const LastAc = dataArray[3]?.split('\n\n')[1]?.trim();
    const p1 = dataArray[4]?.split('\n')[1]?.trim(); 
    const p2 = dataArray[5]?.split('\n')[1]?.trim(); 
    const p3 = dataArray[6]?.split('\n')[1]?.trim(); 
    const p4 = dataArray[7]?.split('\n')[1]?.trim(); 
    return {
      Rank,
      Username,
      Star,
      Institute,
      Score,
      LastAc,
      p1,
      p2,
      p3,
      p4
    };
  };
const MapData = (DataArray) => {
const ContestRankingData = DataArray.map(currElement => {
    return extractData(currElement)
})
return ContestRankingData
}

router.get("/individual", async (req,res) => {
    const {contestName, category} = req.query;
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        const url = `https://www.codechef.com/rankings/${contestName}${category}?filterBy=Institution%3DIndian%20Institute%20of%20Information%20Technology%20Design%20and%20Manufacturing%2C%20Kurnool&itemsPerPage=100&order=asc&page=1&sortBy=rank`;
        await page.goto(url, { waitUntil: 'networkidle2' });

        await page.waitForSelector('.MuiPaper-root');

        const data = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.MuiPaper-root table tbody tr'));
            return rows.map(row => {
                const columns = row.querySelectorAll('td');
                return Array.from(columns).map(col => col.innerText.trim());
            });
        });
        await browser.close();
        contestData = data && data.length>0 && data[0][0]!="Sorry, there is no data to display" && MapData(data)
        res.status(200).json({
            contestData
        })
    } catch (error) {
        console.error("Error occurred while scraping:", error);
        res.status(500).send({ error: "Failed to fetch data" });
    }
})

router.get("/", async (req, res) => {
    try {
        const contestData = await codechefdata.find();
        res.status(200).json({
            contestData: contestData,
        })
    } catch (error) {
        console.error("Error occurred while scraping:", error);
        res.status(500).send({ error: "Failed to scrape the data" });
    }
});


module.exports = router;