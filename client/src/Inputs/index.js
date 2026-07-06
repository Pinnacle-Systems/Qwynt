import validator from "validator";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { MultiSelect } from "react-multi-select-component";
import Select, { components } from "react-select";
import { findFromList } from "../Utils/helper";
import {
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaInfoCircle,
  FaPlus,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import secureLocalStorage from "react-secure-storage";
import {
  useGetPartyNewQuery,
  useGetPartyQuery,
} from "../redux/services/PartyMasterService";
import { useModal } from "../Basic/pages/home/context/ModalContext";
import useOutsideClick from "../CustomHooks/handleOutsideClick";
import Modal from "../UiComponents/Modal";
import DynamicRenderer from "../HostelStore/Components/DeliveryChallan/DynamicComponent";
import {
  focusNextGridField,
  focusPreviousGridField,
} from "../Basic/components/Reuseable/gridNavigation";
import { UserPermissions } from "../Utils/UserPermissions";
import Swal from "sweetalert2";

const FORM_LABEL_CLASS = "block text-[11px] font-bold text-slate-700 mb-1";
const FORM_LABEL_MUTED_CLASS = "block text-[11px] font-bold text-gray-600 mb-1";
const INLINE_LABEL_CLASS =
  "md:text-start flex text-[11px] font-bold text-slate-700";
const FORM_INPUT_TEXT_CLASS = "text-[11px]";

export const handleOnChange = (event, setValue, type) => {
  const inputValue = event.target.value;
  const inputSelectionStart = event.target.selectionStart;
  const inputSelectionEnd = event.target.selectionEnd;

  const upperCaseValue =
    type === "password" || type === "normal"
      ? inputValue
      : inputValue.toUpperCase();
  const valueBeforeCursor = upperCaseValue.slice(0, inputSelectionStart);
  const valueAfterCursor = upperCaseValue.slice(inputSelectionEnd);

  setValue(
    valueBeforeCursor +
      inputValue.slice(inputSelectionStart, inputSelectionEnd) +
      valueAfterCursor,
  );

  // Set the cursor position to the end of the input value
  setTimeout(() => {
    event.target.setSelectionRange(
      valueBeforeCursor.length +
        inputValue.slice(inputSelectionStart, inputSelectionEnd).length,
      valueBeforeCursor.length +
        inputValue.slice(inputSelectionStart, inputSelectionEnd).length,
    );
  });
};

export const MultiSelectDropdown = ({
  name,
  selected,
  labelName,
  setSelected,
  options,
  readOnly = false,
  tabIndex = null,
  className = "",
  inputClass,
  disabled = false,
  onBlur,
  onFocus,
  containerRef,
  onTabFromLastItem,
  labelSize = "12px",
}) => {
  const wrapperRef = useRef(null);
  const resolvedRef = containerRef || wrapperRef;

  useEffect(() => {
    if (!onTabFromLastItem) return;

    const handleGlobalKeyDown = (e) => {
      if (e.key !== "Tab" || e.shiftKey) return;

      const wrapper = resolvedRef.current;
      if (!wrapper) return;

      const active = document.activeElement;

      const isInsideWrapper = wrapper.contains(active);

      // Find any open portal menu in the document body
      // react-multiselect-checkboxes renders with class "dropdown-content" inside ".rmsc"
      const portalMenu = document.querySelector(".rmsc .dropdown-content");
      const isInsidePortal = portalMenu && portalMenu.contains(active);

      if (isInsideWrapper || isInsidePortal) {
        e.preventDefault();
        e.stopPropagation();
        onTabFromLastItem();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [onTabFromLastItem, resolvedRef]);

  return (
    <div
      ref={resolvedRef}
      className={`m-0 md:grid-cols-2 items-center z-0 data ${className}`}
    >
      <label
        className={`md:text-start block text-[${labelSize}] font-bold text-slate-700 mb-1 ${labelName}`}
      >
        {name}
      </label>
      <MultiSelect
        menuPortalTarget={document.body}
        options={options}
        value={selected}
        onChange={readOnly ? () => {} : setSelected}
        labelledBy="Select"
        hasSelectAll={false}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 99999 }),
          control: (base) => ({
            ...base,
            minHeight: "18px",
            height: "18px",
            borderRadius: "4px",
            boxShadow: "none",
            border: "1px solid #cbd5e1",
            padding: "0px",
            fontSize: "9px",
          }),
          // control: (base) => ({
          //   ...base,
          //   padding: "2px",
          //   borderRadius: "10px",
          //   boxShadow: "none",
          //   border: "1px solid #ccc",
          //   minHeight: "22px",
          // }),
          option: (base, state) => ({
            ...base,
            fontSize: "10px",
            backgroundColor: state.isSelected ? "#e0e7ff" : "#fff",
            padding: "4px 8px",
            color: state.isDisabled ? "#999" : "#000",
            cursor: state.isDisabled ? "not-allowed" : "pointer",
          }),
          chips: (base) => ({
            ...base,
            fontSize: "8px",
            padding: "0px 2px",
            minHeight: "14px",
          }),
          searchBox: (base) => ({
            ...base,
            fontSize: "10px",
            padding: "2px",
          }),
          dropdownButton: (base) => ({
            ...base,
            padding: "0px 4px",
            height: "20px",
          }),
          clearButton: (base) => ({
            ...base,
            padding: "0px 2px",
            height: "16px",
          }),
          valueContainer: (base) => ({
            ...base,
            padding: "0px 2px",
            gap: "1px",
          }),
        }}
        className="custom-multiselect"
        disabled={disabled}
        onBlur={onBlur}
        onFocus={onFocus}
      />
    </div>
  );
};
export const MultiSelectDropdownWithoutBorder = ({
  name,
  selected,
  labelName,
  setSelected,
  options,
  readOnly = false,
  tabIndex = null,
  className = "",
  inputClass,
  disabled = false,
}) => {
  return (
    <div className={`data ${className}`}>
      {name && (
        <label
          className={`md:text-start block text-[11px] font-bold text-slate-700 mb-1 ${labelName}`}
        >
          {name}
        </label>
      )}
      <MultiSelect
        menuPortalTarget={document.body}
        options={options}
        value={selected}
        onChange={readOnly ? () => {} : setSelected}
        labelledBy="Select"
        hasSelectAll={false}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 99999 }),
          container: (base) => ({
            ...base,
            fontSize: "10px",
            // minHeight: "28px",
            border: "none",
            outline: "none",
            boxShadow: "none",
            margin: 0,
            padding: 0,
            background: "transparent", // ← transparent so tr color shows
          }),
          control: (base) => ({
            ...base,
            padding: "0",
            backgroundColor: "transparent", // ← transparent
            border: "none",
            outline: "none",
            boxShadow: "none",
            borderRadius: 0,

            margin: 0,
          }),
          valueContainer: (base) => ({
            ...base,
            padding: "0 6px",
            border: "none",
            background: "transparent", // ← transparent
          }),
          // Hide the built-in dropdown arrow
          dropdownButton: (base) => ({
            ...base,
            display: "none", // ← hide default arrow
          }),
          option: (base, state) => ({
            ...base,
            fontSize: "10px",
            backgroundColor: state.isSelected ? "#e0e7ff" : "#fff",
            padding: "4px 8px",
          }),
          chips: (base) => ({
            ...base,
            fontSize: "10px",
            padding: "2px 4px",
          }),
          searchBox: (base) => ({
            ...base,
            fontSize: "12px",
            padding: "2px",
            border: "none",
            outline: "none",
          }),
        }}
        className="custom-multiselectBorderNo"
        disabled={readOnly || disabled}
      />
    </div>
  );
};
export const TextInput = forwardRef(
  (
    {
      name,
      label,
      type = "text",
      value,
      setValue,
      readOnly = false,
      className = "",
      required = false,
      disabled = false,
      tabIndex = null,
      onBlur = null,
      width = "full",
      autoFocus,
      onKeyDown,
      onFocus,
      max,
    },
    ref,
  ) => {
    const handleBlur = (e) => {
      if (type === "number") {
        const val = Number(e.target.value);

        if (!isNaN(val) && val < 0) {
          Swal.fire({
            icon: "warning",
            title: "Invalid Quantity",
            text: `${name || "Value"} cannot be negative`,
            confirmButtonColor: "#6366f1",
          });
          setValue(""); // or "" if you prefer
          return;
        }

        if (!isNaN(val) && max !== undefined && val > max) {
          Swal.fire({
            icon: "warning",
            title: "Invalid Quantity",
            text: `${name || "Value"} cannot exceed ${max}`,
            confirmButtonColor: "#6366f1",
          });
          setValue(max);
          return;
        }
      }

      // Call parent onBlur if provided
      if (onBlur) onBlur(e);
    };
    return (
      <div className={`mb-1 ${width}`}>
        {name && (
          <label className={FORM_LABEL_CLASS}>
            {required ? <RequiredLabel name={label ? label : name} /> : name}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={(e) =>
            type === "number"
              ? setValue(e.target.value)
              : handleOnChange(e, setValue, type)
          }
          onBlur={handleBlur}
          placeholder={name}
          readOnly={readOnly}
          onFocus={onFocus}
          disabled={disabled}
          tabIndex={tabIndex ?? undefined}
          className={`h-7 w-full px-3 py-0 border border-gray-300 rounded-lg
          outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm
          ${
            readOnly || disabled
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white hover:border-gray-400"
          }
          ${FORM_INPUT_TEXT_CLASS} ${className}`}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
        />
      </div>
    );
  },
);

export const LongTextInput = ({
  name,
  type,
  value,
  setValue,
  className,
  readOnly,
  required = false,
  disabled = false,
  tabIndex = null,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 items-center md:my-0.5 md:px-1 data gap-1">
      <label className={INLINE_LABEL_CLASS}>
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type={type}
        disabled={disabled}
        required={required}
        className={className}
        value={value}
        onChange={(e) => {
          type === "number"
            ? setValue(e.target.value)
            : handleOnChange(e, setValue);
        }}
        readOnly={readOnly}
      />
    </div>
  );
};

export const DisabledInput = ({
  name,
  type,
  value,
  className = "",
  textClassName = "",
  tabIndex = null,
}) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-3 items-center md:my-0.5 md:px-1 data  ${className}`}
    >
      <label className={`md:text-start flex ${className} `}>{name}</label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type={type}
        className={`input-field ${textClassName} focus:outline-none md:col-span-2 border-2 border-emerald-800 p-1 rounded`}
        value={value}
        disabled
      />
    </div>
  );
};

export const LongDisabledInput = ({
  name,
  type,
  value,
  className,
  tabIndex = null,
}) => {
  return (
    <div
      className={`grid grid-flow-col  items-center md:my-0.5 md:px-1 data ${className}`}
    >
      <label className={`md:text-start flex ${className} `}>{name}</label>
      <input
        type={type}
        className={`h-6 border border-gray-500 rounded`}
        value={value}
        disabled
      />
    </div>
  );
};

export const TextArea = ({
  name,
  value,
  setValue,
  readOnly,
  required = false,
  disabled = false,
  rows = 2,
  cols = 30,
  tabIndex = null,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 md:my-1 md:px-1 data">
      <label className="md:text-start flex">
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <textarea
        tabIndex={tabIndex ? tabIndex : undefined}
        name={name}
        disabled={disabled}
        required={required}
        className="focus:outline-none md:col-span-2 border border-gray-500 rounded"
        cols={cols}
        rows={rows}
        value={value}
        onChange={(e) => {
          handleOnChange(e, setValue);
        }}
        readOnly={readOnly}
      ></textarea>
    </div>
  );
};

export const DropdownInput = forwardRef(
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
      openOnFocus = false, // new prop
    },
    ref,
  ) => {
    const handleOnChange = (e) => {
      setValue(e.target.value);
    };

    const isDisabled = readOnly || disabled;
    const selectedLabel =
      options?.find((option) => String(option.value) === String(value))?.show ||
      "";

    useEffect(() => {
      if (ref?.current && openOnFocus) {
        ref.current.focus();
      }
    }, [openOnFocus]);

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
    outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
    transition-all duration-150 shadow-sm
    ${readOnly || disabled ? "bg-slate-100 cursor-not-allowed" : "bg-white cursor-pointer"}
    ${!value || value === "" ? "text-gray-500" : "text-gray-800"}
    ${FORM_INPUT_TEXT_CLASS} ${className}
    appearance-none bg-no-repeat bg-right pr-8`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundSize: "12px",
              backgroundPosition: "right 0.75rem center",
            }}
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
  },
);

