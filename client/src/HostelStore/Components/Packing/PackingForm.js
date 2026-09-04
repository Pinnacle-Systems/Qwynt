import { IoArrowBackCircleSharp } from "react-icons/io5";

import {
  DateInputNew,
  DropdownInput,
  ReusableInput,
  ReusableSearchableInput,
  TextInput,
} from "../../../Inputs/index.js";
import {
  TransactionLayout,
  TransactionActions,
  TransactionGrid,
} from "../../../Basic/components/Reuseable/index.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import {
  findFromList,
  getCommonParams,
  isGridDatasValid,
  ModeChip,
  renameFile,
} from "../../../Utils/helper.js";
import { toast } from "react-toastify";
import { FiEdit2, FiSave, FiPaperclip, FiEye, FiTrash2 } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import Swal from "sweetalert2";
import { dropDownListObject } from "../../../Utils/contructObject.js";
import {
  useAddPackingMutation,
  useGetPackingByIdQuery,
  useUpdatePackingMutation,
} from "../../../redux/uniformService/PackingService.js";
import { useGetLocationMasterQuery } from "../../../redux/services/LocationMasterService.js";
import { useLazyGetQrStockForPackingQuery } from "../../../redux/services/StockService.js";
import { invalidatePurchaseModule } from "../../../redux/Dispatch/PurchaseInvalidateTags.js";
import { invalidateboxModule } from "../../../redux/Dispatch/boxInvalidTags.js";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { useLazyGetBoxQuery } from "../../../redux/services/BoxCreationService.js";
import { PartyMaster } from "../index.js";
import { LocationMaster } from "../../../Basic/components/index.js";
import { DropdownWithModal } from "../../../Inputs/Reuseable.js";
import Modal from "../../../UiComponents/Modal/index.js";
import { getImageUrlPath } from "../../../Constants/index.js";
import { Plus, QrCode } from "lucide-react";

