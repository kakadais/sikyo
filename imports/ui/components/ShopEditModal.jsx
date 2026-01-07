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
      title={isEdit ? "음식점 수정" : "음식점 추가"}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
            음식점명
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 김밥천국"
            className="mt-2 w-full rounded-xl bg-white px-3 py-2 text-sm text-gray-900 shadow-xs inset-ring inset-ring-gray-300 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
              dark:bg-white/10 dark:text-white dark:inset-ring-white/10 dark:focus-visible:outline-indigo-500"
          />
        </div>

        <div className="flex gap-x-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50
              dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
          >
            취소
          </button>

          <button
            type="button"
            disabled={!canSave}
            onClick={save}
            className="flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-40
              dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            저장
          </button>
        </div>

        {isEdit ? (
          <button
            type="button"
            onClick={remove}
            className="w-full rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 inset-ring inset-ring-red-600/20 hover:bg-red-100
              dark:bg-red-900/30 dark:text-red-400 dark:inset-ring-red-500/20 dark:hover:bg-red-900/40"
          >
            삭제
          </button>
        ) : null}
      </div>
    </Modal>
  );
}