export const LongDropdownInput = ({
  name,
  options,
  value,
  setValue,
  defaultValue,
  className,
  readOnly,
  required = false,
  disabled = false,
  clear = false,
  tabIndex = null,
}) => {
  const handleOnChange = (e) => {
    setValue(e.target.value);
  };
  return (
    <div className="grid grid-cols-12 items-center md:my-1 md:px-1 data">
      <label className={`text-start text-sm col-span-2 `}>
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <select
        tabIndex={tabIndex ? tabIndex : undefined}
        defaultValue={defaultValue}
        id="dd"
        required={required}
        name="name"
        className={`border-2 border-emerald-800 h-6 rounded ${className} col-span-10`}
        value={value}
        onChange={(e) => {
          handleOnChange(e);
        }}
        disabled={readOnly}
      >
        <option value="">Select</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.show}
          </option>
        ))}
      </select>
    </div>
  );
};

export const RadioButton = ({
  label,
  value,
  onChange,
  readOnly,
  className,
  tabIndex = null,
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <input
        type="radio"
        tabIndex={tabIndex ? tabIndex : undefined}
        checked={value}
        onChange={onChange}
      />
      <label>{label}</label>
    </div>
  );
};

export const DropdownInputWithoutLabel = ({
  options,
  value,
  setValue,
  readOnly,
  required = false,
  disabled = false,
  tabIndex = null,
}) => {
  const handleOnChange = (e) => {
    setValue(e.target.value);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center md:my-1 md:px-1 data">
      <select
        tabIndex={tabIndex ? tabIndex : undefined}
        required={required}
        name="name"
        className="input-field md:col-span-2 border col-span-1 rounded"
        value={value}
        onChange={(e) => {
          handleOnChange(e);
        }}
        disabled={readOnly}
      >
        <option value="" hidden>
          Select
        </option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.show}
          </option>
        ))}
      </select>
    </div>
  );
};

export const CurrencyInput = ({
  name,
  value,
  setValue,
  readOnly,
  required = false,
  disabled = false,
  tabIndex = null,
}) => {
  const handleOnChange = (e) => {
    setValue(e.target.value);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center md:my-1 md:px-1 data">
      <label htmlFor="id" className={INLINE_LABEL_CLASS}>
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type="number"
        disabled={disabled}
        required={required}
        className="input-field focus:outline-none md:col-span-2 border rounded"
        min="1"
        step="any"
        id="id"
        value={value}
        onChange={(e) => {
          handleOnChange(e);
        }}
        readOnly={readOnly}
      />
    </div>
  );
};

const RequiredLabel = ({ name }) => (
  <p>
    {`${name}`}
    <span className="text-red-500">*</span>{" "}
  </p>
);

export const DateInput = ({
  name,
  value,
  setValue,
  readOnly,
  required = false,
  type = "date",
  disabled = false,
  tabIndex = null,
  inputClass,
  inputHead,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center md:my-1 md:px-1 data w-full">
      <label
        htmlFor="id"
        className={`${INLINE_LABEL_CLASS} ${inputHead || ""}`}
      >
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type={type}
        disabled={disabled}
        required={required}
        className={`input-field focus:outline-none md:col-span-2 border border-gray-500 rounded w-full ${inputClass}`}
        id="id"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        readOnly={readOnly}
      />
    </div>
  );
};

export const LongDateInput = ({
  name,
  value,
  setValue,
  readOnly,
  className,
  required = false,
  type = "date",
  disabled = false,
  tabIndex = null,
}) => {
  return (
    <div className="grid grid-flow-col item-center justify-center gap-12 w-56 items-center md:px-1 data">
      <label htmlFor="id" className={INLINE_LABEL_CLASS}>
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type={type}
        disabled={disabled}
        required={required}
        className={`${className} focus:outline-none border border-gray-500 form-border-color rounded h-6`}
        id="id"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        readOnly={readOnly}
      />
    </div>
  );
};

export const CheckBox = ({
  name,
  value,
  setValue,
  readOnly = false,
  className,
  required = false,
  disabled = false,
  tabIndex = null,
}) => {
  const handleOnChange = (e) => {
    setValue(!value);
  };
  return (
    <div className="flex justify-center items-center md:m-1">
      <label
        htmlFor="id"
        className={`flex items-center justify-center w-full gap-2 text-xs font-medium text-slate-700 ${className}`}
      >
        <input
          tabIndex={tabIndex ? tabIndex : undefined}
          type="checkbox"
          required={required}
          className=""
          checked={value}
          onChange={(e) => {
            handleOnChange(e);
          }}
          disabled={readOnly || disabled}
        />
        <span className="mt-1">{name}</span>
      </label>
    </div>
  );
};

export const CheckBoxNew = ({
  name,
  value,
  setValue,
  readOnly = false,
  className,
  required = false,
  disabled = false,
  tabIndex = null,
}) => {
  return (
    <label
      className={`inline-flex items-center gap-1.5 cursor-pointer select-none
        text-xs font-medium text-slate-800 leading-none
        ${readOnly || disabled ? "opacity-50 cursor-not-allowed" : "hover:text-indigo-600"}
        ${className || ""}`}
    >
      <input
        tabIndex={tabIndex ?? undefined}
        type="checkbox"
        required={required}
        checked={value}
        onChange={() => !readOnly && !disabled && setValue(!value)}
        disabled={readOnly || disabled}
        className="
          w-[14px] h-[14px] min-w-[14px] min-h-[14px]
          rounded
          border border-slate-400
          accent-indigo-600
          cursor-pointer
          disabled:cursor-not-allowed
        "
      />
      <span className="mt-1">{name}</span>
    </label>
  );
};

export const validateEmail = (data) => {
  return validator.isEmail(data);
};

export const validateMobile = (data) => {
  let regMobile = /^[6-9]\d{9}$/;
  return regMobile.test(data);
};

export const validatePan = (data) => {
  let regpan = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
  return regpan.test(data);
};

export const validatePincode = (data) => {
  return data.toString().length === 6;
};

export const DropdownWithSearch = ({
  options,
  value,
  setValue,
  readOnly,
  required,
}) => {
  const [currentIndex, setCurrentIndex] = useState("");
  useEffect(() => setCurrentIndex(new Date()), []);
  useEffect(() => {
    const dropDownElement = document.getElementById(`dropdown${currentIndex}`);
    dropDownElement.addEventListener("keydown", function (ev) {
      var focusableElementsString = '[tabindex="0"]';
      let ol = dropDownElement.querySelectorAll(focusableElementsString);
      if (ev.key === "ArrowDown") {
        for (let i = 0; i < ol.length; i++) {
          if (ol[i] === ev.target) {
            let o = i < ol.length - 1 ? ol[i + 1] : ol[0];
            o.focus();
            break;
          }
        }
        ev.preventDefault();
      } else if (ev.key === "ArrowUp") {
        for (let i = 0; i < ol.length; i++) {
          if (ol[i] === ev.target) {
            let o = ol[i - 1];
            o.focus();
            break;
          }
        }
        ev.preventDefault();
      }
    });

    return () => {
      dropDownElement.removeEventListener("keydown", () => {});
    };
  }, [currentIndex]);

  return (
    <div id={`dropdown${currentIndex}`}>
      <Select
        className=""
        searchBy="name"
        options={options || []}
        key={value}
        // ContentRenderer={ContentRenderer}
        // itemRenderer={ItemRenderer}
        disabled={readOnly}
        labelField="name"
        valueField="id"
        multi={false}
        values={
          value
            ? [
                {
                  id: value,
                  name: findFromList(value, options || [], "name"),
                },
              ]
            : []
        }
        onChange={(value) => {
          setValue(value[0] ? value[0]?.id : "");
        }}
      />
    </div>
  );
};

export function ReusableInput({
  setValue,
  label,
  type,
  value,
  className = "",
  placeholder,
  readOnly,
  disabled,
  autoFocus,
  onKeyDown,
  required,
}) {
  return (
    <div className="mb-1">
      {required ? (
        <span className={FORM_LABEL_CLASS}>
          {label} <span className="text-red-500">*</span>
        </span>
      ) : (
        <span className={FORM_LABEL_CLASS}>{label}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) =>
          type === "number"
            ? setValue(e.target.value)
            : handleOnChange(e, setValue)
        }
        placeholder={placeholder}
        readOnly={readOnly}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={`h-7 w-full px-2 py-0 border border-slate-300 rounded-md 
          focus:border-indigo-300 outline-none transition-all duration-200
          hover:border-slate-400 ${
            readOnly || disabled ? "bg-slate-100" : ""
          } ${FORM_INPUT_TEXT_CLASS} ${className}`}
        autoFocus={autoFocus}
      />
    </div>
  );
}

export function ReusableInputNew({
  setValue,
  label,
  type,
  value,
  className = "",
  placeholder,
  readOnly,
  disabled,
}) {
  return (
    <div className="mb-1">
      {label && <label className={FORM_LABEL_CLASS}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) =>
          type === "number"
            ? setValue(e.target.value)
            : handleOnChange(e, setValue)
        }
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className={`h-7 w-full px-2 py-0 border border-slate-300 rounded-md 
          focus:border-indigo-300 focus:outline-none transition-all duration-200
          hover:border-slate-400 ${
            readOnly || disabled ? "bg-slate-100" : ""
          } ${FORM_INPUT_TEXT_CLASS} ${className}`}
      />
    </div>
  );
}

