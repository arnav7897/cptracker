const express = require("express")
const router = express.Router()
const axios = require("axios")
const LeetCodeData = require('../models/leetcodedata');
const leetcodedata = require("../models/leetcodedata");

const usernames = ["mohammedarshad_30","AspiringKarmokar","jaydip1235","endlesscheng","arignote"];
const contestName  = "weekly-contest-431";

const makeEmptytemp = (username) => {
    const template = [{
        contest_id: "none",
        username: username,
        rank: "999999999",
    }]
    return template
}

const fetchUser = async (username) => {
    try {
        const res = await axios.get(`https://lccn.lbao.site/api/v1/contest-records/user?contest_name=${contestName}&username=${username}&archived=false`)
        let data = (res.data);
        if (res.data.length == 0){
            data = makeEmptytemp(username)
        }
        return data[0];
    } catch (error) {
        console.error(`can't fetch data with username ${username}`, error)
    }
}

const delay = (ms) => Promise((resolve) => setTimeout(resolve,ms))
const fetchAllData = async (packetSize=5,ms=2000) => {
    const AllData = [];
    for (let i=0;i<usernames.length;i+=packetSize){
        let packet = usernames.slice(i,i+packetSize)
        const promise = packet.map((currUser) => {
            return fetchUser(currUser);
        })

        const resolvedPromise = await Promise.all(promise)
        const FilteredData = resolvedPromise.filter((currData) => currData)
        AllData.push(...FilteredData);

        if (i+packetSize < usernames.length){
            console.log("Waiting for next packet to fetch..")
            await delay(ms)
        }
    }
    return AllData;
}

router.post('/add', async (req,res) => {
    try {
        const data = await fetchAllData();
        await LeetCodeData.deleteMany({});
        await LeetCodeData.insertMany(data);
        res.status(200).json({
            message: "Leetcode data succefully added"
        })
    } catch (error) {
        res.status(500).json({
            message: "unable to add the data",
            error
        })
    }
})

router.get('/show', async (req,res) => {
    try {
        const data = await leetcodedata.find();
        res.status(200).json({
            data
        })
    } catch (error) {
        res.status(500).json({
            message: "unable to fetch data",
            error
        })
    }
})
module.exports = router