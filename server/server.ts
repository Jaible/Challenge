// Dependencies
import express from "express";
import cors from "cors";
import multer from "multer";
import csvToJson from "convert-csv-to-json";
import bodyParser from "body-parser";

// Middleware Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();
const port = 3000;
app.use(cors());

let userData: Array<Record<string, string>> = [];

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    next();
});

app.use(bodyParser.urlencoded({
    extended: false
 }));
 
 app.use(bodyParser.json());

// This endpoint is for extract the data of the DB trough
// the 'q' parameter.
// In this way are we going to get one record and send
// his data.
app.get("/api/users", async (req, res) => {
    // 1. Extract the query param 'q' from the request
    const { q } = req.query;

    // 2. Validate that we have the query param
    if(!q) {
        return res.status(500).json({ message: "Query param 'q' is required!" })
    }
    
    if(Array.isArray(q)) {
        return res.status(500).json({ message: "Query param 'q' must be a string!" })
    }

    // 3. Filter the data from the db with the query param
    const search = q.toString().toLowerCase();
    const filteredData = userData.filter(row => {
        return Object
            .values(row)
            .some(value => value.toLowerCase().includes(search));
    });

    // 4. Return 200 with the filtered data
    return res.status(200).json({ data: filteredData });
});

// From this function, we are going to upload the CSV
// to our DB. For that, we are going to use Multer to
// handle the CSV files.
app.post("/api/files", upload.single("file"), async (req, res) => {
    // 1. Extract the file from request
    const { file } = req;
    console.log(file?.mimetype)

    // 2. Validate that we have a file
    if(!file) {
        return res.status(500).json("A file has not been uploaded!");
    }

    let json: Array<Record<string, string>> = [];

    try {
        // 4. Transform the file to String
        const csv = Buffer.from(file.buffer).toString("utf-8");
        console.log(csv);

        // 5. Transform the string to JSON
        json = csvToJson.fieldDelimiter(",").csvStringToJson(csv);
    } catch(error) {
        return res.status(500).json({ message: "Error parsing the file!" })
    }
    
    // 6. Save the JSON to DB
    userData = json;

    // 7. Return 200 with the message and the JSON
    res.status(200).json({ data: json, message: "The file was uploaded!" })
});

app.listen(port, () => {
    console.log("Server is running at http://localhost:3000")
});