export const ReusableSearchableInput = forwardRef(
  (
    {
      label,
      placeholder,
      onDeleteItem,
      optionList,
      component,
      setSearchTerm,
      searchTerm,
      readOnly,
      nextRef,
      required,
      show,
      name,
      disabled,
      isSupplier = false,
    },
    ref,
  ) => {
    // console.log(optionList?.filter(item  => item[show]), "optionList")

    const companyId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    );

    const userId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userId",
    );

    const {
      data: partyList,
      isLoading: isPartyLoading,
      isFetching: isPartyFetching,
    } = useGetPartyQuery({ params: { companyId, userId } });

    const filteredPartyList = isSupplier
      ? partyList?.data?.filter((item) => item.isSupplier === true)
      : partyList?.data;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [editingItem, setEditingItem] = useState("");
    const containerRef = useRef(null);
    const modal = useModal();
    const [openModel, setOpenModel] = useState(false);
    const { openAddModal } = modal || {};
    const [search, setSearch] = useState("");
    const [filteredPages, setFilteredPages] = useState([]);
    const [isListShow, setIsListShow] = useState(false);

    const inputRef = useOutsideClick(() => {
      setIsListShow(false);
    });
    const internalInputRef = useRef(null);

    useImperativeHandle(ref, () => internalInputRef.current);
    useEffect(() => {
      const input = internalInputRef.current;
      if (!input) return;

      const handleFocus = () => {
        if (disabled || readOnly) return;

        setIsDropdownOpen(true);
        setIsListShow(true);
      };

      input.addEventListener("focus", handleFocus);

      return () => {
        input.removeEventListener("focus", handleFocus);
      };
    }, [disabled, readOnly]);

    // close dropdown if click outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setIsDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleEdit = (id, e) => {
      e.stopPropagation();
      setEditingItem(id);
      setIsDropdownOpen(false);
      setOpenModel(true);
    };

    const handleDelete = (itemId, e) => {
      onDeleteItem(itemId);
    };

    useEffect(() => {
      if (!partyList) return;
      if (!search) {
        setFilteredPages(filteredPartyList);
      }
      setFilteredPages(
        filteredPartyList?.filter((page) => {
          return page?.name?.toLowerCase().includes(search.toLowerCase());
        }),
      );
    }, [search, partyList, isPartyFetching, isPartyLoading]);

    // Arrow navigation
    useEffect(() => {
      let pageSearchComponent = document.getElementById("pageSearch");
      if (!pageSearchComponent) return;
      const keyHandler = (ev) => {
        var focusableElementsString = '[tabindex="0"]';
        let ol = document.querySelectorAll(focusableElementsString);
        if (ev.key === "ArrowDown") {
          for (let i = 0; i < ol.length; i++) {
            if (ol[i] === ev.target) {
              let o = i < ol.length - 1 ? ol[i + 1] : ol[0];
              o.focus();
              break;
            }
          }
          ev.preventDefault();
        } else if (ev.key === "ArrowUp") {
          for (let i = 0; i < ol.length; i++) {
            if (ol[i] === ev.target) {
              let o = ol[i - 1];
              o.focus();
              break;
            }
          }
          ev.preventDefault();
        }
      };
      pageSearchComponent.addEventListener("keydown", keyHandler);
      return () => {
        pageSearchComponent.removeEventListener("keydown", keyHandler);
      };
    }, [isDropdownOpen]);

    return (
      <>
        <Modal
          isOpen={openModel}
          onClose={() => setOpenModel(false)}
          widthClass={"w-[90%] h-[98%]"}
        >
          <DynamicRenderer
            componentName={component}
            editingItem={editingItem}
            onCloseForm={() => setOpenModel(false)}
          />
        </Modal>

        <div
          className="relative text-sm w-full"
          id="pageSearch"
          ref={containerRef}
        >
          {/* <label className="block text-xs font-bold text-slate-700 mb-1">
            {label}
          </label> */}
          {label && (
            <label className="block text-xs font-bold text-gray-600 mb-1">
              {required ? <RequiredLabel name={label ? label : name} /> : label}
            </label>
          )}

          <div className="flex gap-2">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
              {isListShow ? (
                <input
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-md 
              focus:border-indigo-300 focus:outline-none transition-all duration-200
              hover:border-slate-400 text-gray-800"
                  placeholder={placeholder}
                  value={search}
                  onChange={(e) => {
                    setIsDropdownOpen(true);
                    setSearchTerm(e.target.value);
                  }}
                  onFocus={(e) => {
                    // setSearchTerm(e.target.value)

                    setIsDropdownOpen(true);
                    setIsListShow(true);
                  }}
                  disabled={disabled || readOnly}
                  tabIndex={0}
                  ref={internalInputRef}
                />
              ) : (
                <input
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-md 
                  focus:border-indigo-300 focus:outline-none transition-all duration-200
                  hover:border-slate-400 text-gray-800"
                  ref={internalInputRef} // ✅ parent gets this ref
                  placeholder={placeholder}
                  value={findFromList(searchTerm, optionList, "name")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (nextRef?.current) {
                        nextRef.current.focus();
                      }
                    }
                  }}
                  onFocus={() => {
                    setIsDropdownOpen(true);
                    setIsListShow(true);
                  }}
                  disabled={disabled || readOnly}
                  tabIndex={0}
                />
              )}
            </div>

            <div className="relative">
              <button
                className="h-full px-3 py-1.5 border border-green-500 rounded-md
              hover:bg-green-500 text-green-600 hover:text-white transition-colors flex items-center justify-center"
                disabled={disabled || readOnly}
                onClick={() => {
                  setEditingItem("new");
                  setOpenModel(true);
                }}
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
                aria-label="Add supplier"
              >
                <FaPlus className="text-sm" />
              </button>
              {tooltipVisible && (
                <div className="absolute  z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
                  <div className="flex items-start">
                    <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                    <span>Click to add a new supplier</span>
                  </div>
                  <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
                </div>
              )}
            </div>
          </div>

          {isDropdownOpen && (
            <div className="border border-slate-200 rounded-md shadow-md bg-white mt-1 max-h-40 overflow-y-auto z-20 absolute w-full">
              {optionList?.length > 0 ? (
                filteredPages?.map((item) => (
                  <div
                    key={item.id}
                    tabIndex={0}
                    className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer transition-colors flex justify-between items-center group"
                    onClick={() => {
                      setSearchTerm(item.id);
                      setIsDropdownOpen(false);
                      setSearch("");
                      setIsListShow(false);
                      if (nextRef?.current) {
                        nextRef?.current?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearchTerm(item.id);
                        setSearch("");
                        setIsListShow(false);
                        setIsDropdownOpen(false);
                        if (nextRef?.current) {
                          e.preventDefault();
                          nextRef?.current?.focus();
                        }
                      }
                    }}
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="text-indigo-600 hover:text-indigo-800 p-1"
                        onClick={(e) => handleEdit(item?.id, e)}
                        title="Edit supplier"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-1"
                        onClick={(e) => handleDelete(item?.id)}
                        title="Delete supplier"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-indigo-600 hover:bg-slate-50 flex items-center gap-2"
                  onClick={() => {
                    setEditingItem(null);
                    setIsDropdownOpen(false);
                    openAddModal();
                  }}
                ></button>
              )}
            </div>
          )}
        </div>
      </>
    );
  },
);

export const TextInputNew = forwardRef(
  (
    {
      name,
      label,
      type = "text",
      value,
      setValue,
      readOnly = false,
      className = "",
      required = false,
      disabled = false,
      tabIndex = null,
      onBlur = null,
      width = "full",
      max,
      nextRef,
    },
    ref,
  ) => {
    return (
      <div className={`mb-2 ${width}`}>
        {name && (
          <label className="block text-xs font-bold text-gray-600 mb-1">
            {required ? <RequiredLabel name={label ? label : name} /> : name}
          </label>
        )}

        <input
          ref={ref}
          type={
            type === "pan_no" ||
            type === "aadhar" ||
            type === "gst_no" ||
            type === "pincode" ||
            type === "mobile"
              ? "text"
              : type
          }
          value={value}
          onChange={(e) => {
            if (type === "pan_no") {
              const raw = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "");
              let formatted = "";
              for (let i = 0; i < Math.min(raw.length, 10); i++) {
                if (i < 5) {
                  if (/[A-Z]/.test(raw[i])) formatted += raw[i];
                  else break;
                } else if (i < 9) {
                  if (/[0-9]/.test(raw[i])) formatted += raw[i];
                  else break;
                } else {
                  if (/[A-Z]/.test(raw[i])) formatted += raw[i];
                  else break;
                }
              }
              setValue(formatted);
            } else if (type === "gst_no") {
              const raw = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "");
              let formatted = "";
              for (let i = 0; i < Math.min(raw.length, 15); i++) {
                if (i < 2) {
                  if (/[0-9]/.test(raw[i])) formatted += raw[i];
                  else break;
                } else if (i < 7) {
                  if (/[A-Z]/.test(raw[i])) formatted += raw[i];
                  else break;
                } else if (i < 11) {
                  if (/[0-9]/.test(raw[i])) formatted += raw[i];
                  else break;
                } else if (i === 11) {
                  if (/[A-Z]/.test(raw[i])) formatted += raw[i];
                  else break;
                } else if (i === 12) {
                  if (/[0-9]/.test(raw[i])) formatted += raw[i];
                  else break;
                } else if (i === 13) {
                  if (/[A-Z]/.test(raw[i])) formatted += raw[i];
                  else break;
                } else {
                  if (/[A-Z0-9]/.test(raw[i])) formatted += raw[i];
                  else break;
                }
              }
              setValue(formatted);
            } else if (type === "aadhar") {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
              setValue(digits);
            } else if (type === "pincode") {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
              setValue(digits);
            } else if (type === "mobile") {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
              setValue(digits);
            } else if (type === "number") {
              setValue(e.target.value);
            } else if (type === "acc_no") {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 18);
              setValue(digits);
            } else if (type === "ifsc") {
              const raw = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "");
              let formatted = "";

              for (let i = 0; i < Math.min(raw.length, 11); i++) {
                if (i < 4) {
                  if (/[A-Z]/.test(raw[i])) formatted += raw[i];
                  else break;
                } else if (i === 4) {
                  if (raw[i] === "0") formatted += raw[i];
                  else break;
                } else {
                  if (/[A-Z0-9]/.test(raw[i])) formatted += raw[i];
                  else break;
                }
              }

              setValue(formatted);
            } else if (type === "swift") {
              const raw = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "");
              setValue(raw.slice(0, 11)); // max 11 chars
            } else {
              handleOnChange(e, setValue);
            }
          }}
          onKeyDown={(e) => {
            // if (e.key === " ") {
            //   e.preventDefault();
            // }
            if (
              (type === "aadhar" || type === "pincode" || type === "mobile") &&
              !/[\d]/.test(e.key) &&
              ![
                "Backspace",
                "Delete",
                "ArrowLeft",
                "ArrowRight",
                "Tab",
              ].includes(e.key)
            ) {
              e.preventDefault();
            }
            if (e.key === "Enter" && nextRef?.current) {
              nextRef.current?.showPicker();
            }
          }}
          onBlur={onBlur}
          placeholder={name}
          readOnly={readOnly}
          disabled={disabled}
          tabIndex={tabIndex ?? undefined}
          max={max ? String(max) : undefined}
          className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm outline-none
          ${readOnly || disabled ? "bg-slate-100" : ""}
          ${className}`}
        />
      </div>
    );
  },
);

export const DropdownInputNew = forwardRef(
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
      show, // new prop
    },
    ref,
  ) => {
    const handleOnChange = (e) => {
      setValue(e.target.value);
    };

    const isDisabled = readOnly || disabled;

    useEffect(() => {
      if (ref?.current && openOnFocus) {
        ref.current.focus();
      }
    }, [openOnFocus]);

    return (
      <div className={`mb-1 ${width}`}>
        {name && (
          <label className="block text-[11px] font-bold text-gray-600 mb-1">
            {required ? <RequiredLabel name={name} /> : name}
          </label>
        )}
        <select
          ref={ref}
          onBlur={onBlur}
          autoFocus={autoFocus}
          tabIndex={tabIndex ?? undefined}
          defaultValue={defaultValue}
          required={required}
          className={`w-full px-3 py-1.5 border border-gray-300 rounded-lg
          focus:outline-none outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
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
      </div>
    );
  },
);

