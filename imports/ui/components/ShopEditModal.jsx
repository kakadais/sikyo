import React, { useEffect, useMemo, useState } from "react";
import { Meteor } from "meteor/meteor";
import Modal from "./Modal.jsx";

export default function ShopEditModal({
                                        open,
                                        onClose,
                                        mode, // "create" | "edit"
                                        shop, // { _id, name }
                                        onDeleted, // optional callback after delete
                                      }) {
  const isEdit = mode === "edit";
  const [name, setName] = useState("");

  useEffect(() => {
    setName(shop?.name || "");
  }, [shop?._id, open]);

  const canSave = name.trim().length > 0;

  const save = () => {
    const n = name.trim();
    if (!n) return;

    if (isEdit) {
      Meteor.call("shops.updateName", shop._id, n, (err) => {
        if (err) return alert(err.reason || err.message);
        onClose();
      });
    } else {
      Meteor.call("shops.insert", n, (err) => {
        if (err) return alert(err.reason || err.message);
        onClose();
      });
    }
  };

  const remove = () => {
    if (!shop?._id) return;
    const ok = window.confirm("음식점을 삭제할까요?");
    if (!ok) return;

    Meteor.call("shops.remove", shop._id, (err) => {
      if (err) return alert(err.reason || err.message);
      onDeleted?.();
      onClose();
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Restaurant" : "Add Restaurant"}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-neutral-900 mb-2">
            Restaurant Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sushi Place"
            className="w-full rounded-xl bg-neutral-50 px-4 py-3 text-base text-neutral-900 border border-neutral-200 focus:outline-none focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 transition"
          />
        </div>

        <div className="flex gap-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-900 hover:bg-neutral-200 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canSave}
            onClick={save}
            className="flex-1 rounded-full bg-neutral-950 px-4 py-3 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Save
          </button>
        </div>

        {isEdit ? (
          <button
            type="button"
            onClick={remove}
            className="w-full rounded-full bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100 transition"
          >
            Delete Restaurant
          </button>
        ) : null}
      </div>
    </Modal>
  );
}
