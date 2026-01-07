import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { useNavigate } from "react-router-dom";

import { Shops } from "/imports/api/shops";

import TopBar, { IconButton, Icons } from "../components/TopBar.jsx";
import SwipeRow from "../components/SwipeRow.jsx";
import ShopEditModal from "../components/ShopEditModal.jsx";

export default function ShopsPage() {
  const navigate = useNavigate();

  const { ready, shops } = useTracker(() => {
    const sub = Meteor.subscribe("shops.all");
    return {
      ready: sub.ready(),
      shops: Shops.find({}, { sort: { updatedAt: -1 } }).fetch(),
    };
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editShop, setEditShop] = useState(null);

  const openCreate = () => {
    setEditShop(null);
    setModalOpen(true);
  };

  const openEdit = (shop) => {
    setEditShop(shop);
    setModalOpen(true);
  };

  const removeShop = (shopId) => {
    Meteor.call("shops.remove", shopId, (err) => {
      if (err) alert(err.reason || err.message);
    });
  };

  return (
    <div className="mx-auto max-w-xl">
      <TopBar
        title="SIKYO"
        right={
          <IconButton
            label="Add shop"
            icon={Icons.PlusIcon}
            onClick={openCreate}
          />
        }
      />

      <div className="px-4 py-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          음식점 목록
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl bg-white inset-ring inset-ring-gray-200 dark:bg-gray-900 dark:inset-ring-white/10">
          <ul role="list" className="divide-y divide-gray-100 dark:divide-white/10">
            {ready && shops.length === 0 ? (
              <li className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                아직 음식점이 없어요. 우측 상단 + 로 추가해줘.
              </li>
            ) : null}

            {shops.map((shop) => (
              <li key={shop._id} className="bg-white dark:bg-gray-900">
                <SwipeRow
                  actionWidth={152}
                  renderActions={({ close }) => (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          close();
                          openEdit(shop);
                        }}
                        className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50
                          dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
                      >
                        수정
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          close();
                          const ok = window.confirm("음식점을 삭제할까요?");
                          if (!ok) return;
                          removeShop(shop._id);
                        }}
                        className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 inset-ring inset-ring-red-600/20 hover:bg-red-100
                          dark:bg-red-900/30 dark:text-red-400 dark:inset-ring-red-500/20 dark:hover:bg-red-900/40"
                      >
                        삭제
                      </button>
                    </>
                  )}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/shops/${shop._id}`)}
                    className="w-full px-4 py-5 flex items-center justify-between gap-x-3 text-left hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <div className="min-w-0">
                      <div className="text-sm/6 font-semibold text-gray-900 dark:text-white truncate">
                        {shop.name}
                      </div>
                      <div className="mt-1 text-xs/5 text-gray-500 dark:text-gray-400">
                        탭해서 메뉴 보기
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                      스와이프
                    </div>
                  </button>
                </SwipeRow>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={openCreate}
            className="flex w-full items-center justify-center px-3 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 border-t border-gray-100
              dark:text-white dark:hover:bg-white/5 dark:border-white/10"
          >
            음식점 추가
          </button>
        </div>
      </div>

      <ShopEditModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editShop ? "edit" : "create"}
        shop={editShop}
      />
    </div>
  );
}