export const ReusableTable = ({
  columns,
  data,
  itemsPerPage = 10,
  onView,
  onEdit,
  onDelete,
  emptyStateMessage = "No data available",
  rowActions = true,
  width,
  childRecordLabel = "", // New prop with default value
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredDeleteId, setHoveredDeleteId] = useState(null);

  const totalPages = Math?.ceil(data?.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem);

  const { hasPermission } = UserPermissions();

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const Pagination = () => {
    return (
      <div className=" w-full flex flex-col sm:flex-row justify-between items-center p-2 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2 sm:mb-0">
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, data?.length)} of {data?.length} entries
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FaChevronLeft className="inline" />
          </button>

          {Array?.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === pageNum
                    ? "bg-indigo-800 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="px-3 py-1">...</span>
          )}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-indigo-800 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FaChevronRight className="inline" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-[#F1F1F0] shadow-sm h-[69vh]">
        <div className="h-[100vh] rounded-lg bg-[#F1F1F0] shadow-sm">
          <div className="h-[68vh]">
            <table className="">
              <thead className="bg-gray-200 text-gray-800">
                <tr>
                  {columns?.map((column, index) => (
                    <th
                      key={index}
                      className={` font-medium text-gray-900 py-2 text-[12px] px-8 text-center uppercase  ${
                        column.header !== "" ? "border-r border-white/50" : ""
                      } `}
                    >
                      {column.header}
                    </th>
                  ))}
                  {rowActions && (
                    <th className="px-4 py-2 text-center text-[12px] font-medium justify-end">
                      ACTIONS
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentItems?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns?.length + (rowActions ? 1 : 0)}
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      {emptyStateMessage}
                    </td>
                  </tr>
                ) : (
                  currentItems?.map((item, index) => {
                    const hasChildRecords = item?.childRecord > 0;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        }`}
                      >
                        {columns?.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className={` ${column.className ? column.className : ""} ${column.header !== "" ? "border-r border-white/50" : ""} h-7 px-1.5`}
                          >
                            {column.accessor(item, index)}
                          </td>
                        ))}
                        {rowActions && (
                          <td className=" w-[30px] border-gray-200 gap-1 px-2   h-8 justify-end">
                            <div className="flex">
                              {onView && (
                                <button
                                  className="text-blue-600  flex items-center   px-1  bg-blue-50 rounded"
                                  onClick={() =>
                                    hasPermission(() => onView(item.id), "read")
                                  }
                                  // onClick={() => onView(item.id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path
                                      fillRule="evenodd"
                                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              )}
                              {onEdit && (
                                <button
                                  className="text-green-600 gap-1 px-1   bg-green-50 rounded"
                                  onClick={() =>
                                    hasPermission(() => onEdit(item.id), "edit")
                                  }
                                  // onClick={() => onEdit(item.id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                              )}
                              {onDelete && (
                                <div
                                  className="relative inline-block"
                                  onMouseEnter={() =>
                                    setHoveredDeleteId(item.id)
                                  }
                                  onMouseLeave={() => setHoveredDeleteId(null)}
                                >
                                  <button
                                    className={`text-red-800 flex items-center gap-1 px-1 bg-red-50 rounded transition-opacity ${
                                      hasChildRecords
                                        ? "opacity-40 cursor-not-allowed"
                                        : "hover:bg-red-100"
                                    }`}
                                    // cursor-pointer
                                    // onClick={() => {
                                    //   if (!hasChildRecords) {
                                    //     hasPermission(
                                    //       () =>
                                    //         onDelete(
                                    //           item.id,
                                    //           item?.childRecord,
                                    //         ),
                                    //       "delete",
                                    //       item?.childRecord,
                                    //     );
                                    //   }
                                    // }}
                                    onClick={() => {
                                      // if (!hasChildRecords) {
                                      //   onDelete(item.id, item?.childRecord);
                                      // }
                                      hasPermission(
                                        () =>
                                          onDelete(item.id, item?.childRecord),
                                        "delete",
                                        item?.childRecord,
                                      );
                                    }}
                                    disabled={hasChildRecords}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>

                                  {/* Tooltip */}
                                  {hasChildRecords &&
                                    hoveredDeleteId === item.id && (
                                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-[12px] rounded shadow-lg whitespace-nowrap z-50">
                                        Cannot Delete{" "}
                                        <span className="font-semibold">
                                          {childRecordLabel
                                            ? "in " + childRecordLabel
                                            : ""}
                                        </span>
                                        . Child records exist.
                                        {/* Arrow */}
                                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-1">
                                          <div className="border-4 border-transparent border-r-gray-900"></div>
                                        </div>
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="h-[10vh]">
        <Pagination />
      </div>
    </>
  );
};

export const ToggleButton = forwardRef(
  (
    { name, value, setActive, required, readOnly, disabled = false, onKeyDown },
    ref,
  ) => {
    const [isToggled, setIsToggled] = useState(false);
    const labelRef = useRef(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        labelRef.current?.focus();
      },
    }));

    useEffect(() => {
      if (value) {
        setIsToggled(true);
      } else {
        setIsToggled(false);
      }
    }, [value, isToggled]);

    return (
      <div>
        <div className="">
          <label className={FORM_LABEL_CLASS}>
            {required ? <RequiredLabel name={name} /> : `${name}`}
          </label>
          <div className="flex items-center mt-1">
            <label
              className="relative inline-flex items-center cursor-pointer"
              ref={labelRef}
              tabIndex={0}
              onKeyDown={(e) => {
                // Handle Space or Enter to toggle
                if (
                  (e.key === " " || e.key === "Enter") &&
                  !readOnly &&
                  !disabled
                ) {
                  e.preventDefault();
                  setIsToggled(!isToggled);
                  setActive(!value);
                }
                // ✅ Call parent's onKeyDown if provided
                if (onKeyDown) {
                  onKeyDown(e);
                }
              }}
            >
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isToggled}
                onChange={() => {
                  if (!readOnly) {
                    setIsToggled(!isToggled);
                    setActive(!value);
                  }
                }}
                disabled={disabled}
                required
                tabIndex={-1}
              />
              <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 peer transition duration-300"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full peer-checked:translate-x-6 transition-transform duration-300 shadow-sm"></div>
            </label>

            <span className="ml-2 block text-xs font-bold text-gray-600">
              {value ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
    );
  },
);

export const TextInputNew1 = forwardRef(
  (
    {
      name,
      label,
      type = "text",
      value,
      setValue,
      readOnly = false,
      className = "",
      required = false,
      disabled = false,
      tabIndex = null,
      onBlur = null,
      width = "full",
      max,
      handleChange,
      onKeyDown = null,
    },
    ref,
  ) => {
    return (
      <div className={`mb-1 ${width}`}>
        {name && (
          <label className={FORM_LABEL_MUTED_CLASS}>
            {required ? <RequiredLabel name={label ? label : name} /> : name}
          </label>
        )}
        <input
          ref={ref} // ✅ ref attached here
          type={type}
          value={value}
          onChange={(e) => {
            const val = e.target.value.toUpperCase();
            setValue(val);
            if (handleChange) handleChange(val);
          }}
          onBlur={onBlur}
          placeholder={name}
          readOnly={readOnly}
          disabled={disabled}
          tabIndex={tabIndex ?? undefined}
          max={max ? String(max) : undefined}
          className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
          focus:outline-none outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm ${readOnly || disabled ? "bg-slate-100" : ""}
          ${className}`}
          onKeyDown={onKeyDown}
        />
      </div>
    );
  },
);

