import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export default function FetchCSVData() {
    const [csvData, setCsvData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [uniqueTags, setUniqueTags] = useState([]);
    const [activeTag, setActiveTag] = useState("Alle");
    const [selectedItem, setSelectedItem] = useState(null); // Track the selected item

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

    const fetchCSVData = useCallback(() => {
        const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVHWDusXO-XG4BoXsbGa82d1Mb-fK1aEQn83rUn0RkVMH_PWNIXis1AmUK7GqU4Lps-6fKFlaIaMTM/pub?output=csv';
        axios.get(csvUrl)
            .then((response) => {
                let parsedCsvData = parseCSV(response.data);

                parsedCsvData = parsedCsvData.sort(() => Math.random() - 0.5);

                const tags = new Set();
                parsedCsvData.forEach(item => {
                    const itemTags = item.Tags ? item.Tags.split(',').map(tag => tag.trim()) : [];
                    itemTags.forEach(tag => tags.add(tag));
                });

                setUniqueTags(["Alle", ...Array.from(tags)]);
                setCsvData(parsedCsvData);
                setFilteredData(parsedCsvData);
            })
            .catch((error) => {
                console.error('Error fetching CSV data:', error);
            });
    }, [parseCSV]);

    const handleFilter = (tag) => {
        setActiveTag(tag);
        if (tag === "Alle") {
            setFilteredData(csvData);
        } else {
            setFilteredData(
                csvData.filter(item =>
                    item.Tags?.split(',').map(tag => tag.trim()).includes(tag)
                )
            );
        }
    };

    const handleRowClick = (item) => {
        setSelectedItem(item); // Display the clicked item's profile
    };

    const handleCloseProfile = () => {
        setSelectedItem(null); // Close the profile and show the list again
    };

    useEffect(() => {
        fetchCSVData();
    }, [fetchCSVData]);

    return (
        <div className="overflow-x-auto">
            {!selectedItem ? (
                <>
                    {/* Tags Section */}
                    <div className="mb-4">
                        {/*<h3 className="text-xl font-bold mb-2">Tags</h3>*/}
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
                                    onClick={() => {
                                        const shuffledData = [...filteredData].sort(() => Math.random() - 0.5);
                                        setFilteredData(shuffledData);
                                    }}
                                >
                                    Aufgaben für BBR und MSA
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
                                    <td className="border border-gray-300 px-4 py-2">{item.Title}</td>
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
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                    >
                        ×
                    </button>
                    <h2 className="text-2xl font-bold mb-4">{selectedItem.Title}</h2>
                    <h3 className="text-xl font-medium mb-4">{selectedItem.Description}</h3>
                    {Array.from({ length: 10 }).map((_, index) => {
                        const imageKey = `Image${index + 1}`;
                        const captionKey = `Caption${index + 1}`;
                        //console.log(imageKey)
                        //console.log(selectedItem[imageKey])
                        if (selectedItem[imageKey]) {
                            return (
                                <div key={index} className="mb-4">
                                    <img
                                        src={selectedItem[imageKey]}
                                        alt={selectedItem[captionKey] || `Image ${index + 1}`}
                                        className="w-full h-auto mb-2 rounded"
                                    />
                                    {selectedItem[captionKey] && <p className="text-sm text-gray-700">{selectedItem[captionKey]}</p>}
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
