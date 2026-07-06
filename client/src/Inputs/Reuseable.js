import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import Modal from "../UiComponents/Modal";

const FORM_LABEL_CLASS = "block text-[11px] font-bold text-slate-700 mb-1";
const FORM_INPUT_TEXT_CLASS = "text-[11px]";

const RequiredLabel = ({ name }) => (
  <p>
    {`${name}`}
    <span className="text-red-500">*</span>{" "}
  </p>
);

export function childRecordCount(count) {
  if (!count) return false;
  return Object.values(count).some((v) => v > 0);
}
export const DropdownWithModal = forwardRef(
  (
    {
      name,
      beforeChange = () => {},
      onBlur = null,
      options,
      value,
      setValue,
      defaultValue,
      className = "",
      readOnly = false,
      required = false,
      disabled = false,
      clear = false,
      tabIndex = null,
      autoFocus = false,
      width = "full",
      country,
      openOnFocus = false,
      show,
      searchable = false,
      addNewLabel = "+ Add New",
      childComponent = null,
      addNewModalWidth = "w-[40%] h-[45%]",
      widthClass,
      dropdownMinWidth,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [showAddNew, setShowAddNew] = useState(false);
    const [editingOption, setEditingOption] = useState(null);
    const [deletingOption, setDeletingOption] = useState(null);
    const [dropdownPos, setDropdownPos] = useState({
      top: 0,
      left: 0,
      minWidth: 0,
      maxWidth: 0,
    });
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const listRef = useRef(null);
    const openedByFocusRef = useRef(false);

    const isDisabled = readOnly || disabled;

    const handleAddNewSuccess = (newValue) => {
      beforeChange();
      setValue(newValue);
      setShowAddNew(false);
      setIsOpen(false);
      setSearch("");
      if (onBlur) onBlur();
    };

    const handleDeleteSuccess = () => {
      if (deletingOption && String(deletingOption.value) === String(value)) {
        beforeChange();
        setValue("");
        if (onBlur) onBlur();
      }
      setDeletingOption(null);
    };

    // Use custom dropdown when addNewComponent is provided (native select can't host clickable options)
    const useCustomDropdown = searchable || !!childComponent;

    const updateDropdownPos = useCallback(() => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportPadding = 12;
        setDropdownPos({
          top: rect.bottom,
          left: rect.left,
          minWidth: Math.max(rect.width, dropdownMinWidth || 0),
          maxWidth: Math.max(
            Math.max(rect.width, dropdownMinWidth || 0),
            window.innerWidth - rect.left - viewportPadding,
          ),
        });
      }
    }, [dropdownMinWidth]);

    // Close on outside click (searchable mode)
    useEffect(() => {
      if (!useCustomDropdown) return;
      const handleClickOutside = (e) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target)
        ) {
          setIsOpen(false);
          setSearch("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [useCustomDropdown]);

    // Focus search input when dropdown opens; reset highlight
    useEffect(() => {
      if (isOpen && searchRef.current) {
        searchRef.current.focus();
      }
      if (!isOpen) setHighlightedIndex(-1);
    }, [isOpen]);

    // Reset highlight when search changes
    useEffect(() => {
      setHighlightedIndex(-1);
    }, [search]);

    // Scroll highlighted item into view
    useEffect(() => {
      if (highlightedIndex >= 0 && listRef.current) {
        const item = listRef.current.children[highlightedIndex];
        if (item) item.scrollIntoView({ block: "nearest" });
      }
    }, [highlightedIndex]);

    // Reposition dropdown on resize or scroll while open
    useEffect(() => {
      if (!isOpen) return;
      const handleReposition = () => updateDropdownPos();
      window.addEventListener("resize", handleReposition);
      window.addEventListener("scroll", handleReposition, true);
      return () => {
        window.removeEventListener("resize", handleReposition);
        window.removeEventListener("scroll", handleReposition, true);
      };
    }, [isOpen, updateDropdownPos]);

    useEffect(() => {
      if (ref?.current && openOnFocus) {
        ref.current.focus();
      }
    }, [openOnFocus]);

    // Native select (non-searchable, no addNewComponent)
    if (!useCustomDropdown) {
      const handleOnChange = (e) => {
        setValue(e.target.value);
      };
      const selectedLabel =
        options?.find((option) => String(option.value) === String(value))
          ?.show || "";
      return (
        <div className={`mb-1 ${width}`}>
          {name && (
            <label className={FORM_LABEL_CLASS}>
              {required ? <RequiredLabel name={name} /> : name}
            </label>
          )}
          {isDisabled ? (
            <div
              title={selectedLabel || "Select"}
              className={`flex h-7 w-full items-center px-3 py-0 border border-gray-300 rounded-lg
              bg-slate-100 text-slate-700 shadow-sm whitespace-nowrap overflow-hidden text-ellipsis
              ${FORM_INPUT_TEXT_CLASS} ${className}`}
            >
              {selectedLabel || "Select"}
            </div>
          ) : (
            <select
              ref={ref}
              onBlur={onBlur}
              autoFocus={autoFocus}
              tabIndex={tabIndex ?? undefined}
              defaultValue={defaultValue}
              required={required}
              className={`h-7 w-full px-3 py-0 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-150 shadow-sm ${readOnly || disabled ? "bg-slate-100" : ""}
            ${FORM_INPUT_TEXT_CLASS} ${className}`}
              value={value}
              onChange={(e) => {
                beforeChange();
                handleOnChange(e);
              }}
              onFocus={(e) => {
                if (openOnFocus) {
                  e.target.click();
                }
              }}
              disabled={isDisabled}
            >
              <option value="" hidden={!clear} className="text-gray-800">
                Select
              </option>
              {options?.map((option, index) => (
                <option
                  key={index}
                  value={option.value}
                  className="text-xs py-1 text-gray-800"
                >
                  {option.show}
                </option>
              ))}
            </select>
          )}
        </div>
      );
    }

    // Custom dropdown (searchable or has addNewComponent)
    const selectedLabel =
      options?.find((o) => String(o.value) === String(value))?.show || "";

    if (isDisabled) {
      return (
        <div className={`mb-1 ${width}`} ref={containerRef}>
          {name && (
            <label className={FORM_LABEL_CLASS}>
              {required ? <RequiredLabel name={name} /> : name}
            </label>
          )}
          <div
            title={selectedLabel || "Select"}
            className={`flex h-7 w-full items-center px-3 py-0 border border-gray-300 rounded-lg
            bg-slate-100 text-slate-700 shadow-sm whitespace-nowrap overflow-hidden text-ellipsis
            ${FORM_INPUT_TEXT_CLASS} ${className}`}
          >
            {selectedLabel || "Select"}
          </div>
        </div>
      );
    }

    const filtered = (options || []).filter((o) =>
      String(o.show).toLowerCase().includes(search.toLowerCase()),
    );

    const handleSelect = (optionValue, fromKeyboard = false) => {
      beforeChange();
      setValue(optionValue);
      setIsOpen(false);
      setSearch("");
      if (onBlur) onBlur();
      if (fromKeyboard) {
        setTimeout(() => {
          if (!buttonRef.current) return;

          const allFocusable = Array.from(
            document.querySelectorAll(
              'input:not([disabled]):not([readonly]):not([type="hidden"]), textarea:not([disabled]):not([readonly]), select:not([disabled]), button:not([disabled])',
            ),
          ).filter(
            (el) =>
              el.offsetParent !== null &&
              !el.closest('[data-skip-focus="true"]'),
          );

          const currentIndex = allFocusable.indexOf(buttonRef.current);

          let nextInput = null;

          for (let i = currentIndex + 1; i < allFocusable.length; i++) {
            const el = allFocusable[i];
            nextInput = el;
            break;
          }

          if (nextInput) {
            nextInput.focus();

            // open only dropdown buttons (not toggle/checkbox buttons)
            if (
              nextInput.tagName === "BUTTON" &&
              nextInput.type !== "button" &&
              !nextInput.querySelector('input[type="checkbox"]')
            ) {
              nextInput.click();
            }
          }
        }, 50);
      }
    };

    return (
      <div className={`mb-1 ${width}`} ref={containerRef}>
        {name && (
          <label className={FORM_LABEL_CLASS}>
            {required ? <RequiredLabel name={name} /> : name}
          </label>
        )}
        <button
          ref={(el) => {
            buttonRef.current = el;
            if (typeof ref === "function") {
              ref(el);
            } else if (ref) {
              ref.current = el;
            }
          }}
          autoFocus={autoFocus}
          type="button"
          disabled={isDisabled}
          tabIndex={tabIndex ?? undefined}
          onFocus={() => {
            if (!openOnFocus && !autoFocus) {
              if (!isDisabled) {
                openedByFocusRef.current = true;
                updateDropdownPos();
                setIsOpen(true);
              }
            } else {
            }
          }}
          // onFocus={() => {
          //   // ✅ do nothing (just focus)
          // }}
          onClick={() => {
            if (!isDisabled) {
              if (openedByFocusRef.current) {
                openedByFocusRef.current = false;
                return;
              }
              updateDropdownPos();
              setIsOpen((o) => !o);
            }
          }}
          onKeyDown={(e) => {
            if (isDisabled) return;

            // 🔥 DOWN ARROW → open dropdown
            if (e.key === "ArrowDown") {
              e.preventDefault();
              updateDropdownPos();
              setIsOpen(true);
            }

            // 🔥 ENTER → toggle dropdown
            if (e.key === "Enter") {
              e.preventDefault();
              updateDropdownPos();
              setIsOpen((o) => !o);
            }

            // 🔥 ESC → close dropdown
            if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          className={`flex h-7 w-full items-center justify-between border border-gray-300 rounded-lg px-3 py-0 text-left
          focus:outline-none focus:ring-1 outline-none focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm
          ${isDisabled ? "bg-slate-100 cursor-not-allowed" : "bg-white cursor-pointer"}
          ${FORM_INPUT_TEXT_CLASS} ${className}`}
        >
          <span className={selectedLabel ? "text-gray-800" : "text-gray-500"}>
            {selectedLabel || "Select"}
          </span>
          <svg
            className={`w-3 h-3 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: "fixed",
                top: dropdownPos.top,
                left: dropdownPos.left,
                minWidth: dropdownPos.minWidth,
                width: "max-content",
                maxWidth: dropdownPos.maxWidth,
                zIndex: 9999,
              }}
              className="bg-white border border-gray-300 rounded-lg shadow-lg"
            >
              <div className="p-1.5 border-b border-gray-200">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setHighlightedIndex((i) =>
                        Math.min(i + 1, filtered.length - 1),
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setHighlightedIndex((i) => Math.max(i - 1, 0));
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
                        handleSelect(filtered[highlightedIndex].value, true);
                      }
                    } else if (e.key === "Escape") {
                      setIsOpen(false);
                      setSearch("");
                      buttonRef.current?.focus();
                    }
                  }}
                />
              </div>
              <ul ref={listRef} className="max-h-48 overflow-y-auto py-1">
                {childComponent && !isDisabled && (
                  <li
                    onClick={() => {
                      setIsOpen(false);
                      setSearch("");
                      setShowAddNew(true);
                    }}
                    className="px-3 py-1.5 text-xs text-blue-600 font-semibold hover:bg-blue-100 cursor-pointer border-b border-gray-100"
                  >
                    {addNewLabel}
                  </li>
                )}
                {clear && (
                  <li
                    onClick={() => handleSelect("")}
                    className="px-3 py-1.5 text-xs text-gray-400 hover:bg-blue-100 cursor-pointer"
                  >
                    Select
                  </li>
                )}
                {filtered.length === 0 ? (
                  <li className="px-3 py-2 text-xs text-gray-400 text-center">
                    No results
                  </li>
                ) : (
                  filtered.map((option, index) => (
                    <li
                      key={index}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`group px-3 py-1.5 text-xs cursor-pointer flex justify-between items-center
                    ${index === highlightedIndex ? "bg-blue-100" : ""}
                    ${String(option.value) === String(value) ? "bg-blue-100 font-semibold text-blue-700" : "text-gray-800"}`}
                    >
                      <span
                        onClick={() => handleSelect(option.value)}
                        className="flex-1 pr-2 whitespace-nowrap"
                      >
                        {option.show}
                      </span>
                      {(childComponent || childComponent) && !isDisabled && (
                        <span className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {childComponent && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                setSearch("");
                                setEditingOption(option);
                              }}
                              className="p-0.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded"
                            >
                              <FaEdit size={10} />
                            </button>
                          )}
                          {childComponent && (
                            <button
                              type="button"
                              onClick={(e) => {
                                console.log(option, "option");
                                if (childRecordCount(option?._count)) {
                                  Swal.fire({
                                    title: `Child Record Exists`,
                                    icon: "warning",
                                  });
                                  return;
                                }
                                e.stopPropagation();
                                setIsOpen(false);
                                setSearch("");
                                setDeletingOption(option);
                              }}
                              className="p-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <FaTrash size={10} />
                            </button>
                          )}
                        </span>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>,
            document.body,
          )}
        {showAddNew &&
          childComponent &&
          (() => {
            const AddNew = childComponent;
            return (
              <Modal
                isOpen={showAddNew}
                onClose={() => setShowAddNew(false)}
                widthClass={addNewModalWidth}
              >
                <AddNew
                  onSuccess={handleAddNewSuccess}
                  onClose={() => setShowAddNew(false)}
                />
              </Modal>
            );
          })()}
        {editingOption &&
          childComponent &&
          (() => {
            const EditComp = childComponent;
            return (
              <Modal
                isOpen={!!editingOption}
                onClose={() => setEditingOption(null)}
                widthClass={addNewModalWidth}
              >
                <EditComp
                  editId={editingOption.value}
                  onSuccess={() => setEditingOption(null)}
                  onClose={() => setEditingOption(null)}
                />
              </Modal>
            );
          })()}
        {deletingOption &&
          childComponent &&
          (() => {
            const DeleteComp = childComponent;
            return (
              <Modal
                isOpen={!!deletingOption}
                onClose={() => setDeletingOption(null)}
                widthClass={addNewModalWidth}
              >
                <DeleteComp
                  deleteId={deletingOption.value}
                  deleteLabel={deletingOption.show}
                  onSuccess={handleDeleteSuccess}
                  onClose={() => setDeletingOption(null)}
                />
              </Modal>
            );
          })()}
      </div>
    );
  },
);