export const ReusableSearchableInputNewCustomer = forwardRef(
  (
    {
      label,
      placeholder,
      onDeleteItem,
      component,
      setSearchTerm, // selected value (partyId)
      searchTerm,
      readOnly,
      nextRef,
      required,
      name,
      disabled,
      show,
      id,
    },

    ref,
  ) => {
    /* ---------------------------------- DATA ---------------------------------- */

    const companyId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    );
    const userId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userId",
    );

    const { data: partyList } = useGetPartyQuery({
      params: { companyId, userId },
    });

    /* ---------------------------------- STATE --------------------------------- */

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [openModel, setOpenModel] = useState(false);

    const [search, setSearch] = useState(""); // 🔹 search text
    const [filteredPages, setFilteredPages] = useState([]);
    const [isListShow, setIsListShow] = useState(false);

    const containerRef = useRef(null);
    const modal = useModal();
    const { openAddModal } = modal || {};

    const filtered = partyList?.data?.filter((i) => i.isCustomer);

    /* ---------------------------- OUTSIDE CLICK ---------------------------- */
    // useEffect(() => {
    //   if (id) return;
    //   setIsDropdownOpen(true);
    // }, []);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setIsDropdownOpen(false);
          setIsListShow(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ---------------------------- FILTER PARTIES ---------------------------- */

    useEffect(() => {
      if (!partyList?.data) return;

      if (!search.trim()) {
        setFilteredPages(partyList?.data?.filter((i) => i.isCustomer));
        return;
      }

      const filtered = partyList?.data?.filter(
        (item) =>
          item.isCustomer &&
          item?.name?.toLowerCase().includes(search.toLowerCase()),
      );

      setFilteredPages(filtered);
    }, [search, partyList]);

    /* ---------------------------- ARROW NAVIGATION --------------------------- */

    useEffect(() => {
      const pageSearch = document.getElementById("pageSearch");
      if (!pageSearch) return;

      const handler = (e) => {
        const items = pageSearch.querySelectorAll('[tabindex="0"]');
        const index = Array.from(items).indexOf(document.activeElement);

        if (e.key === "ArrowDown") {
          items[index + 1]?.focus();
          e.preventDefault();
        }

        if (e.key === "ArrowUp") {
          items[index - 1]?.focus();
          e.preventDefault();
        }
      };

      pageSearch.addEventListener("keydown", handler);
      return () => pageSearch.removeEventListener("keydown", handler);
    }, []);

    /* ---------------------------------- HANDLERS ------------------------------ */

    const handleEdit = (id, e) => {
      e.stopPropagation();
      setEditingItem(id);
      setIsDropdownOpen(false);
      setIsListShow(false);

      setOpenModel(true);
    };

    const handleDelete = (id, e) => {
      onDeleteItem?.(id);
    };

    /* ---------------------------------- JSX ---------------------------------- */

    return (
      <>
        {/* ----------------------------- MODAL ----------------------------- */}
        <Modal
          isOpen={openModel}
          onClose={() => setOpenModel(false)}
          widthClass="w-[90%] h-[90%]"
        >
          <DynamicRenderer
            componentName={component}
            editingItem={editingItem}
            onCloseForm={() => setOpenModel(false)}
          />
        </Modal>

        {/* ----------------------------- INPUT ----------------------------- */}
        <div
          className="relative text-sm w-full"
          id="pageSearch"
          ref={containerRef}
        >
          {label && (
            <label className="block text-xs font-bold text-gray-600 mb-1">
              {required ? <RequiredLabel name={label || name} /> : label}
            </label>
          )}

          <div className="flex gap-2">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />

              {isListShow ? (
                /* ---------------- SEARCH INPUT ---------------- */
                <input
                  ref={ref}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border rounded-md"
                  placeholder={placeholder}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsListShow(true);
                    setIsDropdownOpen(true);
                  }}
                  disabled={disabled || readOnly}
                  tabIndex={0}
                />
              ) : (
                /* ---------------- SELECTED VALUE ---------------- */
                <input
                  ref={ref}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border rounded-md"
                  placeholder={placeholder}
                  value={findFromList(
                    searchTerm,
                    partyList?.data?.filter((i) => i.isCustomer),
                    "name",
                  )}
                  onFocus={() => {
                    setIsListShow(true);
                    setIsDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && nextRef?.current) {
                      nextRef.current.focus();
                    }
                  }}
                  disabled={disabled || readOnly}
                  tabIndex={0}
                />
              )}
            </div>

            {/* ---------------- ADD BUTTON ---------------- */}
            <div className="relative">
              <button
                className="h-full px-3 py-1.5 border border-green-500 rounded-md
                hover:bg-green-500 text-green-600 hover:text-white"
                disabled={disabled || readOnly}
                onClick={() => {
                  setEditingItem("new");
                  setOpenModel(true);
                }}
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
              >
                <FaPlus />
              </button>

              {tooltipVisible && (
                <div className="absolute z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2">
                  <FaInfoCircle className="inline mr-1" />
                  Click to add new party
                </div>
              )}
            </div>
          </div>

          {/* ---------------- DROPDOWN LIST ---------------- */}
          {/* {isDropdownOpen && (
            <div className="absolute w-full mt-1 max-h-40 overflow-y-auto  rounded bg-white z-20 border border-gray-200" ref={ref}>
              {filteredPages.length > 0 ? (
                filteredPages?.map((item) => (
                  <div
                    key={item.id}
                    tabIndex={0}
                    className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer flex justify-between group border rounded-sm border-gray-400"
                    onClick={() => {
                      setSearchTerm(item.id);
                      setSearch("");
                      setIsDropdownOpen(false);
                      setIsListShow(false);
                      nextRef?.current?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearchTerm(item.id);
                        setSearch("");
                        setIsDropdownOpen(false);
                        setIsListShow(false);
                        nextRef?.current?.focus();
                      }
                    }}
                  >
                    <span className='0'>{item.name}</span>

                  
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500">
                  No party found
                </div>
              )}
            </div>
          )} */}
          {isDropdownOpen && (
            <div className="border border-slate-200 rounded-md shadow-md bg-white mt-1 max-h-40 overflow-y-auto z-20 absolute w-full">
              {filteredPages?.length > 0 ? (
                filteredPages?.map((item) => (
                  <div
                    key={item.id}
                    tabIndex={0}
                    className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer transition-colors flex justify-between items-center group"
                    onClick={() => {
                      setSearchTerm(item.id);
                      setIsDropdownOpen(false);
                      setSearch("");
                      setIsListShow(false);
                      if (nextRef?.current) {
                        nextRef?.current?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearchTerm(item.id);
                        setSearch("");
                        setIsListShow(false);
                        setIsDropdownOpen(false);
                        if (nextRef?.current) {
                          e.preventDefault();
                          nextRef?.current?.focus();
                        }
                      }
                    }}
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="text-indigo-600 hover:text-indigo-800 p-1"
                        onClick={(e) => handleEdit(item?.id, e)}
                        title="Edit supplier"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-1"
                        onClick={(e) => handleDelete(item?.id, e)}
                        title="Delete supplier"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-indigo-600 hover:bg-slate-50 flex items-center gap-2"
                  onClick={() => {
                    setEditingItem(null);
                    setIsDropdownOpen(false);
                    openAddModal();
                  }}
                ></button>
              )}
            </div>
          )}
        </div>
      </>
    );
  },
);
export const ReusableSearchableInputNewCustomerwithBranches = forwardRef(
  (
    {
      label,
      placeholder,
      onDeleteItem,
      component,
      setSearchTerm, // selected value (partyId)
      searchTerm,
      readOnly,
      nextRef,
      required,
      name,
      disabled,
      show,
      id,
    },

    ref,
  ) => {
    /* ---------------------------------- DATA ---------------------------------- */

    const companyId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    );
    const userId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userId",
    );

    const { data: partyList } = useGetPartyQuery({
      params: { companyId, userId, isAddessCombined: true },
    });

    /* ---------------------------------- STATE --------------------------------- */

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [openModel, setOpenModel] = useState(false);
    const [childId, setChildId] = useState("");

    const [search, setSearch] = useState(""); // 🔹 search text
    const [filteredPages, setFilteredPages] = useState([]);
    const [isListShow, setIsListShow] = useState(false);

    const containerRef = useRef(null);
    const modal = useModal();
    const { openAddModal } = modal || {};

    /* ---------------------------- OUTSIDE CLICK ---------------------------- */
    // useEffect(() => {
    //   if (id) return;
    //   setIsDropdownOpen(true);
    // }, []);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setIsDropdownOpen(false);
          setIsListShow(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ---------------------------- FILTER PARTIES ---------------------------- */

    useEffect(() => {
      if (!partyList?.data) return;

      if (!search.trim()) {
        setFilteredPages(partyList?.data);
        return;
      }

      const filtered = partyList?.data?.filter((item) =>
        item?.name?.toLowerCase().includes(search.toLowerCase()),
      );

      setFilteredPages(filtered);
    }, [search, partyList]);

    /* ---------------------------- ARROW NAVIGATION --------------------------- */

    useEffect(() => {
      const pageSearch = document.getElementById("pageSearch");
      if (!pageSearch) return;

      const handler = (e) => {
        const items = pageSearch.querySelectorAll('[tabindex="0"]');
        const index = Array.from(items).indexOf(document.activeElement);

        if (e.key === "ArrowDown") {
          items[index + 1]?.focus();
          e.preventDefault();
        }

        if (e.key === "ArrowUp") {
          items[index - 1]?.focus();
          e.preventDefault();
        }
      };

      pageSearch.addEventListener("keydown", handler);
      return () => pageSearch.removeEventListener("keydown", handler);
    }, []);

    /* ---------------------------------- HANDLERS ------------------------------ */

    const handleEdit = (id, e, isChildid) => {
      e.stopPropagation();
      setEditingItem(id);
      setIsDropdownOpen(false);
      setIsListShow(false);
      setOpenModel(true);
      // setChildId(isChildid)
    };

    const handleDelete = (id, e) => {
      onDeleteItem?.(id);
    };

    /* ---------------------------------- JSX ---------------------------------- */

    return (
      <>
        {/* ----------------------------- MODAL ----------------------------- */}
        <Modal
          isOpen={openModel}
          onClose={() => setOpenModel(false)}
          widthClass="w-[90%] h-[99%]"
        >
          <DynamicRenderer
            componentName={component}
            editingItem={editingItem}
            childId={childId}
            onCloseForm={() => setOpenModel(false)}
          />
        </Modal>

        {/* ----------------------------- INPUT ----------------------------- */}
        <div
          className="relative text-sm w-full"
          id="pageSearch"
          ref={containerRef}
        >
          {label && (
            <label className="block text-xs font-bold text-gray-600 mb-1">
              {required ? <RequiredLabel name={label || name} /> : label}
            </label>
          )}

          <div className="flex gap-2">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />

              {isListShow ? (
                /* ---------------- SEARCH INPUT ---------------- */
                <input
                  ref={ref}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border rounded-md"
                  placeholder={placeholder}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsListShow(true);
                    setIsDropdownOpen(true);
                  }}
                  disabled={disabled || readOnly}
                  tabIndex={0}
                />
              ) : (
                /* ---------------- SELECTED VALUE ---------------- */
                <input
                  ref={ref}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border rounded-md"
                  placeholder={placeholder}
                  value={findFromList(
                    searchTerm,
                    partyList?.data?.filter((i) => i.isCustomer),
                    "name",
                  )}
                  onFocus={() => {
                    setIsListShow(true);
                    setIsDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && nextRef?.current) {
                      nextRef.current.focus();
                    }
                  }}
                  disabled={disabled || readOnly}
                  tabIndex={0}
                />
              )}
            </div>

            {/* ---------------- ADD BUTTON ---------------- */}
            <div className="relative">
              <button
                className="h-full px-3 py-1.5 border border-green-500 rounded-md
                hover:bg-green-500 text-green-600 hover:text-white"
                disabled={disabled || readOnly}
                onClick={() => {
                  setEditingItem("new");
                  setOpenModel(true);
                }}
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
              >
                <FaPlus />
              </button>

              {tooltipVisible && (
                <div className="absolute z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2">
                  <FaInfoCircle className="inline mr-1" />
                  Click to add new party
                </div>
              )}
            </div>
          </div>

          {/* ---------------- DROPDOWN LIST ---------------- */}
          {/* {isDropdownOpen && (
            <div className="absolute w-full mt-1 max-h-40 overflow-y-auto  rounded bg-white z-20 border border-gray-200" ref={ref}>
              {filteredPages.length > 0 ? (
                filteredPages?.map((item) => (
                  <div
                    key={item.id}
                    tabIndex={0}
                    className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer flex justify-between group border rounded-sm border-gray-400"
                    onClick={() => {
                      setSearchTerm(item.id);
                      setSearch("");
                      setIsDropdownOpen(false);
                      setIsListShow(false);
                      nextRef?.current?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearchTerm(item.id);
                        setSearch("");
                        setIsDropdownOpen(false);
                        setIsListShow(false);
                        nextRef?.current?.focus();
                      }
                    }}
                  >
                    <span className='0'>{item.name}</span>

                  
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500">
                  No party found
                </div>
              )}
            </div>
          )} */}
          {isDropdownOpen && (
            <div className="border border-slate-200 rounded-md shadow-md bg-white mt-1 max-h-40 overflow-y-auto z-20 absolute w-full">
              {filteredPages?.length > 0 ? (
                filteredPages?.map((item) => (
                  <div
                    key={item.id}
                    tabIndex={0}
                    className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer transition-colors flex justify-between items-center group"
                    onClick={() => {
                      setSearchTerm(item.id);
                      setIsDropdownOpen(false);
                      setSearch("");
                      setIsListShow(false);
                      if (nextRef?.current) {
                        nextRef?.current?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearchTerm(item.id);
                        setSearch("");
                        setIsListShow(false);
                        setIsDropdownOpen(false);
                        if (nextRef?.current) {
                          e.preventDefault();
                          nextRef?.current?.focus();
                        }
                      }
                    }}
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="text-indigo-600 hover:text-indigo-800 p-1"
                        // onClick={(e) => handleEdit(item?.parentId ? item?.parentId : item?.id, e, item?.parentId ? item.id : null)}
                        onClick={(e) => handleEdit(item.id, e)}
                        title="Edit Customer"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-1"
                        onClick={(e) =>
                          handleDelete(item?.id, e, item?.parentId)
                        }
                        title="Delete Customer"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-indigo-600 hover:bg-slate-50 flex items-center gap-2"
                  onClick={() => {
                    setEditingItem(null);
                    setIsDropdownOpen(false);
                    openAddModal();
                  }}
                ></button>
              )}
            </div>
          )}
        </div>
      </>
    );
  },
);

