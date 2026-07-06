import moment from "moment";
import secureLocalStorage from "react-secure-storage";
import { toWords } from "number-to-words";

export function generateSessionId(length = 8) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function findDateInRange(fromDate, toDate, checkDate) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const check = new Date(checkDate);

  if (
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime()) ||
    Number.isNaN(check.getTime())
  ) {
    return false;
  }

  if (from <= check && check <= to) {
    return true;
  }
  return false;
}

export function latestExpireDateWithinNDays(
  latesExpireDate = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "latestActivePlanExpireDate",
  ),
  n = 20,
) {
  if (
    differenceInTimeToInDays(
      differenceInTime(new Date(latesExpireDate), new Date()),
    ) <= n
  ) {
    return true;
  }
  return false;
}

export function differenceInTime(dateOne, dateTwo) {
  return dateOne.getTime() - dateTwo.getTime();
}

export function differenceInTimeToInDays(differenceInTime) {
  return differenceInTime / (1000 * 3600 * 24);
}

// React paginate, page index starts with 0 ,
//  actual page number starts with 1 so, input to
// react-paginate and valueFrom react-paginate converted

export function pageNumberToReactPaginateIndex(pageNumber) {
  return pageNumber - 1;
}

export function reactPaginateIndexToPageNumber(pageIndex) {
  return pageIndex + 1;
}

export function viewBase64String(base64String) {
  return "data:image/png;base64, " + base64String;
}

export function hasPermission(permission) {
  if (
    Boolean(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "superAdmin",
      ),
    )
  ) {
    return true;
  }
  return JSON.parse(
    secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userRole",
    ),
  ).role.RoleOnPage.find(
    (item) =>
      item.pageId ===
      parseInt(
        secureLocalStorage.getItem(
          sessionStorage.getItem("sessionId") + "currentPage",
        ),
      ),
  )[permission];
}

export function getYearShortCode(fromDate, toDate) {
  return `${new Date(fromDate).getFullYear().toString().slice(2)}-${new Date(toDate).getFullYear().toString().slice(2)}`;
}

export const handleKeyDown = (event, callback) => {
  let charCode = String.fromCharCode(event.which).toLowerCase();
  if ((event.ctrlKey || event.metaKey) && charCode === "s") {
    event.preventDefault();
    callback();
  }
};

export function calculateAge(dob) {
  var diff_ms = Date.now() - dob.getTime();
  var age_dt = new Date(diff_ms);

  return Math.abs(age_dt.getUTCFullYear() - 1970);
}

// Convert number to words

const arr = (x) => Array.from(x);
const num = (x) => Number(x) || 0;
const isEmpty = (xs) => xs.length === 0;
const take = (n) => (xs) => xs.slice(0, n);
const drop = (n) => (xs) => xs.slice(n);
const reverse = (xs) => xs.slice(0).reverse();
const comp = (f) => (g) => (x) => f(g(x));
const not = (x) => !x;
const chunk = (n) => (xs) =>
  isEmpty(xs) ? [] : [take(n)(xs), ...chunk(n)(drop(n)(xs))];

// numToWords :: (Number a, String a) => a -> String
export const numToWords = (n) => {
  let a = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];

  let b = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  let g = [
    "",
    "thousand",
    "million",
    "billion",
    "trillion",
    "quadrillion",
    "quintillion",
    "sextillion",
    "septillion",
    "octillion",
    "nonillion",
  ];

  // this part is really nasty still
  // it might edit this again later to show how Monoids could fix this up
  let makeGroup = ([ones, tens, huns]) => {
    return [
      num(huns) === 0 ? "" : a[huns] + " hundred ",
      num(ones) === 0 ? b[tens] : (b[tens] && b[tens] + "-") || "",
      a[tens + ones] || a[ones],
    ].join("");
  };

  let thousand = (group, i) => (group === "" ? group : `${group} ${g[i]}`);

  if (typeof n === "number") return numToWords(String(n));
  else if (n === "0") return "zero";
  else
    return comp(chunk(3))(reverse)(arr(n))
      .map(makeGroup)
      .map(thousand)
      .filter(comp(not)(isEmpty))
      .reverse()
      .join(" ");
};

export function titleCase(str) {
  str = str.toLowerCase().split(" ");
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
}

export const getDateFromDateTime = (dateTime) =>
  moment.utc(dateTime).format("YYYY-MM-DD");
export const getDateFromDateTimeToDisplay = (dateTime) =>
  moment.utc(dateTime).format("DD-MM-YYYY");

export function findFromList(id, list, property) {
  if (!list) return "";
  let data = list.find((i) => parseInt(i.id) === parseInt(id));
  if (!data) return "";
  return data[property];
}
export function findFromListReturnsItem(id, list) {
  if (!list) return "";
  let data = list.find((i) => parseInt(i.id) === parseInt(id));
  if (!data) return "";
  return data;
}

