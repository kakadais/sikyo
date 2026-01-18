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
    <div>
      <TopBar
        title="Restaurants"
        right={
          <IconButton
            label="Add shop"
            icon={Icons.PlusIcon}
            onClick={openCreate}
          />
        }
      />

      <div className="mt-8">
        <ul role="list" className="grid grid-cols-1 gap-8">
          {ready && shops.length === 0 ? (
            <li className="py-12 text-center text-sm text-neutral-500">
              No restaurants yet. Click the + button to add one.
            </li>
          ) : null}

          {shops.map((shop) => (
            <li key={shop._id} className="group relative border-t border-neutral-100 pt-6 transition hover:border-neutral-300">
              <SwipeRow
                actionWidth={160}
                renderActions={({ close }) => (
                  <div className="flex items-center gap-2 pl-4 h-full">
                    <button
                      type="button"
                      onClick={() => {
                        close();
                        openEdit(shop);
                      }}
                      className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-200 transition"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        close();
                        const ok = window.confirm("Delete this shop?");
                        if (!ok) return;
                        removeShop(shop._id);
                      }}
                      className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate(`/shops/${shop._id}`)}
                    className="flex-1 text-left"
                  >
                    <h3 className="font-display text-lg font-bold text-neutral-950 group-hover:text-neutral-700 transition">
                      {shop.name}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Tap to view menu
                    </p>
                  </button>

                  <div className="text-[10px] leading-none text-neutral-400 select-none ml-4">
                    swipe
                  </div>
                </div>
              </SwipeRow>
            </li>
          ))}
        </ul>

        {ready && shops.length > 0 && (
          <div className="mt-10 border-t border-neutral-100 pt-6">
             <button
              type="button"
              onClick={openCreate}
              className="w-full rounded-2xl bg-neutral-50 py-4 text-sm font-semibold text-neutral-500 hover:bg-neutral-100 transition"
            >
              Add another restaurant
            </button>
          </div>
        )}
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