export const ReusableSearchableInputNew = forwardRef(
  (
    {
      label,
      placeholder,
      onDeleteItem,
      component,
      setSearchTerm, // selected value (partyId)
      searchTerm,
      readOnly,
      nextRef,
      required,
      name,
      disabled,
      show,
      id,
    },
    ref,
  ) => {
    /* ---------------------------------- DATA ---------------------------------- */

    const companyId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    );
    const userId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userId",
    );

    const { data: partyList } = useGetPartyQuery({
      params: { companyId, userId },
    });

    /* ---------------------------------- STATE --------------------------------- */

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [openModel, setOpenModel] = useState(false);

    const [search, setSearch] = useState(""); // 🔹 search text
    const [filteredPages, setFilteredPages] = useState([]);
    const [isListShow, setIsListShow] = useState(false);

    const containerRef = useRef(null);
    const modal = useModal();
    const { openAddModal } = modal || {};

    /* ---------------------------- OUTSIDE CLICK ---------------------------- */
    // useEffect(() => {
    //   if (id) return;
    //   setIsDropdownOpen(true);
    // }, []);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setIsDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ---------------------------- FILTER PARTIES ---------------------------- */

    useEffect(() => {
      if (!partyList?.data) return;

      if (!search.trim()) {
        setFilteredPages(partyList.data);
        return;
      }

      const filtered = partyList?.data?.filter((item) =>
        item?.name?.toLowerCase().includes(search.toLowerCase()),
      );

      setFilteredPages(filtered);
    }, [search, partyList]);

    /* ---------------------------- ARROW NAVIGATION --------------------------- */

    useEffect(() => {
      const pageSearch = document.getElementById("pageSearch");
      if (!pageSearch) return;

      const handler = (e) => {
        const items = pageSearch.querySelectorAll('[tabindex="0"]');
        const index = Array.from(items).indexOf(document.activeElement);

        if (e.key === "ArrowDown") {
          items[index + 1]?.focus();
          e.preventDefault();
        }

        if (e.key === "ArrowUp") {
          items[index - 1]?.focus();
          e.preventDefault();
        }
      };

      pageSearch.addEventListener("keydown", handler);
      return () => pageSearch.removeEventListener("keydown", handler);
    }, []);

    /* ---------------------------------- HANDLERS ------------------------------ */

    const handleEdit = (id, e) => {
      e.stopPropagation();
      setEditingItem(id);
      setIsDropdownOpen(false);
      setIsListShow(false);

      setOpenModel(true);
    };

    const handleDelete = (id, e) => {
      e.stopPropagation();
      onDeleteItem?.(id);
    };

    /* ---------------------------------- JSX ---------------------------------- */

    return (
      <>
        {/* ----------------------------- MODAL ----------------------------- */}
        <Modal
          isOpen={openModel}
          onClose={() => setOpenModel(false)}
          widthClass="w-[90%] h-[95%]"
        >
          <DynamicRenderer
            componentName={component}
            editingItem={editingItem}
            onCloseForm={() => setOpenModel(false)}
          />
        </Modal>

        {/* ----------------------------- INPUT ----------------------------- */}
        <div
          className="relative text-sm w-full"
          id="pageSearch"
          ref={containerRef}
        >
          {label && (
            <label className="block text-xs font-bold text-gray-600 mb-1">
              {required ? <RequiredLabel name={label || name} /> : label}
            </label>
          )}

          <div className="flex gap-2">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />

              {isListShow ? (
                /* ---------------- SEARCH INPUT ---------------- */
                <input
                  ref={ref}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border rounded-md"
                  placeholder={placeholder}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsListShow(true);
                    setIsDropdownOpen(true);
                  }}
                  disabled={disabled || readOnly}
                  tabIndex={0}
                />
              ) : (
                /* ---------------- SELECTED VALUE ---------------- */
                <input
                  ref={ref}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border rounded-md"
                  placeholder={placeholder}
                  value={findFromList(searchTerm, partyList?.data, "name")}
                  onFocus={() => {
                    setIsListShow(true);
                    setIsDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && nextRef?.current) {
                      nextRef.current.focus();
                    }
                  }}
                  disabled={disabled || readOnly}
                  tabIndex={0}
                />
              )}
            </div>

            {/* ---------------- ADD BUTTON ---------------- */}
            <div className="relative">
              <button
                className="h-full px-3 py-1.5 border border-green-500 rounded-md
                hover:bg-green-500 text-green-600 hover:text-white"
                disabled={disabled || readOnly}
                onClick={() => {
                  setEditingItem("new");
                  setOpenModel(true);
                }}
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
              >
                <FaPlus />
              </button>

              {tooltipVisible && (
                <div className="absolute z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2">
                  <FaInfoCircle className="inline mr-1" />
                  Click to add new party
                </div>
              )}
            </div>
          </div>

          {/* ---------------- DROPDOWN LIST ---------------- */}
          {isDropdownOpen && (
            <div
              className="absolute w-full mt-1 max-h-40 overflow-y-auto border rounded bg-white z-20"
              ref={ref}
            >
              {filteredPages.length > 0 ? (
                filteredPages?.map((item) => (
                  <div
                    key={item.id}
                    tabIndex={0}
                    className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer flex justify-between group"
                    onClick={() => {
                      setSearchTerm(item.id);
                      setSearch("");
                      setIsDropdownOpen(false);
                      setIsListShow(false);
                      nextRef?.current?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearchTerm(item.id);
                        setSearch("");
                        setIsDropdownOpen(false);
                        setIsListShow(false);
                        nextRef?.current?.focus();
                      }
                    }}
                  >
                    <span>{item.name}</span>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                      <button onClick={(e) => handleEdit(item.id, e)}>
                        <FaEdit />
                      </button>
                      <button onClick={(e) => handleDelete(item.id, e)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500">
                  No party found
                </div>
              )}
            </div>
          )}
        </div>
      </>
    );
  },
);

export const DateInputNew = forwardRef(
  (
    {
      name,
      value,
      setValue,
      readOnly,
      required = false,
      type = "",
      disabled = false,
      tabIndex = null,
      inputClass,
      inputHead,
      className,
      nextRef,
      isToday,
    },
    ref,
  ) => {
    const today = new Date().toISOString().split("T")[0];
    const [pickerOpen, setPickerOpen] = useState(false);

    const handleFocus = () => {
      // Only attempt to show picker if browser supports it
      if (type === "date" && ref?.current?.showPicker) {
        ref.current.showPicker();
      }
    };

    // const handleKeyDown = (e) => {
    //   if (e.key === "Enter") {
    //     console.log("Enter pressed!");
    //     ref?.current?.showPicker();
    //   }
    // };
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        if (!pickerOpen) {
          // First Enter → open the date picker
          ref.current?.showPicker();
          setPickerOpen(true);
        } else {
          // Second Enter → remove focus (close picker)
          ref.current?.blur(); // removes focus
          setPickerOpen(false);
        }
      }
    };
    return (
      <div className="grid-cols-1 md:grid-cols-3 items-center mb-1">
        {name && (
          <label
            className={`${FORM_LABEL_CLASS} ${
              required
                ? 'after:content-["*"] after:ml-0.5 after:text-red-500'
                : ""
            }`}
          >
            {name}
          </label>
        )}
        <input
          ref={ref}
          tabIndex={tabIndex ?? undefined}
          type={type}
          disabled={disabled}
          required={required}
          min={isToday ? today : undefined}
          className={`h-7 w-full px-2 py-0 border border-slate-300 rounded-md 
          focus:border-indigo-300 focus:outline-none outline-none transition-all duration-200
          hover:border-slate-400 ${readOnly || disabled ? "bg-slate-100" : ""} ${FORM_INPUT_TEXT_CLASS} ${className}`}
          id="id"
          value={value}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          onChange={(e) => {
            setValue(e.target.value);
            nextRef?.current?.focus();
          }}
        />
      </div>
    );
  },
);

