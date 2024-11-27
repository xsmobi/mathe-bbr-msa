import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

export default function FetchCSVData() {
    const [csvData, setCsvData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [uniqueTags, setUniqueTags] = useState([]);
    const [activeTag, setActiveTag] = useState("All");
    const [uniqueTypes, setUniqueTypes] = useState([]);
    const [activeType, setActiveType] = useState("All");
    const [selectedItem, setSelectedItem] = useState(null); // Track the selected item
    const [searchParams, setSearchParams] = useSearchParams();

    const pow = (text) => {
        if (!text) return ""; // Handle null or undefined text
        return text.replace(/([a-zA-Z0-9]+)\^(-?[a-zA-Z0-9]+)/g, (_, base, exponent) => `${base}<sup>${exponent}</sup>`);
    };

    const textwithbr = (text) => {
        if (!text) return ""; // Handle null or undefined text
        return text.replace(/\/\//g, "<br />"); // Replace all instances of // with <br />
    };
    /*
    const parseCSVRow = useCallback((row) => {
        const result = [];
        let currentField = '';
        let inQuotes = false;

        for (let i = 0; i < row.length; i++) {
            const char = row[i];

            if (char === '"' && row[i - 1] !== '\\') {
                inQuotes = !inQuotes; // Toggle inQuotes flag for quotes
            } else if (char === ',' && !inQuotes) {
                result.push(currentField.trim());
                currentField = '';
            } else {
                currentField += char;
            }
        }

        if (currentField) {
            result.push(currentField.trim());
        }

        return result;
    }, []);
    */
    const parseCSVRow = useCallback((row) => {
        const result = [];
        let currentField = '';
        let inQuotes = false;

        for (let i = 0; i < row.length; i++) {
            const char = row[i];

            if (char === '"' && row[i - 1] !== '\\') {
                inQuotes = !inQuotes; // Toggle inQuotes flag for quotes
            } else if (char === ',' && !inQuotes) {
                result.push(currentField.trim());
                currentField = '';
            } else {
                currentField += char;
            }
        }

        if (currentField) {
            result.push(currentField.trim());
        }

        return result;
    }, []);




    /*
    const parseCSV = useCallback((csvText) => {
        if (!csvText) return [];

        const rows = csvText.split(/\r?\n/);
        if (rows.length === 0) return [];

        const headers = parseCSVRow(rows[0]);
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            const rowData = parseCSVRow(rows[i]);
            if (!rowData || rowData.length === 0) continue;

            const rowObject = {};
            for (let j = 0; j < headers.length; j++) {
                rowObject[headers[j]?.trim()] = rowData[j]?.trim() || "";
            }
            data.push(rowObject);
        }
        return data;
    }, [parseCSVRow]);
    */
    const parseCSV = useCallback((csvText) => {
        if (!csvText) return [];

        const rows = csvText.split(/\r?\n/);
        if (rows.length === 0) return [];

        const headers = parseCSVRow(rows[0]);
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            const rowData = parseCSVRow(rows[i]);
            if (!rowData || rowData.length === 0) continue;

            const rowObject = {};
            for (let j = 0; j < headers.length; j++) {
                rowObject[headers[j]?.trim()] = rowData[j]?.trim() || "";
            }
            data.push(rowObject);
        }
        return data;
    }, [parseCSVRow]);

    const fetchConfigSpreadsheet = async (user) => {
        const configUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vThQ15wdx_k6NXDvAN7sYrtQdHjaBKWGyn0k8NoV4GHhKKxznsP82gRfChgB4K-4PxQptKZ50Bqc04L/pub?gid=0&single=true&output=csv';
        try {
            const response = await axios.get(configUrl);
            const configData = parseCSV(response.data);
            const userConfig = configData.find((item) => item.user === user);

            return userConfig?.CSVurl || null; // Return the URL if found, or null
        } catch (error) {
            console.error("Error fetching config spreadsheet:", error);
            return null;
        }
    };







    const fetchCSVData = useCallback(async () => {
        let csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVHWDusXO-XG4BoXsbGa82d1Mb-fK1aEQn83rUn0RkVMH_PWNIXis1AmUK7GqU4Lps-6fKFlaIaMTM/pub?output=csv';
    
        const user = searchParams.get("user");
        if (user) {
            const userCsvUrl = await fetchConfigSpreadsheet(user);
            if (userCsvUrl) {
                csvUrl = userCsvUrl;
            }
        }
    
        try {
            const response = await axios.get(csvUrl);
            const parsedCsvData = parseCSV(response.data);
    
            const tags = new Set();
            const types = new Set();
    
            parsedCsvData.forEach(item => {
                if (item.Tags) {
                    item.Tags.split(',').forEach(tag => tags.add(tag.trim()));
                }
                if (item.Type) {
                    types.add(item.Type.trim());
                }
            });
    
            setUniqueTags(["All", ...Array.from(tags)]);
            setUniqueTypes(["All", ...Array.from(types)]);
            setCsvData(parsedCsvData);
            setFilteredData(parsedCsvData); // Ensure filteredData is updated
        } catch (error) {
            console.error('Error fetching CSV data:', error);
        }
    }, [searchParams, parseCSV, fetchConfigSpreadsheet]);
    

    useEffect(() => {
        fetchCSVData();
    }, [fetchCSVData]);

    
    const handleFilter = (tag) => {
        setActiveTag(tag);
        if (tag === "All") {
            setFilteredData(csvData);
        } else {
            setFilteredData(
                csvData.filter(item =>
                    item.Tags?.split(',').map(tag => tag.trim()).includes(tag)
                )
            );
        }
    };

    const handleTypeFilter = (type) => {
        setActiveType(type);
        if (type === "All") {
            setFilteredData(csvData); // Reset filtering
        } else {
            setFilteredData(
                csvData.filter(item =>
                    item.Type?.trim() === type
                )
            );
        }
    };

    const handleRowClick = (item) => {
        setSearchParams({ task: item.id });
        setSelectedItem(item); // Display the clicked item's profile
    };

    const handleCloseProfile = () => {
        setSearchParams({});
        setSelectedItem(null); // Close the profile and show the list again
    };

    const handleTitleClick = () => {
        const shuffledData = [...filteredData].sort(() => Math.random() - 0.5);
        setFilteredData(shuffledData);
    };

    useEffect(() => {
        fetchCSVData();
    }, [fetchCSVData]);

    useEffect(() => {
        const taskId = searchParams.get('task');
        if (taskId) {
            const taskItem = csvData.find(item => item.id === taskId);
            if (taskItem) setSelectedItem(taskItem);
        } else {
            setSelectedItem(null);
        }
    }, [searchParams, csvData]);

    return (
        <div className="overflow-x-auto">
            {!selectedItem ? (
                <>
                    {/* Types Section */}
                    <div className="mb-4">
                        <h3 className="text-xl font-bold mb-2">Types</h3>
                        <div className="flex flex-wrap gap-2">
                            {uniqueTypes.map((type, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleTypeFilter(type)}
                                    className={`${
                                        activeType === type
                                            ? "bg-green-700 text-white"
                                            : "bg-green-500 hover:bg-green-700 text-white"
                                    } font-bold py-1 px-2 rounded-full text-xs`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>


                    {/* Tags Section */}
                    <div className="mb-4">
                        <h3 className="text-xl font-bold mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {uniqueTags.map((tag, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleFilter(tag)}
                                    className={`${
                                        activeTag === tag
                                            ? "bg-blue-700 text-white"
                                            : "bg-blue-500 hover:bg-blue-700 text-white"
                                    } font-bold py-1 px-2 rounded-full text-xs`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table Section */}
                    <table className="min-w-full table-auto border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-blue-500 text-white">
                                <th
                                    className="border border-gray-300 px-4 py-2 text-left cursor-pointer"
                                    onClick={handleTitleClick}
                                >
                                    Aufgaben, Beispiele, Lösungen <small>(klick für neu mischen)</small>
                                </th>
                            
                            
                            
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr
                                    key={index}
                                    className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} cursor-pointer`}
                                    onClick={() => handleRowClick(item)}
                                >
                                    <td className="border border-gray-300 px-4 py-2" dangerouslySetInnerHTML={{ __html: pow(item.Title) }}></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : (
                // Profile Section
                <div className="relative p-4 bg-gray-100 border border-gray-300 rounded-md">
                    <button
                        onClick={handleCloseProfile}
                        className="absolute top-2 right-2 text-gray-500 text-xl hover:text-gray-700 text-xl font-bold"
                    >
                        ×
                    </button>
                    <h2
                        className="text-2xl mb-4"
                        dangerouslySetInnerHTML={{ __html: pow(selectedItem.Title) }}
                    />
                    <h3 
                        className="text-xl text-slate-500 mb-4"
                        dangerouslySetInnerHTML={{ __html: pow(selectedItem.Description) }}
                    />
                    {/* Render Images, Videos, Audio */}
                    {Array.from({ length: 10 }).map((_, index) => {
                        const imageKey = `Image${index + 1}`;
                        const captionKey = `Caption${index + 1}`;
                        const videoKey = `Video${index + 1}`;
                        const audioKey = `Audio${index + 1}`;
                        console.log("Processed Caption:", pow(selectedItem[captionKey]));
                        return (
                            <div key={index} className="mb-4">
                                {selectedItem[imageKey] && (
                                    <div className="mb-4">
                                        <img
                                            src={selectedItem[imageKey]}
                                            alt={selectedItem[captionKey] || `Image ${index + 1}`}
                                            className="w-full h-auto mb-2 rounded"
                                        />
                                        {selectedItem[captionKey] && (
                                        <p
                                            className="text-base text-gray-900"
                                            dangerouslySetInnerHTML={{ __html: pow(selectedItem[captionKey]) }}
                                        />
                                        )}  
                                    </div>
                                )}
                                {!selectedItem[imageKey] && selectedItem[captionKey] && (
                                    <div className="mb-4">
                                        <p
                                            className="text-center leading-8 text-lg font-semibold text-gray-900"
                                            dangerouslySetInnerHTML={{ __html: textwithbr(pow(selectedItem[captionKey])) }}
                                        />
                                    </div>
                                )}
                                {selectedItem[videoKey] && (
                                    <div className="mb-4">
                                        <video controls className="w-full rounded-md">
                                            <source src={selectedItem[videoKey]} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                )}
                                {selectedItem[audioKey] && (
                                    <div className="mb-4">
                                        <audio controls className="w-full">
                                            <source src={selectedItem[audioKey]} type="audio/mpeg" />
                                            Your browser does not support the audio tag.
                                        </audio>
                                    </div>
                                )}
                            </div>
                        );
                    })}

{/* Render Links */}
{Array.from({ length: 3 }).map((_, index) => {
    const linkKey = `Link${index + 1}`;
    const urlKey = `url${index + 1}`;

    if (selectedItem[linkKey] && selectedItem[urlKey]) {
        return (
            <div key={index} className="mb-4">
                <a
                    href={selectedItem[urlKey]}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="block px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition-colors"
                >
                    {selectedItem[linkKey]}
                </a>
            </div>
        );
    }

    return null;
})}







                </div>
            )}
        </div>
    );
}