import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function SearchOrder() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  function handleSubmit(e) {
    e.preventDefault();
    if (!query) return;
    navigate(`/order/${query}`);
    setQuery("");
  }
  console.log(query);
  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Search order #"
        onChange={(e) => setQuery(e.target.value)}
        className="rounded-full px-4 py-2 text-sm
         placeholder:text-stone-400 w-28 sm:focus:w-72 sm:w-64
         transition-all duration-300 focus:ring focus:ring-yellow-500
         focus:outline-none focus:ring-opacity-500 bg-yellow-100"
      ></input>
    </form>
  );
}