export const TextAreaNew = ({
  name,
  value,
  setValue,
  readOnly,
  required = false,
  disabled = false,
  rows = 2,
  cols = 30,
  tabIndex = null,
  label = null,
  inputClass = "",
  onBlur = null,
}) => {
  return (
    <div className=" w-full mb-1">
      {name && (
        <label className={FORM_LABEL_MUTED_CLASS}>
          {required ? <RequiredLabel name={label ?? name} /> : (label ?? name)}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        rows={rows}
        cols={cols}
        // tabIndex={tabIndex ?? undefined}
        disabled={disabled}
        required={required}
        readOnly={readOnly}
        value={value}
        onChange={(e) => handleOnChange(e, setValue)}
        onBlur={onBlur}
        placeholder={name}
        className={`w-full px-3 py-1.5 border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm  resize-y

          ${
            readOnly || disabled
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white hover:border-gray-400"
          }
          ${FORM_INPUT_TEXT_CLASS} ${inputClass}`}
      ></textarea>
    </div>
  );
};

export const ShowInvoicPendingCustomers = forwardRef(
  (
    {
      label,
      placeholder,
      onDeleteItem,
      component,
      setSearchTerm, // selected value (partyId)
      searchTerm,
      readOnly,
      nextRef,
      required,
      name,
      disabled,
      show,
      id,
      supplierId,
      partyList,
    },

    ref,
  ) => {
    /* ---------------------------------- DATA ---------------------------------- */

    const companyId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    );
    const userId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userId",
    );

    // const { data: partyList } = useGetPartyNewQuery({
    //   params: { companyId, userId, isAddessCombined: true , id ,supplierId },
    // });

    /* ---------------------------------- STATE --------------------------------- */

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [openModel, setOpenModel] = useState(false);
    const [childId, setChildId] = useState("");

    const [search, setSearch] = useState(""); // 🔹 search text
    const [filteredPages, setFilteredPages] = useState([]);
    const [isListShow, setIsListShow] = useState(false);

    const containerRef = useRef(null);
    const modal = useModal();
    const { openAddModal } = modal || {};

    /* ---------------------------- OUTSIDE CLICK ---------------------------- */
    // useEffect(() => {
    //   if (id) return;
    //   setIsDropdownOpen(true);
    // }, []);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setIsDropdownOpen(false);
          setIsListShow(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ---------------------------- FILTER PARTIES ---------------------------- */

    useEffect(() => {
      if (!partyList?.data) return;

      if (!search.trim()) {
        setFilteredPages(partyList?.data);
        return;
      }

      const filtered = partyList?.data?.filter((item) =>
        item?.name?.toLowerCase().includes(search.toLowerCase()),
      );

      setFilteredPages(filtered);
    }, [search, partyList]);

    /* ---------------------------- ARROW NAVIGATION --------------------------- */

    useEffect(() => {
      const pageSearch = document.getElementById("pageSearch");
      if (!pageSearch) return;

      const handler = (e) => {
        const items = pageSearch.querySelectorAll('[tabindex="0"]');
        const index = Array.from(items).indexOf(document.activeElement);

        if (e.key === "ArrowDown") {
          items[index + 1]?.focus();
          e.preventDefault();
        }

        if (e.key === "ArrowUp") {
          items[index - 1]?.focus();
          e.preventDefault();
        }
      };

      pageSearch.addEventListener("keydown", handler);
      return () => pageSearch.removeEventListener("keydown", handler);
    }, []);

    /* ---------------------------------- HANDLERS ------------------------------ */

    const handleEdit = (id, e, isChildid) => {
      e.stopPropagation();
      setEditingItem(id);
      setIsDropdownOpen(false);
      setIsListShow(false);
      setOpenModel(true);
      setChildId(isChildid);
    };

    const handleDelete = (id, e) => {
      onDeleteItem?.(id);
    };

    /* ---------------------------------- JSX ---------------------------------- */

    return (
      <>
        {/* ----------------------------- MODAL ----------------------------- */}
        <Modal
          isOpen={openModel}
          onClose={() => setOpenModel(false)}
          widthClass="w-[90%] h-[99%]"
        >
          <DynamicRenderer
            componentName={component}
            editingItem={editingItem}
            childId={childId}
            onCloseForm={() => setOpenModel(false)}
          />
        </Modal>

        {/* ----------------------------- INPUT ----------------------------- */}
        <div
          className="relative text-sm w-full"
          id="pageSearch"
          ref={containerRef}
        >
          {label && (
            <label className="block text-xs font-bold text-gray-600 mb-1">
              {required ? <RequiredLabel name={label || name} /> : label}
            </label>
          )}

          <div className="flex gap-2">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />

              {isListShow ? (
                /* ---------------- SEARCH INPUT ---------------- */
                <input
                  ref={ref}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border rounded-md"
                  placeholder={placeholder}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsListShow(true);
                    setIsDropdownOpen(true);
                  }}
                  disabled={disabled || readOnly}
                  tabIndex={0}
                />
              ) : (
                /* ---------------- SELECTED VALUE ---------------- */
                <input
                  ref={ref}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border rounded-md"
                  placeholder={placeholder}
                  value={findFromList(
                    searchTerm,
                    partyList?.data?.filter((i) => i.isCustomer),
                    "name",
                  )}
                  onFocus={() => {
                    setIsListShow(true);
                    setIsDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && nextRef?.current) {
                      nextRef.current.focus();
                    }
                  }}
                  disabled={disabled || readOnly}
                  tabIndex={0}
                />
              )}
            </div>

            {/* ---------------- ADD BUTTON ---------------- */}
            <div className="relative">
              <button
                className="h-full px-3 py-1.5 border border-green-500 rounded-md
                hover:bg-green-500 text-green-600 hover:text-white"
                disabled={disabled || readOnly}
                onClick={() => {
                  setEditingItem("new");
                  setOpenModel(true);
                }}
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
              >
                <FaPlus />
              </button>

              {tooltipVisible && (
                <div className="absolute z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2">
                  <FaInfoCircle className="inline mr-1" />
                  Click to add new party
                </div>
              )}
            </div>
          </div>

          {/* ---------------- DROPDOWN LIST ---------------- */}
          {/* {isDropdownOpen && (
            <div className="absolute w-full mt-1 max-h-40 overflow-y-auto  rounded bg-white z-20 border border-gray-200" ref={ref}>
              {filteredPages.length > 0 ? (
                filteredPages?.map((item) => (
                  <div
                    key={item.id}
                    tabIndex={0}
                    className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer flex justify-between group border rounded-sm border-gray-400"
                    onClick={() => {
                      setSearchTerm(item.id);
                      setSearch("");
                      setIsDropdownOpen(false);
                      setIsListShow(false);
                      nextRef?.current?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearchTerm(item.id);
                        setSearch("");
                        setIsDropdownOpen(false);
                        setIsListShow(false);
                        nextRef?.current?.focus();
                      }
                    }}
                  >
                    <span className='0'>{item.name}</span>

                  
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500">
                  No party found
                </div>
              )}
            </div>
          )} */}
          {isDropdownOpen && (
            <div className="border border-slate-200 rounded-md shadow-md bg-white mt-1 max-h-40 overflow-y-auto z-20 absolute w-full">
              {filteredPages?.length > 0 ? (
                filteredPages?.map((item) => (
                  <div
                    key={item.id}
                    tabIndex={0}
                    className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer transition-colors flex justify-between items-center group"
                    onClick={() => {
                      setSearchTerm(item.id);
                      setIsDropdownOpen(false);
                      setSearch("");
                      setIsListShow(false);
                      if (nextRef?.current) {
                        nextRef?.current?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearchTerm(item.id);
                        setSearch("");
                        setIsListShow(false);
                        setIsDropdownOpen(false);
                        if (nextRef?.current) {
                          e.preventDefault();
                          nextRef?.current?.focus();
                        }
                      }
                    }}
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="text-indigo-600 hover:text-indigo-800 p-1"
                        onClick={(e) => handleEdit(item?.id, e)}
                        title="Edit Customer"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-1"
                        onClick={(e) =>
                          handleDelete(item?.id, e, item?.parentId)
                        }
                        title="Delete Customer"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-indigo-600 hover:bg-slate-50 flex items-center gap-2"
                  onClick={() => {
                    setEditingItem(null);
                    setIsDropdownOpen(false);
                    openAddModal();
                  }}
                ></button>
              )}
            </div>
          )}
        </div>
      </>
    );
  },
);

export const customStyles = {
  control: (base) => ({
    ...base,
    border: "none",
    boxShadow: "none",
    backgroundColor: "transparent",
    minHeight: "unset",
    height: "18px",
    fontSize: "11px",
    cursor: "pointer",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#9ca3af", // Tailwind gray-400
    fontSize: "11px",
  }),

  singleValue: (base) => ({
    ...base,
    fontSize: "11px",
    color: "black",
  }),

  valueContainer: (base) => ({
    ...base,
    padding: "0 2px",
    height: "18px",
  }),

  dropdownIndicator: (base) => ({
    ...base,
    padding: 0,
    paddingRight: 2,
    svg: {
      width: 14,
      height: 14,
    },
    color: "black",
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    fontSize: "11px",
    color: "black",
  }),

  clearIndicator: () => ({
    display: "none",
  }),

  option: (base, state) => ({
    ...base,
    fontSize: "11px",
    padding: "4px 6px", // reduce inside padding
    minHeight: "18px", // reduce height
    lineHeight: "18px",
    backgroundColor: state.isSelected
      ? "#d1d5db" // gray-200
      : state.isFocused
        ? "#e5e7eb" // gray-100
        : "white",
    color: "black",
  }),

  menu: (base) => ({
    ...base,
    zIndex: 9999,
    fontSize: "11px",
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: "120px", // 🔥 reduce dropdown height
    paddingTop: 0,
    paddingBottom: 0,
  }),
};
export function CustomInput({
  value,
  onChange,
  options,
  placeholder = "",
  readOnly = false,
  onBlur,
  onKeyDown,
  inputId,
}) {
  return (
    <Select
      styles={customStyles}
      onInputChange={(value, { action }) => {
        if (action === "input-change") {
          return value.toUpperCase(); //  force uppercase typing
        }
        return value;
      }}
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null, // remove separator
      }}
      isClearable
      isDisabled={readOnly}
      options={options}
      value={options.find((opt) => opt.value === value) || null}
      onChange={(selected) => onChange(selected?.value || "")}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      menuPortalTarget={document.body}
      inputId={inputId}
    />
  );
}

