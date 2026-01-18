import React, { useMemo, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { useNavigate, useParams } from "react-router-dom";

import { Shops } from "/imports/api/shops";
import { Menus } from "/imports/api/menus";

import TopBar from "../components/TopBar.jsx";
import SwipeRow from "../components/SwipeRow.jsx";
import MenuEditModal from "../components/MenuEditModal.jsx";

import { ShareIcon } from "@heroicons/react/24/outline";

function ShareModal({ open, url, onClose }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      window.prompt("복사해서 공유해줘:", url);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-label="Close share modal"
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-xl px-4 pb-4">
        <div className="rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-900 inset-ring inset-ring-gray-200 dark:inset-ring-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              공유하기
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-50 dark:hover:bg-white/10"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="mt-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              링크
            </div>
            <input
              readOnly
              value={url}
              className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm text-gray-900 shadow-xs inset-ring inset-ring-gray-300
                dark:bg-gray-950/40 dark:text-white dark:inset-ring-white/10"
            />
          </div>

          <div className="mt-4 flex gap-x-2">
            <button
              type="button"
              onClick={copy}
              className="flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500
                dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              {copied ? "복사됨" : "링크 복사"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50
                dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
            >
              닫기
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ShopMenusPage() {
  const navigate = useNavigate();
  const { shopId } = useParams();

  const { ready, shop, menus } = useTracker(() => {
    const subShop = Meteor.subscribe("shops.all");
    const subMenus = Meteor.subscribe("menus.byShop", shopId);

    return {
      ready: subShop.ready() && subMenus.ready(),
      shop: Shops.findOne({ _id: shopId }),
      // 메뉴는 createdAt 정렬 권장
      menus: Menus.find({ shopId }, { sort: { createdAt: -1 } }).fetch(),
    };
  }, [shopId]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMenu, setEditMenu] = useState(null);

  const openCreate = () => {
    setEditMenu(null);
    setModalOpen(true);
  };

  const openEdit = (menu) => {
    setEditMenu(menu);
    setModalOpen(true);
  };

  const removeMenu = (menuId) => {
    Meteor.call("menus.remove", menuId, (err) => {
      if (err) alert(err.reason || err.message);
    });
  };

  const inc = (id) => {
    Meteor.call("menus.incCount", id, 1, (err) => {
      if (err) alert(err.reason || err.message);
    });
  };

  const dec = (id) => {
    Meteor.call("menus.incCount", id, -1, (err) => {
      if (err) alert(err.reason || err.message);
    });
  };

  const resetCounts = () => {
    const ok = window.confirm("모든 수량을 0으로 초기화할까요?");
    if (!ok) return;

    Meteor.call("menus.resetCountsByShop", shopId, (err) => {
      if (err) alert(err.reason || err.message);
    });
  };

  const title = shop?.name || "메뉴";

  const currentUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  const [shareOpen, setShareOpen] = useState(false);

  const onShare = async () => {
    const url = currentUrl;
    if (!url) return;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return; // 성공: 여기서 끝
      } catch (e) {
        // 사용자가 공유 시트를 "취소/닫기" 한 경우: fallback 띄우지 않음
        const name = e?.name || "";
        const msg = String(e?.message || "");

        if (
          name === "AbortError" ||
          name === "NotAllowedError" || // 일부 브라우저에서 취소/권한 관련
          /abort/i.test(msg) ||
          /cancel/i.test(msg) ||
          /cancell/i.test(msg)
        ) {
          return;
        }

        // 그 외(진짜 실패)만 fallback
      }
    }

    setShareOpen(true);
  };


  return (
    <div>
      <TopBar
        title={title}
        onBack={() => navigate("/")}
        right={
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center justify-center rounded-full p-2 bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition"
            aria-label="Share"
          >
            <ShareIcon className="size-5" />
          </button>
        }
      />

      <div className="mt-8">
        <ul role="list" className="grid grid-cols-1 gap-8">
          {ready && menus.length === 0 ? (
            <li className="py-12 text-center text-sm text-neutral-500">
              No menus yet. Click the + button to add.
            </li>
          ) : null}

          {menus.map((menu) => {
            const c = menu.count || 0;

            return (
              <li key={menu._id} className="group relative border-t border-neutral-100 pt-6 transition hover:border-neutral-300">
                <SwipeRow
                  actionWidth={160}
                  renderActions={({ close }) => (
                    <div className="flex items-center gap-2 pl-4 h-full">
                      <button
                        type="button"
                        onClick={() => {
                          close();
                          openEdit(menu);
                        }}
                        className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-200 transition"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          close();
                          const ok = window.confirm("Delete this menu?");
                          if (!ok) return;
                          removeMenu(menu._id);
                        }}
                        className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                >
                  <div className="flex items-center gap-x-4">
                    <div className="w-12 shrink-0 text-center">
                      <div className="text-xl font-bold tabular-nums text-neutral-950 font-display">
                        {c}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                        Count
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-neutral-950 text-lg leading-tight break-words">
                        {menu.name}
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-y-1">
                      <div className="flex items-center gap-x-3">
                        <button
                          type="button"
                          onClick={() => dec(menu._id)}
                          className="size-10 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition text-xl font-medium"
                          aria-label="decrease"
                        >
                          −
                        </button>

                        <button
                          type="button"
                          onClick={() => inc(menu._id)}
                          className="size-10 flex items-center justify-center rounded-full bg-neutral-950 text-white hover:bg-neutral-800 transition text-xl font-medium"
                          aria-label="increase"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* swipe hint */}
                      <div className="text-[10px] leading-none text-neutral-400 select-none">
                        swipe
                      </div>
                    </div>

                  </div>
                </SwipeRow>
              </li>
            );
          })}
        </ul>

        {/* Action Buttons */}
        <div className="mt-12 space-y-4 border-t border-neutral-100 pt-8">
          <button
            type="button"
            onClick={openCreate}
            className="w-full rounded-2xl bg-neutral-950 py-4 text-sm font-bold text-white hover:bg-neutral-800 transition"
          >
            Add New Menu
          </button>

          <button
            type="button"
            onClick={resetCounts}
            className="w-full rounded-2xl bg-white py-4 text-sm font-bold text-red-600 border border-neutral-200 hover:bg-red-50 transition"
          >
            Reset All Counts
          </button>
        </div>
      </div>

      <MenuEditModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editMenu ? "edit" : "create"}
        shopId={shopId}
        menu={editMenu}
      />

      <ShareModal
        open={shareOpen}
        url={currentUrl}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
