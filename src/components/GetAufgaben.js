import React, { useEffect, useState, useCallback } from 'react';
//import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import MarkdownParser from "./MarkdownParser";
const styles = {
    bg: "h-screen w-screen p-4 bg-gradient-to-r from-[#2f80ed] to-[#1cb5e0]",
    //bg: "h-screen w-screen p-4 bg-gradient-to-b from-[#ffffff] to-[#d6d6d6]",
    container: "bg-slate-100 max-w-[500px] w-full m-auto rounded-md shadow-xl p-4",
};

const sprueche=
[
    { "text": "Bereit für den Mathe-Boost? Starte jetzt und mach jeden Tag 1 Aufgabe & 1 Basics & 1 Beispiel" },
    { "text": "mathe-bbr-msa.app begleitet den Matheunterricht in der Mittelstufe und ist eine Hilfe für Schüler, Lehrer und Eltern." },
    { "text": "Ausfall beim BBR ist uncool. Bereite dich Ausfall-sicher vor, du kannst es! Jede/r kann die 5 vermeiden!" },
    { "text": "Keiner muss beim BBR einen Ausfall haben. Erfolg liegt in deiner Hand - mit dieser App: mache Original-BBR-Aufgaben, schaue dir Demos und Beispiele an, sichere dein Grundwissen."},
    { "text": "Klick auf den Tag BASICS und verbessere heute deine Grundlagen." },
    { "text": "Mathe GR-Kurs? Hol dir im zweiten Halbjahr den ER-Kurs!" },
    { "text": "Klicke auf AUFGABEN und hol dir jeden Tag eine Aufgabe mit Lösung" },
    { "text": "Hol dir eine Aufgabe mit Lösung und rechne sie in der Klasse vor - nimm dein Telefon mit dieser App zur Hilfe!" },
    { "text": "Trainiere dein Gehirn mit Kopfrechnen" },
    { "text": "Bei der Vorbereitung für den Mittleren Schulabschluss müssen alle Mathe-Themen der Mittelstufe wiederholt und immer wieder am Basis-Können der Grundschule festgemacht werden." },
    { "text": "Lerne mit Freude und Leichtigkeit. Lieber kurz und konzentriert als stundenlang und abgelenkt!" },
    { "text": "Du schaffst die MSA-Prüfung! Glaube an dich! Aber nicht nur glauben: du musst auch arbeiten"},
    { "text": "mathe-bbr-msa.app bietet einen Pool aus über 500 Aufgaben mit Lösungen, Anwendungsbeispielen und Lehrinhalten"},
    { "text": "mathe-bbr-msa.app bietet Textaufgaben aus den großen Mathethemen wie Lineare Funktionen, Lineare Gleichungssysteme oder Sinussatz, die in jeder Mittelschulabschlussprüfung vorkommen."},
    { "text": "In mathe-bbr-msa.app findest du Basisaufgaben, die dein Mathe-Grundverständnis testen. Du wiederholst die Grundlagen immer wieder neu."},
    { "text": "Grundlagen-Themen sind Proportionalität, Maßeinheiten, oder auch Umrechnungsaufgaben der Physik."},
    { "text": "Entdecke, dass Mathe Spaß machen kann. Du musst nur eine Aufgabe richtig gut können und damit angeben!" },
  ]