export default function FxSelect({
  value,
  onChange,
  options,
  placeholder = "",
  readOnly = false,
  onBlur,
  onKeyDown,
  inputId,
  advanceOnEnter = false,
  advanceOnSelect = false,
  nextRef,
}) {
  const selectRef = useRef(null);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const pendingAdvanceRef = useRef(false);

  const focusNextField = () => {
    const control =
      selectRef.current?.controlRef ||
      document.getElementById(inputId || "") ||
      document.activeElement;

    focusNextGridField({
      currentElement: control,
      onReachGridEnd: () => {
        nextRef?.current?.focus?.();
      },
    });
  };

  const focusPreviousField = () => {
    const control =
      selectRef.current?.controlRef ||
      document.getElementById(inputId || "") ||
      document.activeElement;

    focusPreviousGridField({
      currentElement: control,
    });
  };

  return (
    <Select
      ref={selectRef}
      styles={customStyles}
      onInputChange={(value, { action }) => {
        if (action === "input-change") {
          return value.toUpperCase(); //  force uppercase typing
        }
        return value;
      }}
      components={{
        // DropdownIndicator: () => null,
        IndicatorSeparator: () => null, // remove separator
      }}
      isClearable
      isDisabled={readOnly}
      options={options}
      value={options.find((opt) => opt.value === value) || null}
      onChange={(selected) => {
        onChange(selected?.value || "");

        if (advanceOnSelect && menuIsOpen) {
          pendingAdvanceRef.current = true;
        }
      }}
      onBlur={onBlur}
      onKeyDown={(event) => {
        if (event.key === "Enter" && advanceOnEnter && !menuIsOpen) {
          event.preventDefault();
          focusNextField();
          return;
        }

        if (event.key === "Tab" && event.shiftKey) {
          event.preventDefault();
          focusPreviousField();
          return;
        }

        onKeyDown?.(event);
      }}
      placeholder={placeholder}
      menuPortalTarget={document.body}
      inputId={inputId}
      onMenuOpen={() => setMenuIsOpen(true)}
      onMenuClose={() => {
        setMenuIsOpen(false);

        if (pendingAdvanceRef.current) {
          pendingAdvanceRef.current = false;
          window.setTimeout(() => {
            focusNextField();
          }, 0);
        }
      }}
    />
  );
}

export const FxSelectWithAdd = forwardRef(function FxSelectWithAdd(
  {
    value,
    onChange,
    options,
    placeholder,
    readOnly,
    onBlur,
    onKeyDown,
    inputId,
    addNew,
    childComponent,
    addNewModalWidth,
    nextRef,
    advanceOnEnter,
    advanceOnSelect,
    disabled,
    // ─── NEW PROPS ────────────────────────────────────────────────────────────
    // Pass menuPortalTarget={null} when this select is rendered inside a Modal
    // so the dropdown menu stays in the normal DOM flow and isn't hidden behind
    // the modal backdrop.  Default keeps the original document.body behaviour.
    menuPortalTarget = typeof document !== "undefined" ? document.body : null,
    // menuPosition: "fixed" works well with document.body portal (default);
    // "absolute" works well when menuPortalTarget={null} (inline rendering).
    menuPosition = "fixed",
    // ─────────────────────────────────────────────────────────────────────────
  },
  ref,
) {
  const [showAddNewModal, setShowAddNewModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const selectRef = useRef(null);
  const pendingAdvanceRef = useRef(false);

  const CREATE_NEW_VALUE = "__CREATE_NEW__";

  useImperativeHandle(ref, () => ({
    focus() {
      selectRef.current?.focus?.();
    },
  }));

  const focusNextSafe = (ref, retries = 10) => {
    if (ref?.current) {
      ref.current.focus();
    } else if (retries > 0) {
      setTimeout(() => focusNextSafe(ref, retries - 1), 50);
    }
  };

  const focusNextField = () => {
    const current = selectRef.current?.controlRef || document.activeElement;
    if (!current) return;
    focusNextGridField({
      currentElement: current,
      onReachGridEnd: () => {
        focusNextSafe(nextRef);
      },
    });
  };

  const focusPreviousField = () => {
    const current = selectRef.current?.controlRef || document.activeElement;
    if (!current) return;
    focusPreviousGridField({ currentElement: current });
  };

  const handleAddNewSuccess = (newValue) => {
    if (onChange) onChange(newValue);
    setShowAddNewModal(false);
    setSearchValue("");
    if (onBlur) onBlur();
    focusNextField();
  };

  const CustomOption = (props) => {
    const isCreateNew = props.data.value === CREATE_NEW_VALUE;
    if (isCreateNew) {
      return (
        <div
          {...props.innerProps}
          className={`px-3 py-1 text-xs text-blue-600 font-semibold cursor-pointer border-t ${
            props.isFocused ? "bg-blue-100" : ""
          }`}
        >
          + Create New "{searchValue.toUpperCase()}"
        </div>
      );
    }
    return <components.Option {...props} />;
  };

  const getOptionsWithCreateNew = () => {
    const filteredOptions = options.filter((option) => {
      if (!searchValue) return true;
      return option.label.toLowerCase().startsWith(searchValue.toLowerCase());
    });

    if (addNew && childComponent && searchValue) {
      return [
        ...filteredOptions,
        {
          label: `+ Create New "${searchValue.toUpperCase()}"`,
          value: CREATE_NEW_VALUE,
        },
      ];
    }
    return filteredOptions;
  };

  return (
    <>
      <Select
        ref={selectRef}
        // styles={customStyles}
        tabSelectsValue={!!value}
        onInputChange={(value, { action }) => {
          if (action === "input-change") {
            setSearchValue(value.toUpperCase());
          }
          return value;
        }}
        components={{
          Option: CustomOption,
          IndicatorSeparator: () => null,
        }}
        isClearable
        // honour both readOnly and disabled props
        isDisabled={readOnly || disabled}
        options={getOptionsWithCreateNew()}
        value={options.find((opt) => opt.value === value) || null}
        onChange={(selected) => {
          if (selected?.value === CREATE_NEW_VALUE) {
            setShowAddNewModal(true);
          } else {
            const val = selected?.value || "";
            onChange(val);
            setSearchValue("");
            if (advanceOnSelect && menuIsOpen) {
              pendingAdvanceRef.current = true;
            }
          }
        }}
        onBlur={onBlur}
        filterOption={() => true}
        onKeyDown={(e) => {
          if (e.key === "Enter" && advanceOnEnter && !menuIsOpen) {
            if (value) {
              e.preventDefault();
              focusNextField();
              return;
            }
          }
          if (e.key === "Tab") {
            if (e.shiftKey) {
              e.preventDefault();
              focusPreviousField();
              return;
            }
            if (!value && nextRef) {
              e.preventDefault();
              focusNextSafe(nextRef);
            }
            return;
          }
          if (onKeyDown) onKeyDown(e);
        }}
        placeholder={placeholder}
        // ─── FORWARDED PROPS ──────────────────────────────────────────────────
        menuPortalTarget={menuPortalTarget}
        menuPosition={menuPosition}
        // When rendered inline (no portal), menus must sit above sibling rows.
        // zIndex is only meaningful when menuPosition="fixed" with a portal, but
        // setting it here doesn't hurt for the inline case.
        styles={{
          ...customStyles,
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        // ─────────────────────────────────────────────────────────────────────
        inputId={inputId}
        noOptionsMessage={() => "No options"}
        onMenuOpen={() => setMenuIsOpen(true)}
        onMenuClose={() => {
          setMenuIsOpen(false);
          if (pendingAdvanceRef.current) {
            pendingAdvanceRef.current = false;
            window.setTimeout(() => focusNextField(), 0);
          }
        }}
        onFocus={() => setSearchValue("")}
      />
      {showAddNewModal && childComponent && (
        <Modal
          isOpen={showAddNewModal}
          onClose={() => {
            setShowAddNewModal(false);
            setSearchValue("");
          }}
          widthClass={addNewModalWidth}
        >
          {(() => {
            const AddNewComponent = childComponent;
            return (
              <AddNewComponent
                onSuccess={handleAddNewSuccess}
                onClose={() => {
                  setShowAddNewModal(false);
                  setSearchValue("");
                }}
                defaultName={searchValue.toUpperCase()}
                embeddedMode={true}
              />
            );
          })()}
        </Modal>
      )}
    </>
  );
});

export const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "28px", // ⚠️ important (13px is too small)
    height: "28px",
    padding: "2px 4px",
    fontSize: "12px",
    borderRadius: "6px",
    color: state.isDisabled ? "#6b7280" : "#111827",
    backgroundColor: state.isDisabled ? "#f3f4f6" : "white",
    cursor: state.isDisabled ? "not-allowed" : "default",
    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
    "&:hover": {
      borderColor: state.isDisabled ? "#d1d5db" : "#9ca3af",
    },
  }),

  valueContainer: (base) => ({
    ...base,
    padding: "0 4px",
    fontSize: "12px",
  }),

  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    fontSize: "12px",
  }),

  singleValue: (base, state) => ({
    ...base,
    fontSize: "12px",
    color: state.isDisabled ? "#6b7280" : "#111827",
  }),

  placeholder: (base) => ({
    ...base,
    fontSize: "12px",
    color: "#6b7280", // softer placeholder
  }),

  menu: (base) => ({
    ...base,
    fontSize: "12px",
    zIndex: 9999,
  }),

  option: (base, state) => ({
    ...base,
    fontSize: "12px",
    padding: "5px 8px",
    color: state.isSelected ? "white" : "#111827",
    backgroundColor: state.isSelected
      ? "#2563eb"
      : state.isFocused
        ? "#dbeafe"
        : "white",
    cursor: "pointer",
  }),

  dropdownIndicator: (base) => ({
    ...base,
    padding: 2,
    svg: {
      width: 14,
      height: 14,
    },
    color: "#374151",
  }),

  indicatorSeparator: () => ({ display: "none" }),

  menuList: (base) => ({
    ...base,
    maxHeight: 150,
  }),
};

export const DropdownNew = forwardRef(
  (
    {
      name,
      dataList,
      value,
      setValue,
      readonly = false,
      disabled = false,
      required = false,
      clear = false,
      placeholder,
      width = "full",
      otherField,
      otherValue,
      onKeyDown,
      autoFocus,
      beforeChange = () => {},
    },
    ref,
  ) => {
    const options = [
      ...(clear
        ? [
            {
              value: "",
              label: `Select ${name || placeholder || "Option"}`,
              isDisabled: false,
            },
          ]
        : []),
      ...(dataList?.map((item) => ({
        value: otherValue ? item?.[otherValue] : item?.id,
        label: otherField ? item?.[otherField] : item?.name,
      })) || []),
    ];
    const selectedOption = options.find((opt) => opt.value === value) || null;
    return (
      <div className={`${name ? "mb-2" : "mb-0"} w-${width}`}>
        {name && (
          <label className="block text-[11px] font-bold text-gray-600 mb-1">
            {required ? (
              <span className="">
                {name} <span className="text-red-500">*</span>
              </span>
            ) : (
              name
            )}
          </label>
        )}
        <Select
          ref={ref}
          options={options}
          value={selectedOption}
          onChange={(selected) => {
            const item = dataList?.find((i) => i.id === selected?.value);
            beforeChange(item);
            setValue(selected?.value || "");
          }}
          isDisabled={disabled || readonly}
          isSearchable
          isClearable={false}
          menuShouldScrollIntoView={false}
          maxMenuHeight={170} // <-- Reduce height here
          onInputChange={(value) => value.toUpperCase()}
          className="w-full -ml-1 h-7 text-xs rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm"
          placeholder={placeholder}
          styles={customSelectStyles}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
        />
      </div>
    );
  },
);
