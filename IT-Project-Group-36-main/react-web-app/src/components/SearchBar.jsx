import React, {useState} from "react";
import "./SearchBar.css";

import { FaSearch } from "react-icons/fa";

export const SearchBar = ({ setResults, setTest }) => {
    const [input, setInput] = useState("");

    const fetchData = (value) => {
        fetch("https://jsonplaceholder.typicode.com/users")
        .then((response) => response.json())
        .then((json) => {
            const results = json.filter((user) => {
            return (
                value &&
                user &&
                user.name &&
                user.name.toLowerCase().includes(value)
            );
            
            });
            setResults(results);
        });
        
  };
    const handleChange = (value) => {
        setInput(value)
    }

    const handleEnterPress = (event) => {
        if (event.key === "Enter"){
            fetchData(event.target.value);
            fetch("http://localhost:5000/api/users")
            .then((response) => response.json())
            .then((json) => {console.log(json); setTest(json)}) ;
        }
    }


    return <div className="input-wrapper">
        <FaSearch id="search-icon"/>
        <input placeholder="Type to search..."
        value = {input}
        onChange = {(e) => handleChange(e.target.value)}
        onKeyDown={(e) => handleEnterPress(e)}/>  
    </div> 

}