export default function FetchCSVData() {
    const [csvData, setCsvData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [uniqueTags, setUniqueTags] = useState([]);
    const [uniqueTypes, setUniqueTypes] = useState([]);
    const [activeTag, setActiveTag] = useState("All");
    const [activeType, setActiveType] = useState("All");
    const [selectedItem, setSelectedItem] = useState(null); // Track the selected item
    const [userConfig, setUserConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Combined loading state
    const [searchParams, setSearchParams] = useSearchParams();
    //const CONFIG_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vThQ15wdx_k6NXDvAN7sYrtQdHjaBKWGyn0k8NoV4GHhKKxznsP82gRfChgB4K-4PxQptKZ50Bqc04L/pub?gid=0&single=true&output=csv';

    /*
    const [currentQuote, setCurrentQuote] = useState(0);
    useEffect(() => {
        const intervalId = setInterval(() => {
          setCurrentQuote((prevQuote) => (prevQuote + 1) % sprueche.length);
        }, 1800); // Millisekunden
        return () => clearInterval(intervalId);
    }, []);
    */
    const [currentQuote, setCurrentQuote] = useState(0);
    const [shuffledSprueche, setShuffledSprueche] = useState([]);
    
    useEffect(() => {
      // Shuffle the array on mount
      const shuffledArray = [...sprueche].sort(() => Math.random() - 0.5);
      setShuffledSprueche(shuffledArray);
    
      // Set up the interval to change quotes
      const intervalId = setInterval(() => {
        setCurrentQuote((prevQuote) => (prevQuote + 1) % shuffledArray.length);
      }, 1800);
    
      // Cleanup the interval on unmount
      return () => clearInterval(intervalId);
    }, []);

    const pow = (text) => {
        if (!text) return ""; // Handle null or undefined text
        return text.replace(/([a-zA-Z0-9]+)\^(-?[a-zA-Z0-9]+)/g, (_, base, exponent) => `${base}<sup>${exponent}</sup>`);
    };

    const textwithbr = (text) => {
        if (!text) return ""; // Handle null or undefined text
        const result = text.replace(/\/\//g, "<br />"); // Replace all instances of // with <br />
        //console.log("Input:", text, "Output:", result); // Debug the transformation
        return result;
    };

    const fetchConfig = async () => {
        try {
            const response = await fetch('https://xsmobi.github.io/mathe-bbr-msa-config/config.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const config = await response.json();
            return config;
        } catch (error) {
            console.error("Error fetching configuration JSON:", error);
            return null;
        }
    };
    
    useEffect(() => {
        const loadUserConfig = async () => {
            const config = await fetchConfig(); // Fetch the full configuration JSON
            if (config) {
                const user = searchParams.get('user'); // Get 'user' from URL parameters
                const selectedConfig = user ? config.users[user] : config.default; // Explicitly check for user
                if (!selectedConfig) {
                    console.error("Default config not found in fetched configuration.");
                }
                setUserConfig(selectedConfig); // Update the `userConfig` state
            } else {
                console.error("Failed to fetch configuration.");
            }
            //setIsLoading(false); // Set loading to false here // 20240102 weg! Das war das Rerender problem
        };
        loadUserConfig();
    }, [searchParams]); // [searchParams muss!]
    
 
    const appsScriptUrl = "https://script.google.com/macros/s/AKfycbzWb5FF0kMz64OFPEI2XPcNk_DUf7KHkjr2jdYw3Fe_vwu0PP7jYiwh53QdoncYNXjDng/exec?type=api"
    
    const fetchCSVData = useCallback(async () => {
        try {
            const response = await fetch(appsScriptUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const sanitizedData = await response.json();
            const publishedData = sanitizedData.filter(item => item.Publish?.toLowerCase().includes("ok"));
            const shuffledData = publishedData.sort(() => Math.random() - 0.5);
            const limitedData = shuffledData.slice(0, 40);

            const tags = new Set();
            const types = new Set();

            limitedData.forEach(item => {
                if (item.Tags) item.Tags.split(',').forEach(tag => tags.add(tag.trim()));
                if (item.Type) types.add(item.Type.trim());
            });
            
            setUniqueTags(["All", ...Array.from(tags).sort()]);
            setUniqueTypes(["All", ...Array.from(types).sort()]);
            setCsvData(limitedData);
            setFilteredData(limitedData);
            setIsLoading(false); // Ensure loading state is updated here
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false); // Handle failure cases
        }
    }, [appsScriptUrl]); // Add appsScriptUrl to the dependency array

    /*
    useEffect(() => {
        if (userConfig && userConfig.url) { // Safely check userConfig and its properties
            fetchCSVData();
        }
    }, [fetchCSVData, userConfig]); // [fetchCSVData] muss
    */

    const handleFilter = (tag) => {
        setActiveTag(tag);
        let filtered = csvData;
    
        if (tag !== "All") {
            filtered = filtered.filter(item =>
                item.Tags?.split(',').map(tag => tag.trim()).includes(tag)
            );
        }
        if (activeType !== "All") {
            filtered = filtered.filter(item => item.Type?.trim() === activeType);
        }
        setFilteredData(filtered);
    };
    
    const handleTypeFilter = (type) => {
        setActiveType(type);
        let filtered = csvData;
    
        if (activeTag !== "All") {
            filtered = filtered.filter(item =>
                item.Tags?.split(',').map(tag => tag.trim()).includes(activeTag)
            );
        }
        if (type !== "All") {
            filtered = filtered.filter(item => item.Type?.trim() === type);
        }
        setFilteredData(filtered);
    };
    
    const handleRowClick = (item) => {
        const user = searchParams.get('user'); // Retrieve the current 'user' parameter
        const newParams = user ? { user, task: item.id } : { task: item.id }; // Retain 'user' if present
        setSearchParams(newParams);
        setSelectedItem(item); // Display the clicked item's profile
    };

    const handleCloseProfile = () => {
        const user = searchParams.get('user'); // Retrieve the current 'user' parameter
        const newParams = user ? { user } : {}; // Retain only 'user' if present
        setSearchParams(newParams);
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
        <>

        {userConfig && (
                <>

        <div className={`${userConfig.background}`}>
        {/*<div className={`${userConfig.background}`}>*/}
            {/*<div className="h-screen w-screen p-4 bg-gradient-to-r from-[#00a884] to-[#00416d]">Test</div>*/}
            {/*console.log("background: " + userConfig.background)*/}
        <div className={styles.container}>


        <div className="overflow-x-auto">
            
            {/* Header */}
            {userConfig && (
                <header className="relative flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-blue-500" style={{ color: userConfig.titlecolor || 'blue' }}>
                        {userConfig.title}
                    </h1>
                    {userConfig.logo && (
                        <img
                            className="h-12 w-12 rounded-md"
                            src={userConfig.logo}
                            alt={`${userConfig.company} Logo`}
                        />
                    )}
                </header>
            )}
            {/* Subheader */}
            {userConfig?.tagline && (
                <h2 className="text-xl text-gray-700 mb-4">
                    {userConfig.tagline}
                </h2>
            )}

            {!selectedItem ? (
                <>
                    {/* Types Section */}
                    
                    <div className="mb-4">
                        {/*<h3 className="text-xl font-bold mb-2">Types</h3>*/}
                        <div className="flex flex-wrap gap-2">
                            {uniqueTypes.map((type, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleTypeFilter(type)}
                                    className={`${
                                        activeType === type
                                            ? "bg-zinc-700 text-white"
                                            : "bg-zinc-500 hover:bg-green-700 text-white"
                                    } font-bold py-1 px-2 rounded-full text-xs`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    
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
                                            //? "bg-blue-700 text-white"
                                            //: "bg-blue-500 hover:bg-blue-700 text-white"
                                            ? "bg-zinc-700 text-white"
                                            : "bg-zinc-500 hover:bg-green-700 text-white"
                                    } font-bold py-1 px-2 rounded-full text-xs`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/*isLoading && (
                        <div id="motivational-quote" className="text-center">
                        <p className={sprueche[currentQuote].style}>
                        {sprueche[currentQuote].text}
                        </p>
                    </div>
                    )*/}
                    {isLoading && (
                        <div id="motivational-quote" className="prose prose-2xl max-w-none">
                        <p>
                            <span>"{shuffledSprueche[currentQuote].text}"</span> 
                            {/*<span className="text-sm text-gray-400">— {sprueche[currentQuote].author}</span>*/}
                        </p>
                        </div>
                    )}

                    {/* Table Section */}
                    {!isLoading && userConfig && filteredData.length > 0 && (
                    <table className="min-w-full table-auto border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-zinc-500 text-white">
                                <th
                                    className="border border-gray-300 px-4 py-2 text-left cursor-pointer"
                                    onClick={handleTitleClick}
                                >
                                    {userConfig?.taskheader || "Task List"}
                                    <button class="bg-gray-700 hover:bg-gray-500 text-white font-bold mx-2 py-0 px-4 rounded-full">
                                        shuffle
                                    </button>
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
                    )}
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
                    <h4 
                        className="text-xl text-slate-500 mb-4"
                        dangerouslySetInnerHTML={{ __html: pow(selectedItem.Description) }}
                    />
                    {/* Render Images, Videos, Audio */}
                    {Array.from({ length: 10 }).map((_, index) => {
                        const titleKey = `Title${index + 1}`;
                        const imageKey = `Image${index + 1}`;
                        const captionKey = `Caption${index + 1}`;
                        const videoKey = `Video${index + 1}`;
                        const audioKey = `Audio${index + 1}`;
                        //console.log("Processed Caption:", pow(selectedItem[captionKey]));
                        return (
                            <div key={index} className="mb-4 prose">
                                {selectedItem[titleKey] && (
                                    <div className="mb-4 mt-12">
                                        <h4
                                            className="text-center leading-8 text-lg font-semibold text-gray-900 bg-slate-300"
                                            dangerouslySetInnerHTML={{ __html: textwithbr(pow(selectedItem[titleKey])) }}
                                        />
                                    </div>
                                )}
                                {selectedItem[imageKey] && (
                                    <div className="mb-4">
                                        <img
                                            src={selectedItem[imageKey]}
                                            alt={selectedItem[titleKey] || `Image ${index + 1}`}
                                            className="w-full h-auto mb-2 rounded"
                                        />
                                    </div>
                                )}
                                
                                {selectedItem[captionKey] && (
                                <div className="mb-4">
                                    <MarkdownParser text={selectedItem[captionKey]} />
                                </div>
                                )}                                
                                {/*selectedItem[captionKey] && console.log(selectedItem[captionKey])*/}


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
                {/* Footer */}
                {userConfig && (
                <footer className="mt-4 text-center text-sm text-gray-600">
                    <p>{userConfig.company}</p>
                </footer>
            )}
        </div>

        </div>
        </div>
        
                </>
            )}
        </>

    ); // /return
}