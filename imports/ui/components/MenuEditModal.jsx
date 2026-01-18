import React, { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import Modal from "./Modal.jsx";

export default function MenuEditModal({
                                        open,
                                        onClose,
                                        mode, // "create" | "edit"
                                        shopId,
                                        menu, // { _id, name }
                                        onDeleted,
                                      }) {
  const isEdit = mode === "edit";
  const [name, setName] = useState("");

  useEffect(() => {
    setName(menu?.name || "");
  }, [menu?._id, open]);

  const canSave = name.trim().length > 0;

  const save = () => {
    const n = name.trim();
    if (!n) return;

    if (isEdit) {
      Meteor.call("menus.updateName", menu._id, n, (err) => {
        if (err) return alert(err.reason || err.message);
        onClose();
      });
    } else {
      Meteor.call("menus.insert", shopId, n, (err) => {
        if (err) return alert(err.reason || err.message);
        onClose();
      });
    }
  };

  const remove = () => {
    if (!menu?._id) return;
    Meteor.call("menus.remove", menu._id, (err) => {
      if (err) return alert(err.reason || err.message);
      onDeleted?.();
      onClose();
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Menu" : "Add Menu"}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-neutral-900 mb-2">
            Menu Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Americano"
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
            Delete Menu
          </button>
        ) : null}
      </div>
    </Modal>
  );
}
