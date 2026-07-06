import React, { useEffect, useState, useRef } from "react";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { Search, TrendingFlat } from "@mui/icons-material";

const PageSearch = ({ pageList }) => {
  const [isListShow, setIsListShow] = useState(false);
  const inputRef = useOutsideClick(() => {
    setIsListShow(false);
  });
  const listRef = useRef(null);
  const [filteredPages, setFilteredPages] = useState(pageList);
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!search) {
      setFilteredPages(pageList);
      return;
    }
    setFilteredPages(
      pageList.filter((page) =>
        page.name.toLowerCase().includes(search.toLowerCase())
      )
    );
    setFocusedIndex(-1);
  }, [search, pageList]);

  // Auto-scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex];
      if (focusedElement) {
        focusedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth"
        });
      }
    }
  }, [focusedIndex]);

  const handleKeyDown = (e) => {
    if (!isListShow || filteredPages.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev < filteredPages.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredPages.length - 1
      );
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      const selectedPage = filteredPages[focusedIndex];
      dispatch(push(selectedPage));
      setSearch("");
      setIsListShow(false);
      setFocusedIndex(-1);
    } else if (e.key === "Escape") {
      setIsListShow(false);
      setFocusedIndex(-1);
    }
  };

  const handleSelectPage = (page) => {
    dispatch(push(page));
    setSearch("");
    setIsListShow(false);
    setFocusedIndex(-1);
  };

  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm) return text;

    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} className="bg-yellow-200 text-gray-900 font-semibold rounded px-0.5">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative w-[275px]" ref={inputRef}>
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
          <Search sx={{ fontSize: 20 }} />
        </div>
        <input
          type="text"
          placeholder="SEARCH PAGES..."
          className="w-full pl-8 pr-4 py-2.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-xl 
      focus:outline-none outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 
      hover:border-gray-300 transition-all duration-200 shadow-sm h-8
      placeholder:text-gray-400 placeholder:font-normal"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsListShow(true)}
          onKeyDown={handleKeyDown}
        />

        {/* Clear button */}
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setFocusedIndex(-1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown List */}
      {isListShow && filteredPages.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-2xl overflow-hidden animate-slideDown border-2 border-blue-400">
          {/* Header */}
          {/* <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {filteredPages.length} {filteredPages.length === 1 ? 'Page' : 'Pages'} Found
            </p>
          </div> */}

          {/* Results */}
          <ul
            ref={listRef}
            className="max-h-[225px] overflow-auto py-1 custom-scrollbar"
          >
            {filteredPages.map((page, index) => (
              <li
                key={page.id}
                className={`group px-1.5 py-0.5 mx-1 my-0.5 text-xs font-medium cursor-pointer transition-all duration-150 flex items-center justify-between rounded-lg
              ${index === focusedIndex
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
                onClick={() => handleSelectPage(page)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <span className="flex-1">
                  {highlightMatch(page.name, search)}
                </span>

                {/* Arrow indicator on hover/focus */}
                <TrendingFlat
                  className={`transition-all duration-200 ${index === focusedIndex
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                    }`}
                  sx={{ fontSize: 18 }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No Results */}
      {isListShow && filteredPages.length === 0 && search && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl overflow-hidden animate-slideDown border-2 border-blue-200">
          <div className="px-4 py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <Search sx={{ fontSize: 32, color: '#9CA3AF' }} />
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              No pages found
            </p>
            <p className="text-xs text-gray-500">
              Try searching with different keywords
            </p>
          </div>
        </div>
      )}

      {/* Add this style tag at the end of your component or in your global CSS */}
      <style jsx>{`
    .animate-slideDown {
      animation: slideDown 0.2s ease-out;
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `}</style>
    </div>
  );
};

export default PageSearch;