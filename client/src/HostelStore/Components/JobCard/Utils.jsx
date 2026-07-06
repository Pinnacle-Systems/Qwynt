// ─────────────────────────────────────────────────────────────
// CheckBox Component
// ─────────────────────────────────────────────────────────────
export const CheckBox = ({
  name,
  value,
  setValue,
  readOnly = false,
  className,
  required = false,
  disabled = false,
  tabIndex = null,
}) => (
  <label
    className={`inline-flex items-center gap-1.5 cursor-pointer select-none text-xs font-medium text-slate-700 leading-none ${readOnly || disabled ? "opacity-50 cursor-not-allowed" : "hover:text-indigo-600"} ${className || ""}`}
  >
    <input
      tabIndex={tabIndex ?? undefined}
      type="checkbox"
      required={required}
      checked={value}
      onChange={() => !readOnly && !disabled && setValue(!value)}
      disabled={readOnly || disabled}
      className="w-[14px] h-[14px] min-w-[14px] min-h-[14px] rounded border border-slate-400 accent-indigo-600 cursor-pointer disabled:cursor-not-allowed"
    />
    <span>{name}</span>
  </label>
);

// ── Section card ─────────────────────────────────────────────
export const SectionCard = ({
  title,
  children,
  className = "",
  overflow = true,
}) => (
  <div
    className={`bg-white rounded-lg border border-slate-200 shadow-sm ${overflow ? "overflow-hidden" : ""} ${className}`}
  >
    {title && (
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
          {title}
        </h3>
      </div>
    )}
    <div className="p-3">{children}</div>
  </div>
);

// ── Field label + input wrapper ───────────────────────────────
export const Field = ({
  label,
  children,
  className = "",
  required = false,
}) => (
  <div className={`flex flex-col gap-0.5 ${className}`}>
    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </span>
    {children}
  </div>
);

// ── LV Row / Header ───────────────────────────────────────────
export const LVHeader = () => (
  <div className="flex items-center gap-2 pb-1 mb-1 border-b border-slate-200">
    <span className="flex-[2] text-[9px] font-bold uppercase tracking-wider text-slate-400">
      Type
    </span>
    <span className="flex-1 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">
      Front
    </span>
    <span className="flex-1 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">
      F&B
    </span>
  </div>
);

export const LVRow = ({
  item,
  selected,
  onMain,
  onFront,
  onFrontBack,
  readOnly,
}) => (
  <div className="flex items-center gap-2 py-1 border-b border-slate-100 last:border-0">
    <div className="flex-[2] min-w-0">
      <CheckBox
        name={item.name}
        value={!!selected}
        setValue={onMain}
        readOnly={readOnly}
      />
    </div>
    <div className="flex-1 flex justify-center">
      <CheckBox
        name=""
        value={selected?.isFront || false}
        setValue={onFront}
        readOnly={!selected || readOnly}
      />
    </div>
    <div className="flex-1 flex justify-center">
      <CheckBox
        name=""
        value={selected?.isFrontAndBack || false}
        setValue={onFrontBack}
        readOnly={!selected || readOnly}
      />
    </div>
  </div>
);

// ─── helper: map DB boardQualities rows → BoardDetails row objects ───────────
export const mapBoardQualitiesToRows = (boardQualities) => {
  if (!boardQualities?.length) return [];
  return boardQualities.map((b) => ({
    processId: b.processId || "", // support both shapes
    gsmId: b.gsmId || "",
    fullBoardId: b.fullBoardId || "",
    stockQty: b.stockQty || "",
    noOfSheets: b.noOfSheets || b.noOfPockets || "",
  }));
};

export const toggleArr = (setter, val) =>
  setter((prev) =>
    prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val],
  );
export const toggleLV = (setter, pid) =>
  setter((prev) => {
    const exists = prev.find((l) => l.processId === pid);
    return exists
      ? prev.filter((l) => l.processId !== pid)
      : [...prev, { processId: pid, isFront: false, isFrontAndBack: false }];
  });
export const toggleLVProp = (setter, pid, prop) =>
  setter((prev) =>
    prev.map((l) => (l.processId === pid ? { ...l, [prop]: !l[prop] } : l)),
  );