export function isBetweenRange(startValue, endValue, value) {
  return (
    parseFloat(startValue) <= parseFloat(value) &&
    parseFloat(value) <= parseFloat(endValue)
  );
}

export function substract(num1, num2) {
  let n1 = parseFloat(num1) * 1000;
  let n2 = parseFloat(num2) * 1000;
  let result = (n1 - n2) / 1000;
  return result;
}

export function getAllowableReturnQty(inwardedQty, returnedQty, stockQty) {
  let balanceReturnQty = parseFloat(inwardedQty) + parseFloat(returnedQty);
  return balanceReturnQty < parseFloat(stockQty)
    ? balanceReturnQty
    : parseFloat(stockQty);
}

export function priceWithTax(price, tax) {
  if (!price) return 0;
  if (!tax) return parseFloat(price);
  let taxAmount = (parseFloat(price) / 100) * parseFloat(tax);
  return parseFloat(price) + taxAmount;
}

export function getItemFullNameFromShortCode(shortCode) {
  let fullForm = "";
  switch (shortCode) {
    case "GY":
      fullForm = "GreyYarn";
      break;
    case "GF":
      fullForm = "GreyFabric";
      break;
    case "DY":
      fullForm = "DyedYarn";
      break;
    case "DF":
      fullForm = "DyedFabric";
      break;
    default:
      break;
  }
  return fullForm;
}

export function filterGodown(store, itemShortCode) {
  if (itemShortCode.includes("Y")) {
    return store.isYarn;
  } else if (itemShortCode.includes("F")) {
    return store.isFabric;
  }
}

export const params = {
  companyId: secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId",
  ),
  branchId: secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId",
  ),
  userId: secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId",
  ),
  finYearId: secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentFinYear",
  ),
};

export const getCommonParams = () => ({
  companyId: secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId",
  ),
  branchId: secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId",
  ),
  userId: secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId",
  ),
  finYearId: secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentFinYear",
  ),
  token: `Bearer ${secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "token")} `,
});

export function isGridDatasValid(
  datas,
  isRequiredAllData,
  mandatoryFields = [],
) {
  if (isRequiredAllData) {
    let gridDatasValid = datas.every((obj) =>
      Object.values(obj).every(
        (value) => value !== "" && value !== null && value !== 0,
      ),
    );
    return gridDatasValid;
  } else {
    let gridDatasValid = datas.every((obj) =>
      mandatoryFields.every(
        (field) =>
          obj[field] &&
          obj[field] !== "" &&
          obj[field] !== null &&
          parseFloat(obj[field]) !== 0,
      ),
    );
    return gridDatasValid;
  }
}

export const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

export function sumArray(arr, property) {
  return arr.reduce(
    (total, current) => parseFloat(total) + parseFloat(current[property]),
    0,
  );
}

export function getBalanceBillQty(inwardQty, returnQty, alreadyBilledQty) {
  return substract(substract(inwardQty, returnQty), alreadyBilledQty).toFixed(
    3,
  );
}

export function printDiv(divName) {
  var printContents = document.getElementById(divName).innerHTML;
  var originalContents = document.body.innerHTML;
  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
}

export function getDiscountAmount(discountType, discountValue, grossAmount) {
  return discountType
    ? discountType === "Flat"
      ? discountValue
      : (grossAmount / 100) * parseFloat(discountValue)
    : 0;
}

export function removeComma(str) {
  return str ? str.replace(/,/g, "") : "";
}
export function renameFile(originalFile) {
  const file = new File([originalFile], Date.now() + originalFile.name, {
    type: originalFile.type,
    lastModified: originalFile.lastModified,
  });
  return file;
}

export function amountInWords(amount) {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let words = `Rupees ${toWords(rupees)}`;

  if (paise > 0) {
    words += ` and Paise ${toWords(paise)}`;
  }

  return words + " Only";
}

export function formatAmountIN(value = 0) {
  const amount = Number(value) || 0;

  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getUniqueArrayBySize(rowData, allData, key, itemId) {
  const item = rowData?.find((i) => i.id === itemId);
  const uniqueIds = item?.SizeTemplate?.SizeTemplateList?.map(
    (item) => item.sizeId,
  );
  // ✅ return empty array if no template found
  if (!uniqueIds || uniqueIds.length === 0) return allData || [];

  return allData?.filter((all) => uniqueIds?.includes(all?.id)) || [];
}

export const ModeChip = ({ id, readOnly }) => {
  if (id && readOnly) {
    return (
      <span className="mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
        Read
      </span>
    );
  }

  if (id && !readOnly) {
    return (
      <span className="mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-600 text-white">
        Edit
      </span>
    );
  }

  return null;
};