const PackingForm = ({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
  supplierList,
  uomList,
  styleItemList,
  branchList,
  hsnList,
  sizeList,
  colorList,
  fromPoId,
  fromPoSupplierId,
  fromPoType,
  setFromPoId,
  setFromPoSupplierId,
  setFromPoType,
  taxTypeList,
  gsmList,
  itemVariantList,
}) => {
  const today = new Date();

  const [docDate, setDocDate] = useState(
    moment.utc(today).format("YYYY-MM-DD"),
  );
  const EMPTY_PACKED = {
    id: "",
    qrCode: "",
    Po: null,
    ItemVariant: null,
    Hsn: null,
    Color: null,
    Uom: null,
    Size: null,
    PrintingDesign: null,
    itemName: "",
  };

  const createInitialBoxes = () =>
    Array.from({ length: 45 }, () => ({
      boxId: "",
      boxCode: "",
      packedItems: Array.from({ length: 30 }, () => ({ ...EMPTY_PACKED })),
    }));

  const [supplierId, setSupplierId] = useState("");
  const [packingBoxItems, SetPackingBoxItems] = useState(createInitialBoxes());
  const [remarks, setRemarks] = useState("");
  const [storeId, setStoreId] = useState("");
  const [docId, setDocId] = useState("");
  const [userDate, setUserDate] = useState(
    moment.utc(today).format("YYYY-MM-DD"),
  );
  const [locationId, setLocationId] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [viewBoxModal, setViewBoxModal] = useState(null);
  const [attachmentModal, setAttachmentModal] = useState(false);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(null);
  const [attachments, setAttachments] = useState([]);

  const [qrCodeInput, setQrCodeInput] = useState("");
  const [scannedQrCodes, setScannedQrCodes] = useState([]);
  const [activeBoxCode, setActiveBoxCode] = useState(null);
  const [activeBoxId, setActiveBoxId] = useState(null);
  const [boxCodeInput, setBoxCodeInput] = useState("");
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    if (id) return;
    setActiveBoxCode(null);
    setActiveBoxId(null);
    SetPackingBoxItems(createInitialBoxes());
    setScannedQrCodes([]);
  }, [supplierId, id]);

  const [getBox] = useLazyGetBoxQuery();

  const handleBoxQrSubmit = async (e) => {
    if (e.key === "Enter" && boxCodeInput) {
      e.preventDefault();
      if (!locationId) {
        toast.error("Please select a Location first!");
        return;
      }
      try {
        const response = await getBox({ searchParams: boxCodeInput }).unwrap();
        if (response.statusCode === 0 && response.data?.length > 0) {
          const fetchedBox =
            response.data.find((b) => b.docId === boxCodeInput) ||
            response.data[0];

          SetPackingBoxItems((prev) => {
            const newItems = [...prev];
            // Only add if it doesn't already exist in the form
            if (!newItems?.some((b) => b.boxCode === boxCodeInput)) {
              const emptyIdx = newItems?.findIndex((b) => !b.boxCode);
              if (emptyIdx !== -1) {
                newItems[emptyIdx] = {
                  ...newItems[emptyIdx],
                  boxCode: boxCodeInput,
                  boxId: fetchedBox.id,
                  boxStyleItems: fetchedBox.boxStyleItems || [],
                  isNew: true,
                };
              }
            }
            return newItems;
          });

          setActiveBoxCode(boxCodeInput);
          setActiveBoxId(fetchedBox.id);
          setBoxCodeInput("");
        } else if (response.statusCode === 1) {
          toast.error(response.message || "Box not found in database!");
          setBoxCodeInput("");
        } else {
          toast.error("Box not found in database!");
          setBoxCodeInput("");
        }
      } catch (error) {
        toast.error("Error fetching box details!");
        setBoxCodeInput("");
      }
    }
  };
  const [getQrStockForPacking, { isLoading: isQrLoading }] =
    useLazyGetQrStockForPackingQuery();

  const supplierRef = useRef(null);
  const [dispatchInvalidate] = useInvalidateTags();
  const vehicleRef = useRef(null);

  const { userId, finYearId, branchId, companyId } = getCommonParams();
  const { data: locationData } = useGetLocationMasterQuery({
    params: { branchId },
  });

  const storeOptions = locationData
    ? locationData.data.filter(
        (item) => parseInt(item.locationId) === parseInt(locationId),
      )
    : [];

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPackingByIdQuery(id, { skip: !id });
  console.log(singleData, "singleData");

  const [addData] = useAddPackingMutation();
  const [updateData] = useUpdatePackingMutation();

  const handleRemoveBox = (boxCode) => {
    const boxIdx = packingBoxItems.findIndex((b) => b.boxCode === boxCode);
    const removedQrCodes =
      boxIdx !== -1
        ? packingBoxItems[boxIdx].packedItems
            .filter((p) => p.qrCode)
            .map((p) => p.qrCode)
        : [];

    SetPackingBoxItems((prev) => {
      const newItems = [...prev];
      const idx = newItems.findIndex((b) => b.boxCode === boxCode);
      if (idx !== -1) {
        newItems[idx] = {
          boxId: "",
          boxCode: "",
          packedItems: Array.from({ length: 30 }, () => ({ ...EMPTY_PACKED })),
        };
      }
      return newItems.sort((a, b) => {
        if (a.boxCode && !b.boxCode) return -1;
        if (!a.boxCode && b.boxCode) return 1;
        return 0;
      });
    });

    if (removedQrCodes.length > 0) {
      setScannedQrCodes((prev) =>
        prev.filter((qr) => !removedQrCodes.includes(qr)),
      );
    }
    if (activeBoxCode === boxCode) {
      setActiveBoxCode(null);
      setActiveBoxId(null);
    }
  };

  const handleRightClick = (event, rowIndex) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      rowId: rowIndex,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleRemoveItemFromBox = (boxCode, itemIndex) => {
    const boxIdx = packingBoxItems.findIndex((b) => b.boxCode === boxCode);
    const removedQrCode =
      boxIdx !== -1
        ? packingBoxItems[boxIdx].packedItems[itemIndex]?.qrCode
        : null;

    SetPackingBoxItems((prev) => {
      const newItems = [...prev];
      const idx = newItems.findIndex((b) => b.boxCode === boxCode);
      if (idx !== -1) {
        const newPackedItems = [...newItems[idx].packedItems];
        newPackedItems[itemIndex] = { ...EMPTY_PACKED };

        newItems[boxIdx] = {
          ...newItems[boxIdx],
          packedItems: [
            ...newPackedItems.filter((p) => p.id),
            ...newPackedItems.filter((p) => !p.id),
          ],
        };
      }
      return newItems;
    });

    if (removedQrCode) {
      setScannedQrCodes((prev) => prev.filter((qr) => qr !== removedQrCode));
    }
  };

  const handleQrSubmit = async (e) => {
    if (e.key === "Enter" && qrCodeInput) {
      e.preventDefault();
      if (scannedQrCodes.includes(qrCodeInput)) {
        toast.error("This item has already been scanned!");
        setQrCodeInput("");
        return;
      }
      if (!supplierId) {
        toast.error("Please select a supplier first!");
        return;
      }
      if (!activeBoxCode) {
        toast.error("Please scan and open a box first!");
        return;
      }
      try {
        const boxIndex = packingBoxItems.findIndex(
          (b) => b.boxId === activeBoxId,
        );
        let scannedStockIds = [];
        if (boxIndex !== -1) {
          scannedStockIds = packingBoxItems[boxIndex].packedItems
            .filter((p) => p.id)
            .map((p) => p.id);
        }

        const response = await getQrStockForPacking({
          qrCode: qrCodeInput,
          supplierId,
          boxId: activeBoxId,
          scannedStockIds: scannedStockIds.join(","),
        }).unwrap();
        if (response.statusCode === 0 && response.data) {
          const stock = response.data;

          if (stock.itemStatus !== "INWARDED") {
            toast.error("Item status is not INWARDED!");
            setQrCodeInput("");
            return;
          }

          // === NEW FRONTEND VALIDATION LOGIC ===
          const currentBoxIndex = packingBoxItems.findIndex(
            (b) => b.boxCode === activeBoxCode,
          );
          if (currentBoxIndex !== -1) {
            const currentBox = packingBoxItems[currentBoxIndex];
            const currentPacked =
              currentBox.packedItems?.filter((p) => p.id) || [];

            // 1. Total quantity check
            const expectedTotal =
              currentBox.boxStyleItems?.reduce(
                (acc, curr) => acc + (curr.qty || 0),
                0,
              ) || 0;
            if (expectedTotal > 0 && currentPacked.length >= expectedTotal) {
              toast.error(
                `Cannot add more items! Box ${activeBoxCode} is full (max ${expectedTotal} items).`,
              );
              setQrCodeInput("");
              return;
            }

            // 2. Style specific check
            if (currentBox.boxStyleItems?.length > 0) {
              const scannedStyleId = stock.ItemVariant?.styleId;
              const styleConfig = currentBox.boxStyleItems.find(
                (bsi) => bsi.styleId === scannedStyleId,
              );
              console.log(styleConfig, "styleConfig");

              if (!styleConfig) {
                toast.error(
                  `Invalid Item! This style is not required for this box.`,
                );
                setQrCodeInput("");
                return;
              }

              const currentStylePackedCount = currentPacked.filter(
                (p) => p.ItemVariant?.styleId === scannedStyleId,
              ).length;
              if (currentStylePackedCount >= styleConfig.qty) {
                toast.error(
                  `Cannot add item! Box already has the maximum ${styleConfig.qty} items for Style ${styleConfig.styleMaster?.styleNo || styleConfig.styleMaster?.name || ""}.`,
                );
                setQrCodeInput("");
                return;
              }
            }
          }
          // === END NEW FRONTEND VALIDATION LOGIC ===

          const packedItemDetails = {
            id: stock.id,
            qrCode: qrCodeInput,
            Po: stock.Po || null,
            ItemVariant: stock.ItemVariant || null,
            Hsn: stock.Hsn || null,
            Color: stock.Color || null,
            Uom: stock.Uom || null,
            Size: stock.Size || null,
            PrintingDesign: stock.printingDesign || null,
            itemName:
              stock.ItemVariant?.styleMaster?.name ||
              stock.ItemVariant?.name ||
              `Item (QR: ${qrCodeInput})`,
            isNewPackedItem: true,
          };

          SetPackingBoxItems((prev) => {
            const newItems = [...prev];
            const boxIndex = newItems.findIndex(
              (b) => b.boxCode === activeBoxCode,
            );

            if (boxIndex !== -1) {
              const currentPacked = newItems[boxIndex].packedItems;
              const emptyItemIdx = currentPacked.findIndex((p) => !p.id);

              if (emptyItemIdx !== -1) {
                const newPackedItems = [...currentPacked];
                newPackedItems[emptyItemIdx] = packedItemDetails;
                newItems[boxIndex] = {
                  ...newItems[boxIndex],
                  packedItems: newPackedItems,
                };
              } else {
                // If more than 30 are scanned, auto-add row
                newItems[boxIndex] = {
                  ...newItems[boxIndex],
                  packedItems: [...currentPacked, packedItemDetails],
                };
              }
            }
            return newItems;
          });
          setScannedQrCodes((prev) => [...new Set([...prev, qrCodeInput])]);
          setQrCodeInput("");
        } else {
          toast.error(response.message || "Stock not found");
        }
      } catch (err) {
        toast.error("Failed to fetch stock via QR");
      }
    }
  };

  const syncFormWithDb = useCallback(
    (data) => {
      setDocId(data?.docId ? data?.docId : "New");
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(new Date()).format("YYYY-MM-DD"),
      );
      setLocationId(data?.Store ? data.Store.locationId : branchId);
      setStoreId(data?.storeId ? data.storeId : "");
      const items = data?.packingBoxItems
        ? data.packingBoxItems.map((pbi) => ({
            boxId: pbi.boxId,
            boxCode: pbi.box?.docId || "",
            boxStyleItems: pbi.box?.boxStyleItems || [],
            isNew: false,
            packedItems: (pbi.packingItems || []).map((pi) => {
              const stock = pi.stock || {};
              return {
                id: stock.id,
                qrCode: stock.qrCode || "",
                Po: stock.Po || null,
                ItemVariant: stock.ItemVariant || null,
                Hsn: stock.Hsn || null,
                Color: stock.Color || null,
                Uom: stock.Uom || null,
                Size: stock.Size || null,
                PrintingDesign: stock.printingDesign || null,
                itemName:
                  stock.ItemVariant?.styleMaster?.name ||
                  stock.ItemVariant?.name ||
                  `Item (QR: ${stock.qrCode})`,
                isNewPackedItem: false,
              };
            }),
          }))
        : [];

      const initialBoxes = createInitialBoxes();
      const qrCodes = [];
      console.log("items =>", items);
      // Basic merge to not crash if backend sends old or new format
      items.forEach((item, index) => {
        if (index < 45 && item.boxCode) {
          initialBoxes[index].boxCode = item.boxCode;
          initialBoxes[index].boxId = item.boxId || item.boxCode;

          if (item.packedItems && Array.isArray(item.packedItems)) {
            item.packedItems.forEach((packed, pIdx) => {
              if (pIdx < 30) {
                initialBoxes[index].packedItems[pIdx] = packed;
              } else {
                initialBoxes[index].packedItems.push(packed);
              }
              if (packed.qrCode) qrCodes.push(packed.qrCode);
            });
          } else if (item.qrCodes && Array.isArray(item.qrCodes)) {
            // Fallback for old structure
            qrCodes.push(...item.qrCodes);
          }
        }
      });
      // Log initialBoxes to see the mapped data BEFORE React's async setState
      console.log("initialBoxes =>", initialBoxes);

      SetPackingBoxItems(items.length ? initialBoxes : createInitialBoxes());
      // Note: console.log("packingBoxItems") here will show OLD state because setState is async!
      console.log("packingBoxItems (OLD STATE) =>", packingBoxItems);

      setScannedQrCodes(qrCodes);

      setSupplierId(data?.supplierId || fromPoSupplierId || "");

      setUserDate(
        data?.userDate
          ? moment.utc(data.userDate).format("YYYY-MM-DD")
          : moment.utc(new Date()).format("YYYY-MM-DD"),
      );
      setRemarks(data?.remarks || "");

      setVehicleNo(data?.vehicleNo ? data.vehicleNo : "");
      setAttachments(data?.attachments ? data?.attachments : []);
    },
    [id, fromPoSupplierId, fromPoType],
  );

  useEffect(() => {
    if (id && singleData?.data) {
      syncFormWithDb(singleData.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  let data = {
    id,
    docDate,
    userDate,
    branchId,
    userId,
    locationId,
    storeId,
    supplierId,
    companyId,
    remarks,
    vehicleNo,
    packingBoxItems: packingBoxItems
      ?.filter((po) => po.boxId)
      .map((box) => ({
        boxId: box.boxId,
        boxCode: box.boxCode,
        packedItems: box.packedItems
          .filter((item) => item.id)
          .map((item) => ({
            id: item.id,
            qrCode: item.qrCode,
          })),
      })),
    finYearId,

    attachments: attachments?.filter((i) => i.filePath),
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      const formData = new FormData();
      for (let key in data) {
        if (key == "attachments") {
          console.log("attachments =>", data[key]);
          formData.append(
            key,
            JSON.stringify(
              data[key].map((i) => ({
                ...i,
                filePath:
                  i.filePath instanceof File ? i.filePath.name : i.filePath,
              })),
            ),
          );
          data[key].forEach((option) => {
            if (option?.filePath instanceof File) {
              formData.append("images", option.filePath);
            }
          });
        } else if (
          key === "packingBoxItems" ||
          Array.isArray(data[key]) ||
          (typeof data[key] === "object" && data[key] !== null)
        ) {
          formData.append(key, JSON.stringify(data[key])); // ✅ stringify arrays and objects
        } else {
          formData.append(key, data[key]); // ✅ primitives appended as-is
        }
      }
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
      } else {
        returnData = await callback(formData).unwrap();
      }
      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
      } else {
        Swal.fire({
          icon: "success",
          title: `${text || "Saved"} Successfully`,
          showConfirmButton: false,
          timer: 2000,
          didClose: () => {
            // ✅ Runs after Swal completely closes
            invalidatePurchaseModule();
            invalidateboxModule();
            dispatchInvalidate();

            if (returnData.statusCode === 0) {
              if (nextProcess == "new") {
                setId(0);
                setDocId("New");
                syncFormWithDb(undefined);
                setFromPoId("");
                setFromPoSupplierId("");
                setFromPoType("");
                // ✅ Focus the Bill Type dropdown after all state updates
                setTimeout(() => {
                  supplierRef.current?.focus();
                }, 100);
              }
              if (nextProcess == "close") {
                onClose();
              }
            } else {
              toast.error(returnData?.message);
            }
          },
        });
      }
    } catch (error) {
      console.log("handle", error);
    }
  };

  const findDuplicates = (items) => {
    const seen = new Map(); // key -> first index
    const duplicates = [];

    items.forEach((row, index) => {
      const key = [
        // row.styleItemId || "",
        row.sizeId || "",
        row.colorId || "",
        row.gsmId || "",
      ].join("-");

      if (seen.has(key)) {
        duplicates.push({
          firstIndex: seen.get(key),
          duplicateIndex: index,
          // styleItemId: row.styleItemId,
          sizeId: row.sizeId,
          colorId: row.colorId,
          gsmId: row.gsmId,
        });
      } else {
        seen.set(key, index);
      }
    });

    return duplicates; // empty array = no duplicates
  };

  const validateData = (data) => {
    const items = data?.packingBoxItems || [];
    const filledItems = items.filter((item) => item.boxId);
    const checks = [
      { condition: !data.locationId, title: "Branch is required!" },
      { condition: !data.storeId, title: "Location is required!" },
      { condition: !data.supplierId, title: "Supplier is required!" },
      {
        condition: filledItems.length === 0,
        title: "Please add at least one item!",
      },
    ];

    for (const pbi of filledItems) {
      if (pbi?.boxStyleItems && pbi?.boxStyleItems?.length > 0) {
        for (const bsi of pbi?.boxStyleItems) {
          if (!bsi?.qty) continue;

          const packedCount = (pbi?.packedItems || [])?.filter(
            (p) => p.id && p.ItemVariant?.styleId === bsi?.styleId,
          ).length;

          if (packedCount !== bsi?.qty) {
            const styleName = bsi.styleMaster?.styleNo;
            checks.push({
              condition: true,
              title: "Quantity Mismatch!",
              html: `Box <b>${pbi?.boxCode}</b> requires exactly ${bsi?.qty} of <b>${styleName}</b>. You packed ${packedCount}.`,
            });
            // Break early so we just show one error at a time
            break;
          }
        }

        // Also verify the total packed items match the expected total quantity
        const expectedTotal = pbi.boxStyleItems.reduce(
          (acc, curr) => acc + (curr.qty || 0),
          0,
        );
        const actualTotal = (pbi.packedItems || []).filter((p) => p.id).length;
        if (actualTotal !== expectedTotal && !checks.some((c) => c.condition)) {
          checks.push({
            condition: true,
            title: "Total Quantity Mismatch!",
            html: `Box <b>${pbi?.boxCode}</b> expects a total of ${expectedTotal} items, but you packed ${actualTotal} items.`,
          });
        }
      }
    }

    const failed = checks.find((c) => c.condition);
    if (failed) {
      Swal.fire({
        icon: "warning",
        title: failed.title,
        html: failed.html,
        timer: failed.html ? undefined : 1500,
        showConfirmButton: !!failed.html,
        confirmButtonText: "OK",
      });
      return false;
    }

    return true;
  };

  const saveData = (nextProcess) => {
    if (!validateData(data)) {
      return;
    }
    if (id) {
      if (!window.confirm("Are you sure update the details ...?")) {
        return;
      }
    }
    if (nextProcess == "draft" && !id) {
      handleSubmitCustom(
        addData,
        (data = { ...data, draftSave: true }),
        "Added",
        nextProcess,
      );
    } else if (id && nextProcess == "draft") {
      handleSubmitCustom(
        updateData,
        { ...data, draftSave: true },
        "Updated",
        nextProcess,
      );
    } else if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData("close");
    }
  };

  useEffect(() => {
    supplierRef.current?.focus();
  }, []);

  useEffect(() => {
    if (attachments?.length >= 5) return;
    setAttachments((prev) => {
      let newArray = Array.from({ length: 5 - prev?.length }, () => {
        return { date: today, filePath: "", log: "" };
      });
      return [...prev, ...newArray];
    });
  }, [setAttachments, attachments]);

  function handleInputChange(value, index, field) {
    const newBlend = structuredClone(attachments);
    newBlend[index][field] = value;
    setAttachments(newBlend);
  }

  function openPreview(filePath) {
    window.open(
      filePath instanceof File
        ? URL.createObjectURL(filePath)
        : getImageUrlPath(filePath),
    );
  }

  function addNewComments() {
    setAttachments((prev) => [...prev, { log: "", date: today, filePath: "" }]);
    // setDueDate(moment.utc(today).format("YYYY-MM-DD"));
  }

  function deleteRow(index) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }
  console.log(packingBoxItems, "packingBoxItemsinparent");

  const fieldClass = "px-2 py-1 text-[11px]";
  const modalFieldClass = "w-full px-2 py-1 text-[11px]";
  const cardClass =
    "border border-slate-200 px-1.5 py-1 bg-white rounded-md shadow-sm";
  const sectionTitleClass = "font-medium text-[11px] text-slate-700 mb-0.5";
  const fieldWidthMedium = "w-full min-w-0";
  const fieldWidthDate = "w-full min-w-0";
  const narrowFieldWrap = "min-w-0";
  const partyDropdownMinWidth = 260;

  return (
    <>
      {attachmentModal && (
        <Modal
          isOpen={attachmentModal}
          onClose={() => {
            setAttachmentModal(false);
            setSelectedAttachmentIndex(null);
          }}
          widthClass="p-4 w-[600px] h-[420px]"
        >
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-700">
              Attachments
            </h2>

            {/* Drag & Drop Zone */}
            <div
              className="border-2 border-dashed border-indigo-300 rounded-lg p-4 text-center cursor-pointer hover:bg-indigo-50 transition"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && selectedAttachmentIndex !== null) {
                  handleInputChange(
                    renameFile(file),
                    selectedAttachmentIndex,
                    "filePath",
                  );
                }
              }}
              onClick={() =>
                document.getElementById("modal-file-upload")?.click()
              }
            >
              <p className="text-sm text-slate-500">
                Drag & drop here, or{" "}
                <span className="text-indigo-600 font-medium underline">
                  click to browse
                </span>
              </p>
              {selectedAttachmentIndex !== null ? (
                <p className="text-xs text-indigo-500 mt-1">
                  Uploading to row:{" "}
                  <strong>{selectedAttachmentIndex + 1}</strong>
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">
                  Select a row below first
                </p>
              )}
            </div>

            {/* Hidden file input for drag & drop zone */}
            <input
              type="file"
              id="modal-file-upload"
              className="hidden"
              onChange={(e) => {
                if (e.target.files[0] && selectedAttachmentIndex !== null) {
                  handleInputChange(
                    renameFile(e.target.files[0]),
                    selectedAttachmentIndex,
                    "filePath",
                  );
                  e.target.value = "";
                }
              }}
              disabled={readOnly}
            />

            {/* Attachments Table */}
            <div className="max-h-[200px] overflow-auto">
              <div className="border-collapse bg-[#F1F1F0] shadow-sm overflow-auto">
                <table className="bg-gray-200 text-gray-800 text-sm table-auto w-full">
                  <thead className="py-2 font-medium sticky top-0">
                    <tr>
                      <th className="py-2 text-xs w-10 text-center border-r border-white/50">
                        S.No
                      </th>
                      <th className="py-2 text-xs w-60 text-center border-r border-white/50">
                        Name
                      </th>
                      <th className="py-2 text-xs w-60 text-center border-r border-white/50">
                        File
                      </th>
                      <th className="py-2 text-xs w-10 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attachments?.map((item, index) => (
                      <tr
                        key={index}
                        onClick={() => setSelectedAttachmentIndex(index)}
                        className={`transition-colors border-b border-gray-200 text-[12px] cursor-pointer ${
                          index === selectedAttachmentIndex
                            ? "bg-indigo-100 border-l-2 border-l-indigo-500"
                            : index % 2 === 0
                              ? "bg-white hover:bg-gray-50"
                              : "bg-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        {/* S.No */}
                        <td className="border-r border-white/50 h-8 text-center">
                          {index + 1}
                        </td>

                        {/* Name */}
                        <td className="border-r border-white/50 h-8">
                          <input
                            type="text"
                            className="text-left rounded py-1 px-2 w-full focus:outline-none focus:ring focus:border-blue-300 bg-transparent"
                            value={item?.name}
                            onChange={(e) =>
                              handleInputChange(e.target.value, index, "name")
                            }
                            onClick={(e) => e.stopPropagation()}
                            disabled={readOnly}
                          />
                        </td>

                        {/* File */}
                        <td className="border-r border-white/50 h-8 px-2">
                          <div className="flex items-center gap-2">
                            {!readOnly && (
                              <label
                                htmlFor={`modal-row-upload-${index}`}
                                className="cursor-pointer flex items-center justify-center p-1 bg-gray-100 rounded hover:bg-gray-200"
                                title="Attach file"
                                onClick={(e) => e.stopPropagation()}
                              >
                                📎
                                <input
                                  type="file"
                                  id={`modal-row-upload-${index}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      handleInputChange(
                                        renameFile(e.target.files[0]),
                                        index,
                                        "filePath",
                                      );
                                      e.target.value = "";
                                    }
                                  }}
                                  disabled={readOnly}
                                />
                              </label>
                            )}

                            {item.filePath ? (
                              <>
                                <span className="truncate max-w-[120px] text-green-700 font-medium">
                                  ✅ {item.filePath?.name ?? item.filePath}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPreview(item.filePath);
                                  }}
                                  className="text-blue-600 text-xs hover:underline"
                                >
                                  View
                                </button>
                                {!readOnly && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInputChange("", index, "filePath");
                                    }}
                                    className="text-red-600 text-xs"
                                    title="Remove file"
                                    disabled={readOnly}
                                  >
                                    ✕
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 italic text-xs">
                                No file
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="w-[30px] border-gray-200 h-8">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addNewComments();
                              }}
                              disabled={readOnly}
                              className="flex items-center px-1 bg-blue-50 rounded"
                            >
                              <Plus size={18} className="text-blue-800" />
                            </button>
                            <button
                              className="flex items-center px-1 bg-red-50 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRow(index);
                                if (selectedAttachmentIndex === index) {
                                  setSelectedAttachmentIndex(null);
                                }
                              }}
                              disabled={readOnly}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-red-800"
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  setAttachmentModal(false);
                  setSelectedAttachmentIndex(null);
                }}
                className="px-2 py-1 text-sm rounded bg-green-700 text-white hover:bg-green-800 border border-green-800"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {viewBoxModal && (
        <Modal
          isOpen={!!viewBoxModal}
          onClose={() => setViewBoxModal(null)}
          widthClass="p-4 w-[1350px] h-[80vh]"
        >
          <div className="flex flex-col space-y-3 p-2">
            <h2 className="text-base font-semibold text-slate-700 border-b pb-2">
              Box Details - {viewBoxModal}
            </h2>
            <div className="max-h-[65vh] overflow-y-auto">
              {(() => {
                const modalColumns = [
                  {
                    key: "sno",
                    label: "S No",
                    className:
                      "w-6 px-2 py-2 text-center font-semibold text-[11px]",
                  },
                  {
                    key: "poNo",
                    label: "PO No",
                    className:
                      "w-16 px-2 py-2 text-center font-semibold text-[11px]",
                  },
                  {
                    key: "itemName",
                    label: "Item Name",
                    className:
                      "w-32 px-2 py-2 text-center font-semibold text-[11px]",
                  },
                  {
                    key: "styleNo",
                    label: "Style No",
                    className:
                      "w-16 px-2 py-2 text-center font-semibold text-[11px]",
                  },
                  {
                    key: "hsn",
                    label: "HSN",
                    className:
                      "w-12 px-2 py-2 text-center font-semibold text-[11px]",
                  },
                  {
                    key: "printingDesign",
                    label: "Printing Design",
                    className:
                      "w-24 px-2 py-2 text-center font-semibold text-[11px]",
                  },
                  {
                    key: "size",
                    label: "Size",
                    className:
                      "w-12 px-2 py-2 text-center font-semibold text-[11px]",
                  },
                  {
                    key: "color",
                    label: "Color",
                    className:
                      "w-20 px-2 py-2 text-center font-semibold text-[11px]",
                  },
                  {
                    key: "uom",
                    label: "UOM",
                    className:
                      "w-12 px-2 py-2 text-center font-semibold text-[11px]",
                  },

                  {
                    key: "qrCode",
                    label: "QR Code",
                    className:
                      "w-16 px-2 py-2 text-center font-semibold text-[11px]",
                  },
                ];

                const currentBox = packingBoxItems.find(
                  (i) => i.boxCode === viewBoxModal,
                );

                const dataRows = currentBox?.packedItems || [];
                const rows = dataRows;

                return (
                  <div className="relative">
                    <TransactionGrid
                      title=""
                      columns={modalColumns}
                      rows={rows}
                      onRowContextMenu={(e, item, index) => {
                        if (!readOnly && item.isNewPackedItem) {
                          handleRightClick(e, index);
                        } else {
                          e.preventDefault();
                        }
                      }}
                      getRowClassName={(_, index) =>
                        `${index % 2 === 0 ? "bg-white" : "bg-gray-100"} border border-blue-gray-200 h-6`
                      }
                      renderRow={(row, index) => {
                        if (!row || !row.id) {
                          return (
                            <>
                              <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-center text-gray-400">
                                {index + 1}
                              </td>
                              <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                              <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                              <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                              <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                              <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                              <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                              <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                              <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                              <td className="border-blue-gray-200 text-[11px] border border-gray-300"></td>
                            </>
                          );
                        }
                        const item = row;
                        return (
                          <>
                            <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-center">
                              {index + 1}
                            </td>
                            <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-left px-1">
                              {item.Po?.docId || "-"}
                            </td>
                            <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-left px-1">
                              {item.ItemVariant?.styleMaster?.modelName?.name ||
                                "-"}
                            </td>
                            <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-left px-1">
                              {item.ItemVariant?.styleMaster?.styleNo || "-"}
                            </td>
                            <td className="border-blue-gray-200 text-black text-[11px] border border-gray-300 text-left px-1">
                              {item.Hsn?.name || "-"}
                            </td>
                            <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-left px-1">
                              {item.PrintingDesign?.name || "-"}
                            </td>
                            <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-left px-1">
                              {item.Size?.name || "-"}
                            </td>
                            <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-left px-1">
                              {item.Color?.name || "-"}
                            </td>
                            <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-left px-1">
                              {item.Uom?.name || "-"}
                            </td>

                            <td className="border-blue-gray-200 text-[11px] border border-gray-300 text-left px-1 font-medium text-indigo-600">
                              {item.qrCode}
                            </td>
                          </>
                        );
                      }}
                    />
                    {contextMenu && (
                      <div
                        style={{
                          position: "fixed",
                          top: `${contextMenu.mouseY - 20}px`,
                          left: `${contextMenu.mouseX + 20}px`,
                          boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                          padding: "8px",
                          borderRadius: "4px",
                          zIndex: 1000,
                        }}
                        className="bg-gray-100"
                        onMouseLeave={handleCloseContextMenu}
                      >
                        <div className="flex flex-col gap-1">
                          <button
                            className="text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
                            onClick={() => {
                              handleRemoveItemFromBox(
                                viewBoxModal,
                                contextMenu.rowId,
                              );
                              handleCloseContextMenu();
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </Modal>
      )}

      <TransactionLayout
        title="Packing"
        badge={<ModeChip id={id} readOnly={readOnly} />}
        closeIcon={<IoArrowBackCircleSharp className="w-7 h-7" />}
        onClose={onClose}
        onKeyDown={handleKeyDown}
        detailsLayout="default"
        detailsLayouts={["default"]}
        header={
          <div className="grid grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1.6fr)] items-start">
            <div className={cardClass}>
              <h2 className={sectionTitleClass}>Basic Details</h2>
              <div className="grid grid-cols-3 gap-1 gap-x-3 items-end md:grid-cols-3 xl:grid-cols-3">
                <div className={narrowFieldWrap}>
                  <ReusableInput
                    label="Packing No"
                    readOnly
                    value={docId}
                    className={`${fieldClass} ${fieldWidthMedium}`}
                  />
                </div>
                <div className={narrowFieldWrap}>
                  <ReusableInput
                    label="Date"
                    value={docDate}
                    type={"date"}
                    required={true}
                    readOnly={true}
                    disabled
                    className={`${fieldClass} ${fieldWidthDate}`}
                  />
                </div>
                <div className={narrowFieldWrap}>
                  <ReusableInput
                    label="User Date"
                    value={userDate}
                    setValue={setUserDate}
                    type={"date"}
                    required={true}
                    readOnly={readOnly}
                    disabled={readOnly}
                    className={`${fieldClass} ${fieldWidthDate}`}
                  />
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className={sectionTitleClass}>Supplier Details</h2>
              <div className="grid grid-cols-1 gap-1 gap-x-3 items-end md:grid-cols-1 xl:grid-cols-1">
                <div className={narrowFieldWrap}>
                  <DropdownWithModal
                    name="Supplier"
                    options={dropDownListObject(
                      id
                        ? supplierList?.data?.filter((item) => item?.isSupplier)
                        : supplierList?.data?.filter(
                            (item) => item?.active && item?.isSupplier,
                          ),
                      "name",
                      "id",
                    )}
                    value={supplierId}
                    setValue={setSupplierId}
                    required={true}
                    readOnly={readOnly}
                    className={modalFieldClass}
                    dropdownMinWidth={partyDropdownMinWidth}
                    // disabled={childRecord.current > 0}
                    addNewLabel="+ Add New Supplier"
                    childComponent={PartyMaster}
                    addNewModalWidth="w-[90%] h-[95%]"
                    disabled={id || !!fromPoSupplierId}
                    ref={supplierRef}
                  />
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className={sectionTitleClass}>Packing Info</h2>
              <div className="grid grid-cols-1 gap-1 gap-x-3 items-end md:grid-cols-4 xl:grid-cols-4">
                <div className={narrowFieldWrap}>
                  <DropdownInput
                    name="Branch"
                    options={
                      branchList
                        ? dropDownListObject(
                            id
                              ? branchList?.data
                              : branchList?.data?.filter((item) => item.active),
                            "branchName",
                            "id",
                          )
                        : []
                    }
                    value={locationId}
                    setValue={(value) => {
                      setLocationId(value);
                      setStoreId("");
                    }}
                    required={true}
                    readOnly={id}
                    // autoFocus={true}

                    className={`${fieldClass} w-full max-w-none`}
                  />
                </div>
                <div className={narrowFieldWrap}>
                  <DropdownWithModal
                    name="Location"
                    options={dropDownListObject(
                      id
                        ? storeOptions
                        : storeOptions?.filter((item) => item?.active),
                      "storeName",
                      "id",
                    )}
                    value={storeId}
                    setValue={setStoreId}
                    required={true}
                    readOnly={readOnly}
                    className={`${modalFieldClass} w-full max-w-none`}
                    dropdownMinWidth={partyDropdownMinWidth}
                    // disabled={childRecord.current > 0}
                    addNewLabel="+ Add New Location"
                    childComponent={LocationMaster}
                    addNewModalWidth="w-[40%] h-[48%]"
                    disabled={id}
                  />
                </div>

                <div
                  className={`${narrowFieldWrap} relative group -mt-4 rounded-lg p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md`}
                >
                  <div className="h-full rounded-md bg-white p-1.5 flex flex-col justify-center">
                    <label className="mb-1 flex items-center gap-1.5 text-[12px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-wide">
                      <QrCode className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                      Box QR Code Scan
                    </label>
                    <input
                      type="text"
                      className={`${fieldClass} w-full rounded border-2 border-purple-200 bg-purple-50/50 px-2 py-1 text-xs font-bold text-slate-800 placeholder-purple-300 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-300 transition-all`}
                      placeholder="Scan Box Code..."
                      value={boxCodeInput}
                      onChange={(e) => setBoxCodeInput(e.target.value)}
                      onKeyDown={handleBoxQrSubmit}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div
                  className={`${narrowFieldWrap} relative group -mt-4 rounded-lg p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md`}
                >
                  <div className="h-full rounded-md bg-white p-1.5 flex flex-col justify-center">
                    <label className="mb-1 flex items-center gap-1.5 text-[12px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-wide">
                      <QrCode className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                      Item QR Code Scan
                    </label>
                    <input
                      type="text"
                      className={`${fieldClass} w-full rounded border-2 border-purple-200 bg-purple-50/50 px-2 py-1 text-xs font-bold text-slate-800 placeholder-purple-300 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-300 transition-all`}
                      placeholder="Scan QR here..."
                      value={qrCodeInput}
                      onChange={(e) => setQrCodeInput(e.target.value)}
                      onKeyDown={handleQrSubmit}
                      disabled={readOnly || isQrLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        gridItems={
          <div className="flex flex-col gap-3 p-1 w-full max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {packingBoxItems.map((boxData, index) => {
                const boxCode = boxData.boxCode;

                if (!boxCode) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="border border-dashed rounded-md p-2 border-slate-300 bg-slate-50 flex flex-col items-center justify-center min-h-[100px] opacity-60"
                    >
                      <p className="text-slate-400 font-medium text-xs mb-1">
                        Slot {index + 1}
                      </p>
                      <p className="text-slate-400 text-[9px] text-center">
                        Awaiting Scan
                      </p>
                    </div>
                  );
                }
                const packedItems = boxData.packedItems || [];
                const isActive = activeBoxCode === boxCode;

                const groupedItems = packedItems.reduce((acc, curr) => {
                  if (curr.id && curr.itemName) {
                    acc[curr.itemName] = (acc[curr.itemName] || 0) + 1;
                  }
                  return acc;
                }, {});

                return (
                  <div
                    key={boxCode}
                    className={`border rounded-md p-2 flex flex-col min-h-[100px] ${isActive ? "border-indigo-500 bg-indigo-50 shadow" : "border-slate-300 bg-white"}`}
                  >
                    <div className="flex justify-between items-center mb-2 border-b pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-xs text-slate-700">
                          📦 {boxCode}
                        </h3>
                        {isActive && (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        )}
                        <button
                          onClick={() => setViewBoxModal(boxCode)}
                          className="ml-1 p-1 text-slate-400 hover:text-indigo-600 transition"
                          title="View Details"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                        </button>
                        {boxData.isNew && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBox(boxCode);
                            }}
                            className="ml-1 p-1 text-slate-400 hover:text-red-600 transition"
                            title="Remove Box"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {isActive ? (
                        <button
                          onClick={() => {
                            setActiveBoxCode(null);
                            setActiveBoxId(null);
                          }}
                          className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-semibold rounded hover:bg-red-600 shadow-sm transition"
                        >
                          Close Box
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveBoxCode(boxCode);
                            setActiveBoxId(boxData.boxId);
                          }}
                          disabled={
                            !!activeBoxCode ||
                            readOnly ||
                            (!!id && !boxData.isNew)
                          }
                          className={`px-1.5 py-0.5 text-white text-[10px] font-semibold rounded shadow-sm transition ${!!activeBoxCode || readOnly || (!!id && !boxData.isNew) ? "bg-slate-300 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600"}`}
                        >
                          Open Box
                        </button>
                      )}
                    </div>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-slate-200">
                      {Object.keys(groupedItems).length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic text-center py-2">
                          No items yet.
                        </p>
                      ) : null}
                      {Object.entries(groupedItems).map(
                        ([itemName, qty], idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-[10px] p-1 bg-white border border-slate-100 rounded shadow-sm"
                          >
                            <span className="font-medium text-slate-700 truncate max-w-[70%]">
                              {itemName}
                            </span>
                            <span className="text-indigo-600 font-bold bg-indigo-100 px-1.5 py-0.5 rounded">
                              x{qty}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        }
        footer={
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 xl:grid-cols-[minmax(0,3.6fr)_minmax(0,5.0fr)_minmax(0,3.4fr)] mt-1 shrink-0">
              <div className="flex h-full flex-col rounded-md border border-slate-200 bg-white p-1.5 shadow-sm">
                <h2 className="mb-1 text-[12px] font-bold text-slate-700">
                  Vehicle Details
                </h2>
                <textarea
                  ref={vehicleRef}
                  readOnly={readOnly}
                  value={vehicleNo}
                  onChange={(e) => {
                    setVehicleNo(e.target.value);
                  }}
                  className="min-h-[2.5rem] focus:outline-none flex-1 w-full overflow-auto rounded-md border border-slate-300 px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                  placeholder="Vehicle Details..."
                  disabled={readOnly}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === "Enter") {
                      e.preventDefault();

                      const textarea = e.target;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;

                      const newValue =
                        vehicleNo.substring(0, start) +
                        "\n" +
                        vehicleNo.substring(end);

                      setVehicleNo(newValue);

                      // ✅ Restore focus + cursor properly
                      requestAnimationFrame(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 1, start + 1);
                      });
                    }
                  }}
                />
              </div>

              <div className="flex h-full flex-col rounded-md border border-slate-200 bg-white p-1.5 shadow-sm xl:col-span-2">
                <h2 className="mb-1 text-[12px] font-bold text-slate-700">
                  Remarks
                </h2>
                <textarea
                  readOnly={readOnly}
                  value={remarks}
                  onChange={(e) => {
                    setRemarks(e.target.value);
                  }}
                  className="min-h-[2.5rem] focus:outline-none flex-1 w-full overflow-auto rounded-md border border-slate-300 px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                  placeholder="Additional notes..."
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === "Enter") {
                      e.preventDefault();

                      const textarea = e.target;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;

                      const newValue =
                        remarks.substring(0, start) +
                        "\n" +
                        remarks.substring(end);

                      setRemarks(newValue);

                      // ✅ Restore focus + cursor properly
                      requestAnimationFrame(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 1, start + 1);
                      });
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 justify-between mt-4"></div>
            <TransactionActions
              leftActions={[
                ...(!readOnly
                  ? [
                      {
                        key: "save-close",
                        icon: (
                          <span className="flex items-center gap-1">
                            <FiSave className="h-3.5 w-3.5" />
                            <HiX className="h-3.5 w-3.5" />
                          </span>
                        ),
                        hoverLabel: "Save & Close",
                        iconOnly: true,
                        onClick: () => saveData("close"),
                        onKeyDown: (e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveData("close");
                            e.stopPropagation();
                          }
                        },
                        disabled: readOnly,
                        className: `bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-md flex items-center justify-center text-sm text-white transition`,
                      },
                      {
                        key: "save-new",
                        icon: (
                          <span className="flex items-center gap-1">
                            <FiSave className="h-3.5 w-3.5" />
                            <HiOutlineRefresh className="h-3.5 w-3.5" />
                          </span>
                        ),
                        hoverLabel: "Save & New",
                        iconOnly: true,
                        onClick: () => saveData("new"),
                        onKeyDown: (e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            saveData("new");
                          }
                        },
                        disabled: readOnly,
                        className: `bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-md flex items-center justify-center text-sm text-white transition`,
                      },
                    ]
                  : []),
              ]}
              rightActions={[
                ...(!id || readOnly
                  ? [
                      {
                        key: "edit",
                        icon: <FiEdit2 className="h-3.5 w-3.5" />,
                        hoverLabel: "Edit",
                        iconOnly: true,
                        onClick: () => setReadOnly(false),
                        className: `bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-md flex items-center justify-center text-sm text-white transition`,
                      },
                    ]
                  : []),
                {
                  key: "upload",
                  icon: <FiPaperclip className="h-3.5 w-3.5" />,
                  hoverLabel: "Upload",
                  iconOnly: true,
                  onClick: () => {
                    setSelectedAttachmentIndex(null);
                    setAttachmentModal(true);
                  },
                  className: `bg-slate-600 hover:bg-slate-700 px-3 py-2 rounded-md flex items-center justify-center text-sm text-white transition`,
                },
              ]}
            />
          </>
        }
      />
    </>
  );
};
export default PackingForm;
