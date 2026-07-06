const FOCUSABLE_SELECTOR = [
  'input:not([disabled]):not([readonly])',
  'textarea:not([disabled]):not([readonly])',
  'select:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const findFocusableInCell = (cell) => {
  if (!cell) return null;

  return cell.querySelector(FOCUSABLE_SELECTOR);
};

const isEditableCell = (cell) => cell?.dataset?.gridEditable === "true";

export const focusFirstEditableFieldInRow = (rowElement) => {
  if (!rowElement) return false;

  const cells = Array.from(rowElement.querySelectorAll("td"));
  const target = cells
    .filter(isEditableCell)
    .map((cell) => findFocusableInCell(cell))
    .find(Boolean);

  if (!target) {
    return false;
  }

  target.focus();
  return true;
};

export const focusNextGridField = ({
  currentElement,
  onReachGridEnd,
  delay = 60,
}) => {
  const currentCell = currentElement?.closest?.("td");
  const currentRow = currentCell?.closest?.("tr");
  const tbody = currentRow?.parentElement;

  if (!currentCell || !currentRow || !tbody) {
    return false;
  }

  const rows = Array.from(tbody.querySelectorAll("tr")).filter((row) =>
    row.querySelector("td"),
  );
  const rowIndex = rows.indexOf(currentRow);

  if (rowIndex < 0) {
    return false;
  }

  const focusNextAvailableField = (startRowIndex, startCellIndex) => {
    for (let nextRowIndex = startRowIndex; nextRowIndex < rows.length; nextRowIndex += 1) {
      const cells = Array.from(rows[nextRowIndex].querySelectorAll("td"));
      const firstCellIndex = nextRowIndex === startRowIndex ? startCellIndex : 0;

      for (let nextCellIndex = firstCellIndex; nextCellIndex < cells.length; nextCellIndex += 1) {
        if (!isEditableCell(cells[nextCellIndex])) {
          continue;
        }

        const focusable = findFocusableInCell(cells[nextCellIndex]);

        if (focusable) {
          focusable.focus();
          return true;
        }
      }
    }

    return false;
  };

  const currentCells = Array.from(currentRow.querySelectorAll("td"));
  const currentCellIndex = currentCells.indexOf(currentCell);

  if (currentCellIndex < 0) {
    return false;
  }

  const movedToNextField = focusNextAvailableField(rowIndex, currentCellIndex + 1);

  if (movedToNextField) {
    return true;
  }

  const movedToNextRow = focusNextAvailableField(rowIndex + 1, 0);

  if (movedToNextRow) {
    return true;
  }

  if (!onReachGridEnd) {
    return false;
  }

  onReachGridEnd();

  window.setTimeout(() => {
    const updatedRows = Array.from(tbody.querySelectorAll("tr")).filter((row) =>
      row.querySelector("td"),
    );
    const nextRow = updatedRows[rowIndex + 1];
    if (nextRow) {
      focusFirstEditableFieldInRow(nextRow);
    }
  }, delay);

  return true;
};

export const focusPreviousGridField = ({ currentElement }) => {
  const currentCell = currentElement?.closest?.("td");
  const currentRow = currentCell?.closest?.("tr");
  const tbody = currentRow?.parentElement;

  if (!currentCell || !currentRow || !tbody) {
    return false;
  }

  const rows = Array.from(tbody.querySelectorAll("tr")).filter((row) =>
    row.querySelector("td"),
  );
  const rowIndex = rows.indexOf(currentRow);

  if (rowIndex < 0) {
    return false;
  }

  const currentCells = Array.from(currentRow.querySelectorAll("td"));
  const currentCellIndex = currentCells.indexOf(currentCell);

  if (currentCellIndex < 0) {
    return false;
  }

  for (let previousRowIndex = rowIndex; previousRowIndex >= 0; previousRowIndex -= 1) {
    const cells = Array.from(rows[previousRowIndex].querySelectorAll("td"));
    const startCellIndex =
      previousRowIndex === rowIndex ? currentCellIndex - 1 : cells.length - 1;

    for (let previousCellIndex = startCellIndex; previousCellIndex >= 0; previousCellIndex -= 1) {
      const cell = cells[previousCellIndex];

      if (!isEditableCell(cell)) {
        continue;
      }

      const focusable = findFocusableInCell(cell);

      if (focusable) {
        focusable.focus();
        return true;
      }
    }
  }

  return false;
};

export default focusNextGridField;
