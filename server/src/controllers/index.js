class IndexController {
    getData(req, res) {
        // Logic to fetch data
        res.json({ message: "Data fetched successfully" });
    }

    postData(req, res) {
        // Logic to handle data submission
        const data = req.body;
        res.json({ message: "Data submitted successfully", data });
    }
}

module.exports = IndexController;